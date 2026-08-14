import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import shiprocketService, {
  ShiprocketError,
} from "../services/shiprocketService.js";

// ============================================
// SOCKET.IO IMPORTS (ADDED)
// ============================================
import { emitShippingUpdated } from "../socket/orderEvents.js";

const UNIT_TO_KG = { g: 0.001, kg: 1, oz: 0.0283495, lb: 0.453592 };

// ============================================
// STATUS MAPPING
// Shiprocket's current_status text isn't a fixed enum in practice, so this
// matches on keywords rather than exact strings. Extend this if you see
// statuses in production that fall through to "processing".
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
// ✅ NEW: PICKUP LOCATION VALIDATION
// Shiprocket's Create Order API silently "succeeds" (HTTP 200, no
// order_id/shipment_id) when pickup_location doesn't match a nickname
// registered in Settings > Pickup Addresses. This catches that BEFORE
// wasting a create call, and tells you exactly what's registered.
// ============================================
let pickupLocationCache = { names: null, fetchedAt: 0 };
const PICKUP_CACHE_TTL_MS = 10 * 60 * 1000;

async function assertPickupLocationExists(pickupLocation) {
  const now = Date.now();
  const cacheStale =
    !pickupLocationCache.names ||
    now - pickupLocationCache.fetchedAt > PICKUP_CACHE_TTL_MS;

  if (cacheStale) {
    try {
      const result = await shiprocketService.getPickupLocations();
      const addresses = result?.data?.shipping_address || [];
      pickupLocationCache = {
        names: addresses.map((a) => a.pickup_location),
        fetchedAt: now,
      };
    } catch (err) {
      // If we can't even fetch pickup locations (auth/network issue),
      // don't block the flow on this check — let the actual create call
      // surface the real error as before. This is a fast-fail optimization,
      // not the only line of defense.
      console.error(
        "⚠️ Could not fetch Shiprocket pickup locations for validation:",
        err.message,
      );
      return;
    }
  }

  if (
    pickupLocationCache.names &&
    !pickupLocationCache.names.includes(pickupLocation)
  ) {
    const err = new Error(
      `SHIPROCKET_PICKUP_LOCATION "${pickupLocation}" does not match any pickup ` +
        `location nickname registered in Shiprocket. This is a config value, not ` +
        `a street address. Registered pickup locations on this account: ` +
        `${pickupLocationCache.names.length ? pickupLocationCache.names.join(", ") : "(none found — add one in Shiprocket > Settings > Pickup Addresses)"}. ` +
        `Update SHIPROCKET_PICKUP_LOCATION in .env to match one exactly.`,
    );
    err.status = 500;
    throw err;
  }
}

// ============================================
// ✅ NEW: WEIGHT HELPER — single source of truth for "how much does this
// product weigh, in kg, per unit". Shared by shipment creation and rate
// quoting so the two never drift apart. Falls back to 50g/unit only for
// legacy documents saved before `shipping.weight` was a required field.
// ============================================
export function getItemWeightKg(product) {
  const weightVal = product?.shipping?.weight?.value;
  const weightUnit = product?.shipping?.weight?.unit || "g";
  if (!weightVal) return 0.05;
  return weightVal * (UNIT_TO_KG[weightUnit] || 0.001);
}

// ============================================
// ✅ NEW: PINCODE VALIDATION
// Required, numeric, exactly 6 digits. Nothing else passes.
// ============================================
export function isValidIndianPincode(pincode) {
  const str = String(pincode ?? "").trim();
  return /^\d{6}$/.test(str);
}

// ============================================
// ✅ NEW: typed error for "Shiprocket has no courier for this pincode" —
// distinct from a network/API failure so callers can show the right
// message ("delivery unavailable" vs "try again").
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
// ✅ NEW: CALCULATE SHIPPING RATE
// The ONLY place a shipping charge is ever produced. No random numbers,
// no fixed tiers. Called by the live checkout quote AND by order creation
// (which always recomputes here — it never trusts a client-supplied fee).
// ============================================
export async function calculateShippingRate({
  deliveryPincode,
  weightKg,
  paymentMethod, // "cod" | "prepaid"
}) {
  if (!isValidIndianPincode(deliveryPincode)) {
    const err = new Error("A valid 6-digit delivery pincode is required");
    err.status = 400;
    throw err;
  }

  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupPincode) {
    const err = new Error("Shipping service is not fully configured");
    err.status = 500;
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

  // Fall back to the cheapest available courier if there's no recommendation
  // or it doesn't appear in the filtered (cod-aware) list.
  if (!chosen) {
    chosen = couriers.reduce(
      (min, c) => (Number(c.rate) < Number(min.rate) ? c : min),
      couriers[0],
    );
  }

  return {
    shippingFee: Math.round(Number(chosen.rate)),
    courierId: chosen.courier_company_id,
    courierName: chosen.courier_name,
    estimatedDeliveryDays: chosen.estimated_delivery_days,
    codAvailable: !!chosen.cod,
  };
}

// ============================================
// ✅ NEW: INTERNAL HELPER — ASSIGN AWB FOR AN ORDER
// Extracted so it can be called two ways: (1) automatically, right after
// createShipmentForOrder succeeds, so the full pipeline (order -> shipment
// -> courier -> AWB) completes without a manual admin step, and (2) from
// the POST /api/shipping/assign-awb endpoint, for retries if step (1)
// failed or an admin wants to force a specific courier. Idempotent: a no-op
// if an AWB already exists on the order.
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
    // Same "200 OK but no actual data" failure mode as order creation —
    // don't treat this as success just because the HTTP call didn't throw.
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

  // ✅ SOCKET.IO
  emitShippingUpdated(order);

  return { alreadyAssigned: false, awbCode: awbData.awb_code };
}

// ============================================
// INTERNAL HELPER — CREATE SHIPROCKET SHIPMENT FOR AN AUREVIAN ORDER
// Called from orderController after a Razorpay payment is verified, or
// immediately after a COD order is placed. Idempotent: if the order already
// has a shiprocketOrderId, it returns the existing data instead of creating
// a duplicate shipment.
// ============================================
export async function createShipmentForOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // Duplicate-shipment protection (rule: never create two shipments for one order)
  if (order.shipping?.shiprocketOrderId) {
    return { alreadyExists: true, order };
  }

  // Never ship an unpaid prepaid order. COD orders ship without upfront payment.
  if (order.paymentMethod !== "cod" && order.paymentStatus !== "paid") {
    throw new Error("Cannot create a shipment for an unpaid prepaid order");
  }

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) {
    throw new Error("SHIPROCKET_PICKUP_LOCATION is not configured");
  }

  // ✅ NEW — fail fast with a real reason instead of a silent 200-with-no-IDs
  await assertPickupLocationExists(pickupLocation);

  // Gather live weight/dimensions/SKU per item — these aren't stored on the
  // Order snapshot, so we look them up on JewelleryProduct at ship time.
  let totalWeightKg = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;
  const shiprocketItems = [];

  for (const item of order.items) {
    const product = await JewelleryProduct.findById(item.product).select(
      "shipping sku productName",
    );

    // ✅ FIXED: uses the shared weight helper instead of duplicating the
    // conversion logic — keeps this in sync with calculateShippingRate.
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

  // Safe minimums so Shiprocket never rejects the payload for zero dimensions
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

  // ✅ TEMP DEV LOGGING — safe: this payload never contains Shiprocket
  // credentials, tokens, JWTs, or Razorpay secrets. It's exactly what's
  // being sent to Shiprocket's Create Order API for this order.
  console.log("========== SHIPROCKET CREATE ORDER REQUEST ==========");
  console.log("Aurevian Order:", order.orderNumber);
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("=======================================================");

  let result;
  try {
    result = await shiprocketService.createOrder(payload);
  } catch (err) {
    // Covers thrown 4xx/5xx from Shiprocket (shiprocketRequest() throws a
    // ShiprocketError with the real HTTP status in err.statusCode and the
    // real Shiprocket response body in err.details).
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
    order.shipping.lastError = err.message; // ✅ NEW: store the reason
    order.shipping.lastSyncedAt = new Date();
    await order.save();

    // ✅ SOCKET.IO — surface shipment-creation failure live
    emitShippingUpdated(order);

    throw err;
  }

  // ✅ TEMP DEV LOGGING — the request succeeded at the HTTP level (200).
  // Whether it's a REAL success is checked right below.
  console.log("========== SHIPROCKET CREATE ORDER RESPONSE ==========");
  console.log("Aurevian Order:", order.orderNumber);
  console.log("HTTP Status: 200 (request completed)");
  console.log("Response body:", JSON.stringify(result, null, 2));
  console.log("========================================================");

  // ✅ FIXED — this is the actual bug: Shiprocket's /orders/create/adhoc
  // endpoint frequently responds with HTTP 200 even when the order was
  // REJECTED (e.g. pickup_location nickname doesn't match anything
  // registered in the Shiprocket account, invalid SKU, etc.) — the failure
  // only shows up as a missing order_id/shipment_id plus a message/errors
  // field in the body. The previous code trusted a 200 response as success
  // unconditionally, which is why orders were saving locally with
  // status "NEW" and full dimensions/weight, but shiprocketOrderId and
  // shipmentId were silently undefined, and nothing ever appeared in the
  // Shiprocket dashboard. Now we explicitly check for both IDs and treat
  // their absence as a real failure.
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
    order.shipping.lastError = reason; // ✅ NEW: store the reason
    order.shipping.lastSyncedAt = new Date();
    await order.save();

    // ✅ SOCKET.IO — surface shipment-creation failure live
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
  order.shipping.lastError = undefined; // ✅ NEW — clear any stale failure reason
  if (result.status_code != null) {
    order.shipping.statusCode = String(result.status_code);
  }
  order.shipping.paymentMethod = paymentMethod;
  order.shipping.weight = weight;
  order.shipping.dimensions = { length, breadth, height };
  order.shipping.lastSyncedAt = new Date();

  await order.save();

  // ✅ NEW: auto-assign AWB immediately, so the pipeline required by the
  // product spec (order -> shipment -> courier/AWB -> tracking) completes
  // in one pass instead of needing a separate manual admin action. The
  // order+shipment creation above already succeeded on Shiprocket's side at
  // this point, so an AWB failure here must NOT unwind that — it's logged
  // and can be retried via POST /api/shipping/assign-awb.
  try {
    await assignAWBForOrder(order);
  } catch (awbErr) {
    console.error(
      `⚠️ Auto AWB assignment failed for order ${order.orderNumber}:`,
      awbErr.message,
    );
    // Store the AWB error in lastError so admins can see what went wrong
    order.shipping.lastError = awbErr.message;
    await order.save();

    // ✅ SOCKET.IO
    emitShippingUpdated(order);
  }

  return { alreadyExists: false, order };
}

// ============================================
// ✅ NEW: POST /api/shipping/calculate-rate
// Live checkout quote. Uses the authenticated customer's own cart (never
// client-supplied item data) so the number shown before payment is
// trustworthy and matches what order creation will actually charge.
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

    for (const item of cart.items) {
      const product = await JewelleryProduct.findOne({
        _id: item.product,
        status: "Published",
        isActive: true,
      }).select("pricing shipping");

      // A stale cart entry (product since unpublished/deleted) is skipped
      // here — order creation re-validates every item and will reject it
      // properly at that point instead of blocking the quote.
      if (!product) continue;

      const livePrice =
        product.pricing?.salePrice || product.pricing?.originalPrice || 0;
      itemsTotal += livePrice * item.quantity;
      totalWeightKg += getItemWeightKg(product) * item.quantity;
    }

    let rate;
    try {
      rate = await calculateShippingRate({
        deliveryPincode: pincode,
        weightKg: totalWeightKg,
        paymentMethod: normalizedPaymentMethod,
      });
    } catch (err) {
      if (err instanceof ShippingUnavailableError) {
        // Not an error — a legitimate "we can't deliver here" business result.
        return res.status(200).json({
          success: false,
          serviceable: false,
          message: err.message,
        });
      }
      // ✅ TEMP DEV LOGGING — remove once shipping is confirmed stable.
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
    return res.status(500).json({
      success: false,
      message: "Unable to calculate shipping right now. Please try again.",
    });
  }
};

// ============================================
// GET /api/shipping/serviceability
// Public — returns courier options only, no credentials/tokens exposed.
// Kept for standalone pincode checks (e.g. a PDP "check delivery" widget);
// the checkout quote flow uses /calculate-rate above instead.
// ============================================
export const checkServiceability = async (req, res) => {
  try {
    const { deliveryPincode, weight, cod } = req.query;
    if (!deliveryPincode) {
      return res
        .status(400)
        .json({ success: false, message: "deliveryPincode is required" });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
    if (!pickupPincode) {
      return res.status(500).json({
        success: false,
        message: "Shipping service is not fully configured",
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
// Manual/backup trigger — normally shipment creation happens automatically
// after payment verification or COD order placement.
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
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// POST /api/shipping/assign-awb  (admin only)
// Manual/retry trigger — normally AWB assignment happens automatically
// right after createShipmentForOrder(). Use this if auto-assignment failed
// (see server logs for "Auto AWB assignment failed"), or to force a
// specific courier via courierId.
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

    // ✅ SOCKET.IO
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

    // ✅ SOCKET.IO
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

      // ✅ SOCKET.IO
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
        // Shiprocket may reject cancellation post-pickup — proceed with local
        // cancellation regardless so the customer/admin isn't blocked, but log it.
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

    // ✅ SOCKET.IO
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
// Partial implementation — see plan notes on the missing return workflow.
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

    const addr = order.shippingAddress;
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

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
      shipping_customer_name: pickupLocation,
      shipping_country: "India",
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
// Public endpoint — secured via a shared token header (set the same value
// in Shiprocket's webhook settings and in SHIPROCKET_WEBHOOK_TOKEN).
// Idempotent: re-delivered webhooks with an unchanged status are no-ops.
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

    // ✅ SOCKET.IO — this is the one that makes AWB/courier/tracking
    // changes show up live on the customer's Order Detail page
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
