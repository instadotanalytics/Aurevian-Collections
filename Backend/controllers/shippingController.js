// backend/controllers/shippingController.js

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import Seller from "../models/Seller.js"; // ✅ NEW
import shiprocketService, {
  ShiprocketError,
} from "../services/shiprocketService.js";

// ============================================
// SOCKET.IO IMPORTS
// ============================================
import { emitShippingUpdated } from "../socket/orderEvents.js";

const UNIT_TO_KG = { g: 0.001, kg: 1, oz: 0.0283495, lb: 0.453592 };

// ✅ NEW — flat free-shipping threshold. Applied inside
// calculateShippingRate() only, which is the single function already
// shared by the cart shipping-quote endpoint and order creation, so
// cart/checkout/order creation can never disagree about it.
const FREE_SHIPPING_THRESHOLD = 999;

// ============================================
// STATUS MAPPING
// ============================================
const TERMINAL_ORDER_STATUSES = ["delivered", "cancelled", "returned"];

function mapShiprocketStatus(rawStatus) {
  const s = (rawStatus || "").toUpperCase();
  if (s.includes("DELIVERED")) return "delivered";
  if (s.includes("OUT FOR DELIVERY")) return "out_for_delivery";
  if (s.includes("IN TRANSIT")) return "in_transit";
  if (s.includes("PICKED UP") || s.includes("SHIPPED")) return "shipped";
  if (
    s.includes("PICKUP SCHEDULED") ||
    s.includes("PICKUP GENERATED") ||
    s.includes("READY TO SHIP")
  )
    return "ready_to_ship";
  if (s.includes("RTO")) return "rto";
  if (s.includes("CANCEL")) return "cancelled";
  if (s.includes("RETURN")) return "return_initiated";
  return "processing";
}

function cleanShiprocketError(res, error, fallbackMessage) {
  console.error("❌ Shiprocket error:", error?.message, error?.details || "");
  const statusCode =
    error?.statusCode && error.statusCode < 500 && error.statusCode >= 400
      ? error.statusCode
      : 500;
  return res
    .status(statusCode)
    .json({ success: false, message: fallbackMessage });
}

function isOwnerOrAdmin(order, req) {
  const userId = (req.user._id || req.user.id).toString();
  const isOwner = order.user.toString() === userId;
  const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
  return { isOwner, isAdmin, allowed: isOwner || isAdmin };
}

// ============================================
// ✅ RESOLVE THE SELLER THAT OWNS AN ORDER'S ITEMS
// Shipment creation is one Shiprocket shipment per Aurevian order, which
// only works if every item in that order belongs to the same seller (this
// was already implicitly assumed by the old single-global-address code —
// it summed every item's weight into one payload). We now make that
// assumption explicit and fail loudly instead of silently picking one
// seller's address for a mixed-seller order.
// ✅ CHANGED — exported so returnController.js can reuse it for reverse
// pickups instead of duplicating the seller-resolution logic.
// ============================================
export async function resolveOrderSeller(order) {
  const sellerIds = [
    ...new Set(
      (order.items || []).map((i) => i.seller?.toString()).filter(Boolean),
    ),
  ];

  if (sellerIds.length === 0) {
    const err = new Error(
      "Order has no seller assigned to its items — cannot determine a pickup address",
    );
    err.status = 400;
    throw err;
  }

  if (sellerIds.length > 1) {
    const err = new Error(
      "This order contains items from multiple sellers. Multi-seller shipment splitting is not supported yet — split this order by seller before shipping it.",
    );
    err.status = 400;
    throw err;
  }

  const seller = await Seller.findById(sellerIds[0]).select(
    "pickupAddress storeInfo email",
  );
  if (!seller) {
    const err = new Error("Seller not found for this order's items");
    err.status = 404;
    throw err;
  }

  return seller;
}

// ============================================
// ✅ PICKUP LOCATION VALIDATION (PER SELLER)
// Confirms the seller's saved pickup address was actually registered with
// Shiprocket (isRegisteredWithShiprocket + a nickname on the seller doc),
// and — where possible — cross-checks that nickname still exists on the
// Shiprocket account. Replaces the old single env-var check.
// ✅ CHANGED — exported so returnController.js can reuse it for reverse
// pickups instead of duplicating the validation logic.
// ============================================
let pickupLocationsCache = { names: null, fetchedAt: 0 };
const PICKUP_CACHE_TTL_MS = 10 * 60 * 1000;

async function getRegisteredPickupLocationNames() {
  const now = Date.now();
  const cacheStale =
    !pickupLocationsCache.names ||
    now - pickupLocationsCache.fetchedAt > PICKUP_CACHE_TTL_MS;

  if (cacheStale) {
    try {
      const result = await shiprocketService.getPickupLocations();
      const addresses = result?.data?.shipping_address || [];
      pickupLocationsCache = {
        names: addresses.map((a) => a.pickup_location),
        fetchedAt: now,
      };
    } catch (err) {
      // Can't verify right now (network/auth issue) — don't block the
      // flow on this check. The real create call will surface the real
      // error if the nickname truly doesn't exist.
      console.error(
        "⚠️ Could not fetch Shiprocket pickup locations for validation:",
        err.message,
      );
      return null;
    }
  }

  return pickupLocationsCache.names;
}

export async function assertSellerPickupLocationRegistered(seller) {
  const nickname = seller.pickupAddress?.shiprocketPickupLocationName;

  if (!seller.pickupAddress?.isRegisteredWithShiprocket || !nickname) {
    const err = new Error(
      "This seller has not set up a pickup address yet. Ask the seller to add one in Seller Dashboard > Pickup Address before shipping their orders.",
    );
    err.status = 400;
    throw err;
  }

  const names = await getRegisteredPickupLocationNames();
  if (names && !names.includes(nickname)) {
    const err = new Error(
      `SELLER_PICKUP_LOCATION "${nickname}" is not registered with Shiprocket (it may have been removed from the Shiprocket dashboard). ` +
        `Ask the seller to re-save their pickup address in Seller Dashboard > Pickup Address so it can be re-registered.`,
    );
    err.status = 500;
    throw err;
  }
}

// ============================================
// WEIGHT HELPER
// ============================================
export function getItemWeightKg(product) {
  const weightVal = product?.shipping?.weight?.value;
  const weightUnit = product?.shipping?.weight?.unit || "g";
  if (!weightVal) return 0.05;
  return weightVal * (UNIT_TO_KG[weightUnit] || 0.001);
}

// ============================================
// PINCODE VALIDATION
// ============================================
export function isValidIndianPincode(pincode) {
  const str = String(pincode ?? "").trim();
  return /^\d{6}$/.test(str);
}

// ============================================
// SHIPPING UNAVAILABLE ERROR
// ============================================
export class ShippingUnavailableError extends Error {
  constructor(
    message = "Sorry, delivery is currently unavailable for this pincode.",
  ) {
    super(message);
    this.name = "ShippingUnavailableError";
    this.status = 400;
  }
}

// ============================================
// CALCULATE SHIPPING RATE
// pickupPincode is a REQUIRED parameter supplied by the caller from the
// relevant seller's saved pickup address. There is no env-var fallback:
// if the caller can't determine a seller pickup pincode, it must not call
// this function.
// ✅ CHANGED — accepts `itemsTotal` and applies the ₹999 free-shipping
// threshold here, in the one function every shipping-fee call site (cart
// quote, Razorpay order creation, COD order creation) already funnels
// through — so the rule can never be applied inconsistently.
// ============================================
export async function calculateShippingRate({
  deliveryPincode,
  pickupPincode,
  weightKg,
  paymentMethod, // "cod" | "prepaid"
  itemsTotal = 0,
}) {
  if (!isValidIndianPincode(deliveryPincode)) {
    const err = new Error("A valid 6-digit delivery pincode is required");
    err.status = 400;
    throw err;
  }

  if (!isValidIndianPincode(pickupPincode)) {
    const err = new Error(
      "A valid seller pickup pincode is required to calculate shipping",
    );
    err.status = 400;
    throw err;
  }

  const weight = Math.max(Number(weightKg) || 0, 0.1).toFixed(3);
  const cod = paymentMethod === "cod" ? 1 : 0;

  const result = await shiprocketService.checkServiceability({
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight,
    cod,
  });

  const couriers = result?.data?.available_courier_companies || [];
  if (!couriers.length) {
    throw new ShippingUnavailableError();
  }

  const recommendedId = result?.data?.recommended_courier_company_id;
  let chosen = recommendedId
    ? couriers.find((c) => c.courier_company_id === recommendedId)
    : null;

  if (!chosen) {
    chosen = couriers.reduce(
      (min, c) => (Number(c.rate) < Number(min.rate) ? c : min),
      couriers[0],
    );
  }

  const isFreeShipping = Number(itemsTotal) >= FREE_SHIPPING_THRESHOLD;

  return {
    shippingFee: isFreeShipping ? 0 : Math.round(Number(chosen.rate)),
    courierId: chosen.courier_company_id,
    courierName: chosen.courier_name,
    estimatedDeliveryDays: chosen.estimated_delivery_days,
    codAvailable: !!chosen.cod,
    freeShipping: isFreeShipping,
  };
}

// ============================================
// INTERNAL HELPER — ASSIGN AWB FOR AN ORDER
// ============================================
async function assignAWBForOrder(order, courierId) {
  if (order.shipping?.awbCode) {
    return { alreadyAssigned: true, awbCode: order.shipping.awbCode };
  }
  if (!order.shipping?.shipmentId) {
    throw new Error("No Shiprocket shipment exists for this order yet");
  }

  const body = { shipment_id: Number(order.shipping.shipmentId) };
  if (courierId) body.courier_id = Number(courierId);

  const result = await shiprocketService.assignAWB(body);
  const awbData = result?.response?.data;

  if (!awbData?.awb_code) {
    const reason =
      awbData?.message ||
      result?.message ||
      (result?.response?.data?.errors &&
        JSON.stringify(result.response.data.errors)) ||
      "AWB generation failed";
    throw new ShiprocketError(reason, 502, result);
  }

  order.shipping.awbCode = awbData.awb_code;
  order.shipping.courierName = awbData.courier_name;
  order.shipping.courierId = awbData.courier_company_id
    ? String(awbData.courier_company_id)
    : courierId
      ? String(courierId)
      : undefined;
  order.shipping.trackingUrl = `https://shiprocket.co/tracking/${awbData.awb_code}`;
  order.shipping.status = "AWB ASSIGNED";
  order.shipping.lastSyncedAt = new Date();
  await order.save();

  emitShippingUpdated(order);

  return { alreadyAssigned: false, awbCode: awbData.awb_code };
}

// ============================================
// CREATE SHIPROCKET SHIPMENT FOR AN AUREVIAN ORDER
// ✅ CHANGED — idempotent AND resumable:
//  - If a shipment already exists, never recreate it (unchanged
//    behavior) — but if AWB assignment didn't complete last time,
//    finish that step now instead of silently no-op'ing forever.
//  - Tracks order.shipping.syncStatus/syncError/lastSyncAttemptAt/
//    syncedAt throughout, independent of fulfillmentStatus.
// ============================================
export async function createShipmentForOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // ✅ Idempotent: never create a second Shiprocket order for the same
  // Aurevian order. Resume AWB assignment if it's the only thing missing.
  if (order.shipping?.shiprocketOrderId) {
    if (!order.shipping.awbCode) {
      try {
        await assignAWBForOrder(order);
        order.shipping.syncStatus = "synced";
        order.shipping.syncError = undefined;
        order.shipping.syncedAt = new Date();
        await order.save();
      } catch (awbErr) {
        order.shipping.syncStatus = "failed";
        order.shipping.syncError = awbErr.message;
        order.shipping.lastSyncAttemptAt = new Date();
        await order.save();
      }
    }
    return { alreadyExists: true, order };
  }

  if (order.paymentMethod !== "cod" && order.paymentStatus !== "paid") {
    throw new Error("Cannot create a shipment for an unpaid prepaid order");
  }

  order.shipping = order.shipping || {};
  order.shipping.syncStatus = "pending";
  order.shipping.lastSyncAttemptAt = new Date();
  await order.save();

  const seller = await resolveOrderSeller(order);
  await assertSellerPickupLocationRegistered(seller);
  const pickupLocation = seller.pickupAddress.shiprocketPickupLocationName;

  let totalWeightKg = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;
  const shiprocketItems = [];

  for (const item of order.items) {
    const product = await JewelleryProduct.findById(item.product).select(
      "shipping sku productName",
    );

    totalWeightKg += getItemWeightKg(product) * item.quantity;

    const dims = product?.shipping?.dimensions;
    if (dims) {
      maxLength = Math.max(maxLength, dims.length || 0);
      maxWidth = Math.max(maxWidth, dims.width || 0);
      maxHeight = Math.max(maxHeight, dims.height || 0);
    }

    shiprocketItems.push({
      name: item.name,
      sku: product?.sku || item.product.toString(),
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: 0,
    });
  }

  const weight = Math.max(Number(totalWeightKg.toFixed(3)), 0.1);
  const length = Math.max(maxLength, 10);
  const breadth = Math.max(maxWidth, 10);
  const height = Math.max(maxHeight, 5);

  const addr = order.shippingAddress;
  const nameParts = (addr.fullName || "Customer").trim().split(/\s+/);
  const firstName = nameParts.shift() || "Customer";
  const lastName = nameParts.join(" ");

  const orderDate = (order.placedAt || order.createdAt || new Date())
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");

  const paymentMethod = order.paymentMethod === "cod" ? "COD" : "Prepaid";

  const payload = {
    order_id: order.orderNumber,
    order_date: orderDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addr.addressLine1,
    billing_address_2: addr.addressLine2 || "",
    billing_city: addr.city,
    billing_state: addr.state,
    billing_country: addr.country || "India",
    billing_pincode: addr.pincode,
    billing_email: order.customerEmail,
    billing_phone: (order.customerPhone || addr.phone || "")
      .replace(/\D/g, "")
      .slice(-10),
    shipping_is_billing: true,
    order_items: shiprocketItems,
    payment_method: paymentMethod,
    sub_total: order.itemsTotal,
    length,
    breadth,
    height,
    weight,
  };

  console.log("========== SHIPROCKET CREATE ORDER REQUEST ==========");
  console.log("Aurevian Order:", order.orderNumber);
  console.log(
    "Seller:",
    seller._id.toString(),
    "pickup_location:",
    pickupLocation,
  );
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("=======================================================");

  let result;
  try {
    result = await shiprocketService.createOrder(payload);
  } catch (err) {
    console.error(
      "========== SHIPROCKET CREATE ORDER FAILED (HTTP ERROR) ==========",
    );
    console.error("Aurevian Order:", order.orderNumber);
    console.error("HTTP Status:", err.statusCode ?? "unknown");
    console.error("Shiprocket Response:", err.details ?? null);
    console.error("Error Message:", err.message);
    console.error(
      "===================================================================",
    );

    order.shipping = order.shipping || {};
    order.shipping.provider = "shiprocket";
    order.shipping.status = "CREATE_FAILED";
    order.shipping.syncStatus = "failed";
    order.shipping.syncError = err.message;
    order.shipping.lastError = err.message;
    order.shipping.lastSyncedAt = new Date();
    await order.save();

    emitShippingUpdated(order);

    throw err;
  }

  console.log("========== SHIPROCKET CREATE ORDER RESPONSE ==========");
  console.log("Aurevian Order:", order.orderNumber);
  console.log("HTTP Status: 200 (request completed)");
  console.log("Response body:", JSON.stringify(result, null, 2));
  console.log("========================================================");

  if (!result?.order_id || !result?.shipment_id) {
    const reason =
      result?.message ||
      (result?.errors && JSON.stringify(result.errors)) ||
      "Shiprocket did not return an order_id/shipment_id";

    console.error(
      "========== SHIPROCKET CREATE ORDER FAILED (200 OK, NO IDS) ==========",
    );
    console.error("Aurevian Order:", order.orderNumber);
    console.error("HTTP Status: 200");
    console.error("Shiprocket Response:", result);
    console.error("Reason:", reason);
    console.error(
      "=======================================================================",
    );

    order.shipping = order.shipping || {};
    order.shipping.provider = "shiprocket";
    order.shipping.status = "CREATE_FAILED";
    order.shipping.syncStatus = "failed";
    order.shipping.syncError = reason;
    order.shipping.lastError = reason;
    order.shipping.lastSyncedAt = new Date();
    await order.save();

    emitShippingUpdated(order);

    throw new ShiprocketError(
      `Shiprocket order creation failed: ${reason}`,
      502,
      result,
    );
  }

  order.shipping = order.shipping || {};
  order.shipping.provider = "shiprocket";
  order.shipping.shiprocketOrderId = String(result.order_id);
  order.shipping.shipmentId = String(result.shipment_id);
  order.shipping.status = result.status || "NEW";
  order.shipping.syncStatus = "synced";
  order.shipping.syncError = undefined;
  order.shipping.syncedAt = new Date();
  order.shipping.lastError = undefined;
  if (result.status_code != null) {
    order.shipping.statusCode = String(result.status_code);
  }
  order.shipping.paymentMethod = paymentMethod;
  order.shipping.weight = weight;
  order.shipping.dimensions = { length, breadth, height };
  order.shipping.lastSyncedAt = new Date();

  await order.save();

  try {
    await assignAWBForOrder(order);
  } catch (awbErr) {
    console.error(
      `⚠️ Auto AWB assignment failed for order ${order.orderNumber}:`,
      awbErr.message,
    );
    order.shipping.lastError = awbErr.message;
    await order.save();

    emitShippingUpdated(order);
  }

  return { alreadyExists: false, order };
}

// ============================================
// POST /api/shipping/calculate-rate
// pickup pincode comes from the seller who owns the cart's products, not
// SHIPROCKET_PICKUP_PINCODE. If the cart mixes sellers, we reject the
// quote rather than guessing whose address to use.
// ✅ CHANGED — passes itemsTotal through to calculateShippingRate so the
// ₹999 free-shipping threshold applies here too, and surfaces
// `freeShipping` in the response.
// ============================================
export const getShippingQuote = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { pincode, paymentMethod } = req.body;

    if (!isValidIndianPincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit delivery pincode",
      });
    }

    const normalizedPaymentMethod = paymentMethod === "cod" ? "cod" : "prepaid";

    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items.length) {
      return res
        .status(400)
        .json({ success: false, message: "Your cart is empty" });
    }

    let itemsTotal = 0;
    let totalWeightKg = 0;
    const sellerIdsInCart = new Set();

    for (const item of cart.items) {
      const product = await JewelleryProduct.findOne({
        _id: item.product,
        status: "Published",
        isActive: true,
      }).select("pricing shipping seller.sellerId");

      if (!product) continue;

      const livePrice =
        product.pricing?.salePrice || product.pricing?.originalPrice || 0;
      itemsTotal += livePrice * item.quantity;
      totalWeightKg += getItemWeightKg(product) * item.quantity;

      if (product.seller?.sellerId) {
        sellerIdsInCart.add(product.seller.sellerId.toString());
      }
    }

    if (sellerIdsInCart.size === 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to determine the seller for the items in your cart",
      });
    }

    if (sellerIdsInCart.size > 1) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart contains products from multiple sellers. Please check out with products from one seller at a time so shipping can be calculated correctly.",
      });
    }

    const seller = await Seller.findById([...sellerIdsInCart][0]).select(
      "pickupAddress",
    );
    const pickupPincode = seller?.pickupAddress?.pincode;

    if (!pickupPincode) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery is temporarily unavailable — this seller has not configured a pickup address yet.",
      });
    }

    let rate;
    try {
      rate = await calculateShippingRate({
        deliveryPincode: pincode,
        pickupPincode,
        weightKg: totalWeightKg,
        paymentMethod: normalizedPaymentMethod,
        itemsTotal,
      });
    } catch (err) {
      if (err instanceof ShippingUnavailableError) {
        return res.status(200).json({
          success: false,
          serviceable: false,
          message: err.message,
        });
      }
      console.error(
        "Shiprocket rate calculation error:",
        err?.details || err?.message || err,
      );
      throw err;
    }

    return res.status(200).json({
      success: true,
      serviceable: true,
      data: {
        pincode,
        itemsTotal,
        shippingFee: rate.shippingFee,
        totalAmount: itemsTotal + rate.shippingFee,
        courierName: rate.courierName,
        estimatedDeliveryDays: rate.estimatedDeliveryDays,
        freeShipping: rate.freeShipping,
      },
    });
  } catch (error) {
    if (
      error instanceof shiprocketService.ShiprocketError ||
      error?.statusCode
    ) {
      return cleanShiprocketError(
        res,
        error,
        "Unable to calculate shipping right now. Please try again.",
      );
    }
    console.error("❌ Get shipping quote error:", error.message);
    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status === 400
          ? error.message
          : "Unable to calculate shipping right now. Please try again.",
    });
  }
};

// ============================================
// GET /api/shipping/serviceability
// ✅ CHANGED — requires a `sellerId` query param now (pickup pincode is
// per-seller). No env fallback.
// ============================================
export const checkServiceability = async (req, res) => {
  try {
    const { deliveryPincode, weight, cod, sellerId } = req.query;
    if (!deliveryPincode) {
      return res
        .status(400)
        .json({ success: false, message: "deliveryPincode is required" });
    }
    if (!sellerId) {
      return res
        .status(400)
        .json({ success: false, message: "sellerId is required" });
    }

    const seller = await Seller.findById(sellerId).select("pickupAddress");
    const pickupPincode = seller?.pickupAddress?.pincode;
    if (!pickupPincode) {
      return res.status(400).json({
        success: false,
        message: "This seller has not configured a pickup address yet",
      });
    }

    const result = await shiprocketService.checkServiceability({
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: weight || "0.5",
      cod: cod === "1" ? 1 : 0,
    });

    const couriers = (result?.data?.available_courier_companies || []).map(
      (c) => ({
        courierId: c.courier_company_id,
        courierName: c.courier_name,
        rate: c.rate,
        estimatedDeliveryDays: c.estimated_delivery_days,
        rating: c.rating,
        codAvailable: !!c.cod,
      }),
    );

    return res.status(200).json({ success: true, data: couriers });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to check delivery serviceability right now",
    );
  }
};

// ============================================
// POST /api/shipping/create
// ============================================
export const createShipment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const { allowed } = isOwnerOrAdmin(order, req);
    if (!allowed) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { alreadyExists, order: updatedOrder } =
      await createShipmentForOrder(orderId);

    return res.status(200).json({
      success: true,
      message: alreadyExists
        ? "Shipment already exists for this order"
        : "Shipment created",
      data: {
        shiprocketOrderId: updatedOrder.shipping.shiprocketOrderId,
        shipmentId: updatedOrder.shipping.shipmentId,
        awbCode: updatedOrder.shipping.awbCode,
        courierName: updatedOrder.shipping.courierName,
      },
    });
  } catch (error) {
    if (error instanceof shiprocketService.ShiprocketError) {
      return cleanShiprocketError(
        res,
        error,
        "Unable to create shipment at this time",
      );
    }
    console.error("❌ Create shipment error:", error.message);
    return res
      .status(error.status || 400)
      .json({ success: false, message: error.message });
  }
};

// ============================================
// POST /api/shipping/assign-awb  (admin only)
// ============================================
export const assignAWB = async (req, res) => {
  try {
    const { orderId, courierId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.shipping?.awbCode) {
      return res.status(200).json({
        success: true,
        message: "AWB already assigned",
        data: {
          awbCode: order.shipping.awbCode,
          courierName: order.shipping.courierName,
        },
      });
    }

    await assignAWBForOrder(order, courierId);

    return res.status(200).json({
      success: true,
      message: "AWB assigned",
      data: {
        awbCode: order.shipping.awbCode,
        courierName: order.shipping.courierName,
      },
    });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to assign AWB at this time",
    );
  }
};

// ============================================
// POST /api/shipping/pickup  (admin only)
// ============================================
export const schedulePickup = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (!order.shipping?.awbCode) {
      return res.status(400).json({
        success: false,
        message: "AWB must be generated before scheduling pickup",
      });
    }
    if (order.shipping.pickupScheduledAt) {
      return res.status(200).json({
        success: true,
        message: "Pickup already scheduled",
        data: { pickupScheduledAt: order.shipping.pickupScheduledAt },
      });
    }

    await shiprocketService.schedulePickup([order.shipping.shipmentId]);

    order.shipping.pickupScheduledAt = new Date();
    order.shipping.status = "PICKUP SCHEDULED";
    order.shipping.lastSyncedAt = new Date();
    if (!TERMINAL_ORDER_STATUSES.includes(order.orderStatus)) {
      order.orderStatus = "ready_to_ship";
    }
    await order.save();

    emitShippingUpdated(order);

    return res.status(200).json({
      success: true,
      message: "Pickup scheduled",
      data: { pickupScheduledAt: order.shipping.pickupScheduledAt },
    });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to schedule pickup at this time",
    );
  }
};

// ============================================
// POST /api/shipping/label  (admin only)
// ============================================
export const generateLabel = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (!order.shipping?.awbCode) {
      return res.status(400).json({
        success: false,
        message: "AWB must be generated before creating a label",
      });
    }

    const result = await shiprocketService.generateLabel([
      order.shipping.shipmentId,
    ]);
    const labelUrl = result?.label_url;
    if (!labelUrl) {
      return res
        .status(502)
        .json({ success: false, message: "Label generation failed" });
    }

    order.shipping.labelUrl = labelUrl;
    order.shipping.lastSyncedAt = new Date();
    await order.save();

    emitShippingUpdated(order);

    return res
      .status(200)
      .json({ success: true, message: "Label generated", data: { labelUrl } });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to generate shipping label at this time",
    );
  }
};

// ============================================
// POST /api/shipping/manifest  (admin only)
// ============================================
export const generateManifest = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (!order.shipping?.awbCode) {
      return res.status(400).json({
        success: false,
        message: "AWB must be generated before creating a manifest",
      });
    }

    const result = await shiprocketService.generateManifest([
      order.shipping.shipmentId,
    ]);
    const manifestUrl = result?.manifest_url;

    if (manifestUrl) {
      order.shipping.manifestUrl = manifestUrl;
      order.shipping.lastSyncedAt = new Date();
      await order.save();

      emitShippingUpdated(order);
    }

    return res.status(200).json({
      success: true,
      message: "Manifest generation requested",
      data: { manifestUrl: manifestUrl || null },
    });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to generate manifest at this time",
    );
  }
};

// ============================================
// GET /api/shipping/track/:awb
// ============================================
export const trackShipment = async (req, res) => {
  try {
    const { awb } = req.params;
    if (!awb) {
      return res
        .status(400)
        .json({ success: false, message: "AWB is required" });
    }

    const order = await Order.findOne({ "shipping.awbCode": awb });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "No order found for this AWB" });
    }

    const { allowed } = isOwnerOrAdmin(order, req);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to track this order",
      });
    }

    const result = await shiprocketService.trackByAWB(awb);
    const trackData =
      result?.[awb]?.tracking_data || result?.tracking_data || {};

    return res.status(200).json({
      success: true,
      data: {
        awb,
        courier: order.shipping.courierName || null,
        currentStatus:
          trackData.shipment_status || order.shipping.status || null,
        estimatedDelivery:
          trackData.etd || order.shipping.estimatedDeliveryDate || null,
        trackingEvents: trackData.shipment_track_activities || [],
      },
    });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to fetch tracking information right now",
    );
  }
};

// ============================================
// POST /api/shipping/cancel
// ============================================
export const cancelShipment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const { allowed } = isOwnerOrAdmin(order, req);
    if (!allowed) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled",
      });
    }
    if (order.orderStatus === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already cancelled" });
    }

    if (order.shipping?.shiprocketOrderId) {
      try {
        await shiprocketService.cancelOrder([
          Number(order.shipping.shiprocketOrderId),
        ]);
      } catch (shiprocketErr) {
        console.error(
          "⚠️ Shiprocket cancel call failed, proceeding with local order cancellation:",
          shiprocketErr.message,
        );
      }
    }

    order.orderStatus = "cancelled";
    if (order.shipping) {
      order.shipping.status = "CANCELLED";
      order.shipping.cancelledAt = new Date();
    }
    await order.save();

    emitShippingUpdated(order);

    return res
      .status(200)
      .json({ success: true, message: "Order cancelled", data: order });
  } catch (error) {
    console.error("❌ Cancel shipment error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Unable to cancel order at this time" });
  }
};

// ============================================
// POST /api/shipping/return  (admin only)
// ✅ CHANGED — pickup/destination address now comes from the seller who
// owns the order's items instead of SHIPROCKET_PICKUP_LOCATION.
// ============================================
export const createReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Return reason is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned",
      });
    }

    let seller;
    try {
      seller = await resolveOrderSeller(order);
      await assertSellerPickupLocationRegistered(seller);
    } catch (sellerErr) {
      return res
        .status(sellerErr.status || 400)
        .json({ success: false, message: sellerErr.message });
    }

    const addr = order.shippingAddress;
    const pickup = seller.pickupAddress;

    const payload = {
      order_id: order.orderNumber,
      order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
      pickup_customer_name: addr.fullName,
      pickup_address: addr.addressLine1,
      pickup_city: addr.city,
      pickup_state: addr.state,
      pickup_country: addr.country || "India",
      pickup_pincode: addr.pincode,
      pickup_email: order.customerEmail,
      pickup_phone: order.customerPhone,
      shipping_customer_name:
        pickup.contactName || seller.storeInfo?.storeName || "Seller",
      shipping_address: pickup.addressLine1,
      shipping_address_2: pickup.addressLine2 || "",
      shipping_city: pickup.city,
      shipping_state: pickup.state,
      shipping_country: pickup.country || "India",
      shipping_pincode: pickup.pincode,
      shipping_email: pickup.contactEmail || seller.email,
      shipping_phone: (pickup.contactPhone || "").replace(/\D/g, "").slice(-10),
      order_items: order.items.map((i) => ({
        name: i.name,
        sku: i.slug || i.product.toString(),
        units: i.quantity,
        selling_price: i.price,
      })),
      payment_method: "Prepaid",
      sub_total: order.itemsTotal,
      length: order.shipping?.dimensions?.length || 10,
      breadth: order.shipping?.dimensions?.breadth || 10,
      height: order.shipping?.dimensions?.height || 5,
      weight: order.shipping?.weight || 0.5,
    };

    const result = await shiprocketService.createReturnOrder(payload);

    order.shipping.returnShipmentId = result.shipment_id
      ? String(result.shipment_id)
      : undefined;
    order.shipping.returnStatus = "INITIATED";
    order.orderStatus = "return_initiated";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Return shipment created",
      data: { returnShipmentId: order.shipping.returnShipmentId },
    });
  } catch (error) {
    return cleanShiprocketError(
      res,
      error,
      "Unable to create return shipment at this time",
    );
  }
};

// ============================================
// POST /api/shipping/webhook
// ============================================
export const shiprocketWebhook = async (req, res) => {
  try {
    const incomingToken =
      req.headers["x-api-key"] || req.headers["x-webhook-token"];
    const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;

    if (expectedToken && incomingToken !== expectedToken) {
      console.warn("⚠️ Rejected Shiprocket webhook: invalid/missing token");
      return res
        .status(401)
        .json({ success: false, message: "Invalid webhook token" });
    }

    const payload = req.body || {};
    const awb = payload.awb || payload.awb_code;
    const shiprocketOrderId = payload.order_id || payload.sr_order_id;

    if (!awb && !shiprocketOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order/AWB identifier" });
    }

    const order = awb
      ? await Order.findOne({ "shipping.awbCode": awb })
      : await Order.findOne({
          "shipping.shiprocketOrderId": String(shiprocketOrderId),
        });

    if (!order) {
      console.warn(
        "⚠️ Shiprocket webhook: no matching Aurevian order for",
        awb || shiprocketOrderId,
      );
      return res
        .status(200)
        .json({ success: true, message: "No matching order — ignored" });
    }

    const incomingStatus = (
      payload.current_status ||
      payload.status ||
      ""
    ).toString();
    const incomingStatusCode =
      payload.current_status_id != null
        ? String(payload.current_status_id)
        : undefined;

    if (
      incomingStatusCode &&
      order.shipping.statusCode &&
      order.shipping.statusCode === incomingStatusCode
    ) {
      return res
        .status(200)
        .json({ success: true, message: "Already processed" });
    }

    const mappedStatus = mapShiprocketStatus(incomingStatus);

    if (
      !TERMINAL_ORDER_STATUSES.includes(order.orderStatus) ||
      order.orderStatus === mappedStatus
    ) {
      order.orderStatus = mappedStatus;
    }

    order.shipping.status = incomingStatus || order.shipping.status;
    if (incomingStatusCode) order.shipping.statusCode = incomingStatusCode;
    if (payload.etd)
      order.shipping.estimatedDeliveryDate = new Date(payload.etd);
    if (mappedStatus === "shipped" && !order.shipping.shippedAt)
      order.shipping.shippedAt = new Date();
    if (mappedStatus === "delivered" && !order.shipping.deliveredAt)
      order.shipping.deliveredAt = new Date();
    order.shipping.lastSyncedAt = new Date();

    await order.save();

    emitShippingUpdated(order);

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Shiprocket webhook error:", error.message);
    return res
      .status(200)
      .json({ success: false, message: "Webhook received with errors" });
  }
};

// ============================================
// GET /api/shipping/admin/orders  (admin only)
// ============================================
export const adminListShippingOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);

    const filter = {};
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "orderNumber customerName customerEmail paymentStatus orderStatus shipping totalAmount createdAt",
        ),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("❌ Admin list shipping orders error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders" });
  }
};
