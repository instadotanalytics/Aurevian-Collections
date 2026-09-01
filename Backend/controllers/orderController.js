// backend/controllers/orderController.js
import Order, { FULFILLMENT_STATUS } from "../models/Order.js";
import Cart from "../models/Cart.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import Seller from "../models/Seller.js"; // ✅ NEW — needed to look up the seller's pickup pincode
import razorpayService from "../services/razorpayService.js";
import PaymentSettings from "../models/PaymentSettings.js";
import {
  createShipmentForOrder,
  calculateShippingRate,
  getItemWeightKg,
  isValidIndianPincode,
  ShippingUnavailableError,
} from "./shippingController.js";

// ============================================
// SOCKET.IO IMPORTS
// ============================================
import {
  emitOrderCreated,
  emitSellerConfirmed,
  emitSellerRejected,
  emitAdminApproved,
  emitAdminRejected,
  emitOrderStatusUpdated,
  emitShippingUpdated,
} from "../socket/orderEvents.js";

const getProductSnapshot = (product) => {
  const name = product.productName || "Product";
  const image = product.thumbnail?.url || product.images?.[0]?.url || "";
  const price =
    product.pricing?.salePrice || product.pricing?.originalPrice || 0;
  const slug = product.productSlug || "";
  const seller = product.seller?.sellerId || null;
  const stock = product.inventory?.stockQuantity ?? 0;
  return { name, image, price, slug, seller, stock };
};

const generateOrderNumber = () =>
  `AUR${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;

const buildOrderItemsAndTotals = async (items) => {
  const orderItems = [];
  let itemsTotal = 0;
  let totalWeightKg = 0;

  for (const it of items) {
    const product = await JewelleryProduct.findOne({
      _id: it.productId,
      status: "Published",
      isActive: true,
    });

    if (!product) {
      const err = new Error(`Product not found: ${it.productId}`);
      err.status = 404;
      throw err;
    }

    const snap = getProductSnapshot(product);
    const quantity = Math.max(1, Number(it.quantity) || 1);

    if (snap.stock !== undefined && quantity > snap.stock) {
      const err = new Error(
        `Only ${snap.stock} unit(s) of "${snap.name}" available`,
      );
      err.status = 400;
      throw err;
    }

    const subtotal = snap.price * quantity;
    itemsTotal += subtotal;
    totalWeightKg += getItemWeightKg(product) * quantity;

    orderItems.push({
      product: product._id,
      seller: snap.seller,
      name: snap.name,
      image: snap.image,
      slug: snap.slug,
      price: snap.price,
      quantity,
      subtotal,
    });
  }

  return { orderItems, itemsTotal, totalWeightKg };
};

// Every item already carries its own `seller` (items[].seller), which is
// what per-seller views (getSellerOrders, sellerConfirmOrder, dashboards,
// etc.) filter on — none of that depends on this value.
//
// `order.seller` on the top-level document is kept only as a convenience
// "primary seller" reference for the common single-seller-cart case; for
// multi-seller carts it's left null rather than picking one seller
// arbitrarily.
//
// ⚠️ CHANGED CONSEQUENCE: shipping now requires exactly ONE seller's
// pickup address per checkout (see resolveShippingFee below and
// shippingController's resolveOrderSeller/getShippingQuote). A null
// sellerId here now blocks checkout entirely instead of silently
// proceeding with order.seller = null — see the sellerId check added to
// createRazorpayOrder/createCODOrder. This is a direct, unavoidable
// consequence of pickup addresses moving from one global env value to
// one-per-seller: there is no longer a single pincode to quote/ship a
// mixed-seller cart from, and there is no fallback address to fall back
// on. Splitting a multi-seller cart into one order per seller at checkout
// time would resolve this properly, but that's a checkout-flow change
// beyond the scope of "use the seller's saved pickup address" — flagging
// it here rather than papering over it.
const resolvePrimarySeller = (orderItems) => {
  const sellerIds = new Set(
    orderItems.map((i) => i.seller && i.seller.toString()).filter(Boolean),
  );
  return sellerIds.size === 1 ? [...sellerIds][0] : null;
};

// ✅ NEW — looks up the seller's saved, Shiprocket-registered pickup
// address and returns its pincode. Throws a clear 400 if the cart has no
// single seller, the seller doesn't exist, or the seller hasn't set up
// (and successfully registered) a pickup address yet. No fallback to any
// other pincode.
const resolveSellerPickupPincode = async (sellerId) => {
  if (!sellerId) {
    const err = new Error(
      "Your cart contains products from multiple sellers. Please check out with products from one seller at a time so shipping can be calculated correctly.",
    );
    err.status = 400;
    throw err;
  }

  const seller = await Seller.findById(sellerId).select("pickupAddress");
  if (!seller) {
    const err = new Error("Seller not found for the items in your cart");
    err.status = 400;
    throw err;
  }

  if (
    !seller.pickupAddress?.isRegisteredWithShiprocket ||
    !seller.pickupAddress?.pincode
  ) {
    const err = new Error(
      "Delivery is temporarily unavailable — this seller has not configured a pickup address yet.",
    );
    err.status = 400;
    throw err;
  }

  return seller.pickupAddress.pincode;
};

const resolveShippingFee = async ({
  pincode,
  pickupPincode,
  weightKg,
  paymentMethod,
}) => {
  try {
    const rate = await calculateShippingRate({
      deliveryPincode: pincode,
      pickupPincode,
      weightKg,
      paymentMethod,
    });
    return rate.shippingFee;
  } catch (err) {
    if (err instanceof ShippingUnavailableError) {
      const e = new Error(err.message);
      e.status = 400;
      throw e;
    }
    const e = new Error(
      err.message ||
        "Unable to calculate shipping right now. Please try again.",
    );
    e.status = err.status || err.statusCode || 502;
    throw e;
  }
};

const finalizeInventoryAndCart = async (order, userId) => {
  for (const item of order.items) {
    try {
      const product = await JewelleryProduct.findById(item.product);
      if (!product) continue;
      product.inventory.stockQuantity = Math.max(
        0,
        product.inventory.stockQuantity - item.quantity,
      );
      if (product.inventory.stockQuantity <= 0) {
        product.inventory.availability = "Out of Stock";
      }
      product.reviews.totalSold =
        (product.reviews?.totalSold || 0) + item.quantity;
      await product.save();
    } catch (e) {
      console.error("⚠️ Stock decrement failed:", e.message);
    }
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      const orderedIds = order.items.map((i) => i.product.toString());
      cart.items = cart.items.filter(
        (i) => !orderedIds.includes(i.product.toString()),
      );
      await cart.save();
    }
  } catch (e) {
    console.error("⚠️ Cart cleanup failed:", e.message);
  }
};

const validateShippingAddress = (shippingAddress) => {
  return !!(
    shippingAddress &&
    shippingAddress.fullName &&
    shippingAddress.phone &&
    shippingAddress.addressLine1 &&
    shippingAddress.city &&
    shippingAddress.state &&
    isValidIndianPincode(shippingAddress.pincode)
  );
};

const normalizeClientRequestId = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 100) return null;
  return trimmed;
};

const findExistingOrderByIdempotencyKey = async (userId, clientRequestId) => {
  if (!clientRequestId) return null;
  return Order.findOne({ user: userId, idempotencyKey: clientRequestId });
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      items,
      shippingAddress,
      clientRequestId: rawClientRequestId,
    } = req.body;
    const clientRequestId = normalizeClientRequestId(rawClientRequestId);

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "No items to order" });
    }
    if (!validateShippingAddress(shippingAddress)) {
      return res.status(400).json({
        success: false,
        message:
          "Complete shipping address with a valid 6-digit pincode is required",
      });
    }

    const existing = await findExistingOrderByIdempotencyKey(
      userId,
      clientRequestId,
    );
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Order already created",
        data: {
          orderId: existing._id,
          orderNumber: existing.orderNumber,
          razorpayOrderId: existing.razorpay?.orderId,
          amount: Math.round(existing.totalAmount * 100),
          currency: "INR",
          mock: !razorpayService.isConfigured,
          itemsTotal: existing.itemsTotal,
          shippingFee: existing.shippingFee,
          totalAmount: existing.totalAmount,
        },
      });
    }

    const paymentSettings = await PaymentSettings.getSingleton();
    if (!paymentSettings.onlinePaymentEnabled) {
      return res.status(400).json({
        success: false,
        message:
          "Online payment is currently unavailable. Please try Cash on Delivery.",
      });
    }

    let orderItems, itemsTotal, totalWeightKg;
    try {
      ({ orderItems, itemsTotal, totalWeightKg } =
        await buildOrderItemsAndTotals(items));
    } catch (e) {
      return res
        .status(e.status || 400)
        .json({ success: false, message: e.message });
    }

    const sellerId = resolvePrimarySeller(orderItems);

    // ✅ NEW — resolve the seller's saved, registered pickup pincode.
    // No fallback: if this fails, checkout stops here with a clear reason.
    let pickupPincode;
    try {
      pickupPincode = await resolveSellerPickupPincode(sellerId);
    } catch (e) {
      return res
        .status(e.status || 400)
        .json({ success: false, message: e.message });
    }

    let shippingFee;
    try {
      shippingFee = await resolveShippingFee({
        pincode: shippingAddress.pincode,
        pickupPincode,
        weightKg: totalWeightKg,
        paymentMethod: "prepaid",
      });
    } catch (e) {
      return res
        .status(e.status || 502)
        .json({ success: false, message: e.message });
    }

    const totalAmount = itemsTotal + shippingFee;

    let order;
    try {
      order = await Order.create({
        orderNumber: generateOrderNumber(),
        idempotencyKey: clientRequestId || undefined,
        user: userId,
        seller: sellerId,
        customerName:
          req.user.fullName ||
          `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() ||
          shippingAddress.fullName,
        customerEmail: req.user.email,
        customerPhone: req.user.phone || shippingAddress.phone,
        items: orderItems,
        shippingAddress,
        itemsTotal,
        shippingFee,
        totalAmount,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        orderStatus: "placed",
      });
    } catch (createErr) {
      if (createErr.code === 11000 && clientRequestId) {
        const raced = await findExistingOrderByIdempotencyKey(
          userId,
          clientRequestId,
        );
        if (raced) {
          return res.status(200).json({
            success: true,
            message: "Order already created",
            data: {
              orderId: raced._id,
              orderNumber: raced.orderNumber,
              razorpayOrderId: raced.razorpay?.orderId,
              amount: Math.round(raced.totalAmount * 100),
              currency: "INR",
              mock: !razorpayService.isConfigured,
              itemsTotal: raced.itemsTotal,
              shippingFee: raced.shippingFee,
              totalAmount: raced.totalAmount,
            },
          });
        }
      }
      throw createErr;
    }

    const rzpResult = await razorpayService.createOrder({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString(), userId: userId.toString() },
    });

    if (!rzpResult.success) {
      await Order.findByIdAndDelete(order._id);
      return res.status(500).json({
        success: false,
        message: rzpResult.error || "Payment order creation failed",
      });
    }

    order.razorpay = { orderId: rzpResult.order.id };
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order created",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: rzpResult.order.id,
        amount: rzpResult.order.amount,
        currency: rzpResult.order.currency,
        mock: !!rzpResult.mock,
        itemsTotal,
        shippingFee,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("❌ Create Razorpay order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: order,
      });
    }

    const isValid = razorpayService.verifySignature({
      orderId: razorpay_order_id || order.razorpay?.orderId,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      order.paymentStatus = "failed";
      await order.save();
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    order.fulfillmentStatus = FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION;
    order.statusHistory.push({
      status: FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION,
      role: "system",
      timestamp: new Date(),
    });
    order.placedAt = new Date();
    order.razorpay = {
      orderId: razorpay_order_id || order.razorpay?.orderId,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    };
    await order.save();

    await finalizeInventoryAndCart(order, userId);

    emitOrderCreated(order);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

export const createCODOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      items,
      shippingAddress,
      clientRequestId: rawClientRequestId,
    } = req.body;
    const clientRequestId = normalizeClientRequestId(rawClientRequestId);

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "No items to order" });
    }
    if (!validateShippingAddress(shippingAddress)) {
      return res.status(400).json({
        success: false,
        message:
          "Complete shipping address with a valid 6-digit pincode is required",
      });
    }

    const existing = await findExistingOrderByIdempotencyKey(
      userId,
      clientRequestId,
    );
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Order placed (Cash on Delivery)",
        data: existing,
      });
    }

    const paymentSettings = await PaymentSettings.getSingleton();
    if (!paymentSettings.codEnabled) {
      return res.status(400).json({
        success: false,
        message:
          "Cash on Delivery is currently unavailable. Please choose an online payment method.",
      });
    }

    let orderItems, itemsTotal, totalWeightKg;
    try {
      ({ orderItems, itemsTotal, totalWeightKg } =
        await buildOrderItemsAndTotals(items));
    } catch (e) {
      return res
        .status(e.status || 400)
        .json({ success: false, message: e.message });
    }

    const sellerId = resolvePrimarySeller(orderItems);

    // ✅ NEW — resolve the seller's saved, registered pickup pincode.
    // No fallback: if this fails, checkout stops here with a clear reason.
    let pickupPincode;
    try {
      pickupPincode = await resolveSellerPickupPincode(sellerId);
    } catch (e) {
      return res
        .status(e.status || 400)
        .json({ success: false, message: e.message });
    }

    let shippingFee;
    try {
      shippingFee = await resolveShippingFee({
        pincode: shippingAddress.pincode,
        pickupPincode,
        weightKg: totalWeightKg,
        paymentMethod: "cod",
      });
    } catch (e) {
      return res
        .status(e.status || 502)
        .json({ success: false, message: e.message });
    }

    const totalAmount = itemsTotal + shippingFee;

    if (
      paymentSettings.codMinOrderAmount > 0 &&
      totalAmount < paymentSettings.codMinOrderAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Cash on Delivery is only available for orders above ₹${paymentSettings.codMinOrderAmount.toLocaleString("en-IN")}`,
      });
    }
    if (
      paymentSettings.codMaxOrderAmount > 0 &&
      totalAmount > paymentSettings.codMaxOrderAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Cash on Delivery is only available for orders up to ₹${paymentSettings.codMaxOrderAmount.toLocaleString("en-IN")}`,
      });
    }

    let order;
    try {
      order = await Order.create({
        orderNumber: generateOrderNumber(),
        idempotencyKey: clientRequestId || undefined,
        user: userId,
        seller: sellerId,
        customerName:
          req.user.fullName ||
          `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() ||
          shippingAddress.fullName,
        customerEmail: req.user.email,
        customerPhone: req.user.phone || shippingAddress.phone,
        items: orderItems,
        shippingAddress,
        itemsTotal,
        shippingFee,
        totalAmount,
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "processing",
        fulfillmentStatus: FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION,
        statusHistory: [
          {
            status: FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION,
            role: "system",
            timestamp: new Date(),
          },
        ],
        placedAt: new Date(),
      });
    } catch (createErr) {
      if (createErr.code === 11000 && clientRequestId) {
        const raced = await findExistingOrderByIdempotencyKey(
          userId,
          clientRequestId,
        );
        if (raced) {
          return res.status(200).json({
            success: true,
            message: "Order placed (Cash on Delivery)",
            data: raced,
          });
        }
      }
      throw createErr;
    }

    await finalizeInventoryAndCart(order, userId);

    emitOrderCreated(order);

    return res.status(201).json({
      success: true,
      message: "Order placed (Cash on Delivery)",
      data: order,
    });
  } catch (error) {
    console.error("❌ Create COD order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller?._id;
    if (!sellerId) {
      return res
        .status(401)
        .json({ success: false, message: "Seller authentication required" });
    }

    const orders = await Order.find({
      "items.seller": sellerId,
      paymentStatus: { $in: ["paid", "pending", "failed"] },
    }).sort({ createdAt: -1 });

    const shaped = orders.map((order) => {
      const sellerItems = order.items.filter(
        (i) => i.seller && i.seller.toString() === sellerId.toString(),
      );
      const sellerSubtotal = sellerItems.reduce(
        (sum, i) => sum + i.subtotal,
        0,
      );
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          ...(order.shippingAddress?.toObject?.() || order.shippingAddress),
          name: order.customerName,
          email: order.customerEmail,
        },
        items: sellerItems,
        sellerSubtotal,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentReference:
          order.paymentMethod === "cod"
            ? null
            : order.razorpay?.paymentId || null,
        orderStatus: order.orderStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        sellerConfirmedAt: order.sellerConfirmedAt,
        sellerRejectedAt: order.sellerRejectedAt,
        sellerRejectionReason: order.sellerRejectionReason,
        shipping: order.shipping,
        createdAt: order.createdAt,
      };
    });

    return res.status(200).json({ success: true, data: shaped });
  } catch (error) {
    console.error("❌ Get seller orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { fulfillmentStatus } = req.query;
    const filter = {};
    if (fulfillmentStatus) {
      filter.fulfillmentStatus = fulfillmentStatus;
    } else {
      filter.fulfillmentStatus = {
        $ne: FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION,
      };
    }

    const orders = await Order.find(filter)
      .populate("seller", "storeInfo.storeName fullName email")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Get admin orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const SHIPMENT_DEPENDENT_STATUSES = [
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "placed",
      "processing",
      "ready_to_ship",
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "rto",
      "return_initiated",
      "returned",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (
      SHIPMENT_DEPENDENT_STATUSES.includes(status) &&
      !order.shipping?.shipmentId
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot set order status to "${status}" — no Shiprocket shipment exists yet for this order (shipping.status: ${
          order.shipping?.status || "none"
        }). Resolve the Shiprocket shipment creation issue first.`,
      });
    }

    order.orderStatus = status;
    await order.save();

    emitOrderStatusUpdated(order);

    return res
      .status(200)
      .json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

export const sellerConfirmOrder = async (req, res) => {
  try {
    const sellerId = req.seller?._id;
    if (!sellerId) {
      return res
        .status(401)
        .json({ success: false, message: "Seller authentication required" });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const belongsToSeller = order.items.some(
      (i) => i.seller && i.seller.toString() === sellerId.toString(),
    );
    if (!belongsToSeller) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this order" });
    }

    if (order.paymentMethod !== "cod" && order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot confirm an order that has not been paid for",
      });
    }

    if (
      order.fulfillmentStatus !== FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION
    ) {
      return res.status(409).json({
        success: false,
        message: `Cannot confirm order in state "${order.fulfillmentStatus}". Only orders pending seller confirmation can be confirmed.`,
      });
    }

    order.fulfillmentStatus = FULFILLMENT_STATUS.SELLER_CONFIRMED;
    order.sellerConfirmedAt = new Date();
    order.sellerConfirmedBy = sellerId;
    order.statusHistory.push({
      status: FULFILLMENT_STATUS.SELLER_CONFIRMED,
      changedBy: sellerId,
      role: "seller",
      timestamp: new Date(),
    });
    await order.save();

    emitSellerConfirmed(order);

    return res
      .status(200)
      .json({ success: true, message: "Order confirmed", data: order });
  } catch (error) {
    console.error("❌ Seller confirm order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to confirm order" });
  }
};

export const sellerRejectOrder = async (req, res) => {
  try {
    const sellerId = req.seller?._id;
    if (!sellerId) {
      return res
        .status(401)
        .json({ success: false, message: "Seller authentication required" });
    }

    const { orderId } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "A rejection reason is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const belongsToSeller = order.items.some(
      (i) => i.seller && i.seller.toString() === sellerId.toString(),
    );
    if (!belongsToSeller) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized for this order" });
    }

    if (
      order.fulfillmentStatus !== FULFILLMENT_STATUS.PENDING_SELLER_CONFIRMATION
    ) {
      return res.status(409).json({
        success: false,
        message: `Cannot reject order in state "${order.fulfillmentStatus}".`,
      });
    }

    order.fulfillmentStatus = FULFILLMENT_STATUS.SELLER_REJECTED;
    order.sellerRejectedAt = new Date();
    order.sellerRejectedBy = sellerId;
    order.sellerRejectionReason = reason.trim();
    order.statusHistory.push({
      status: FULFILLMENT_STATUS.SELLER_REJECTED,
      changedBy: sellerId,
      role: "seller",
      reason: reason.trim(),
      timestamp: new Date(),
    });
    await order.save();

    emitSellerRejected(order);

    return res
      .status(200)
      .json({ success: true, message: "Order rejected", data: order });
  } catch (error) {
    console.error("❌ Seller reject order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to reject order" });
  }
};

export const adminApproveOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.paymentMethod !== "cod" && order.paymentStatus !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order has not been paid for" });
    }
    if (order.fulfillmentStatus !== FULFILLMENT_STATUS.SELLER_CONFIRMED) {
      return res.status(409).json({
        success: false,
        message: `Cannot approve order in state "${order.fulfillmentStatus}". Only seller-confirmed orders can be approved.`,
      });
    }

    if (order.shipping?.shiprocketOrderId) {
      return res.status(200).json({
        success: true,
        message: "Order was already approved and forwarded to Shiprocket",
        data: order,
        shiprocketSync: { success: true },
      });
    }

    // ---- COMMIT THE APPROVAL ITSELF — INDEPENDENT OF SHIPROCKET ----
    order.fulfillmentStatus = FULFILLMENT_STATUS.ADMIN_APPROVED;
    order.adminApprovedAt = new Date();
    order.adminApprovedBy = req.user._id || req.user.id;
    order.statusHistory.push({
      status: FULFILLMENT_STATUS.ADMIN_APPROVED,
      changedBy: req.user._id || req.user.id,
      role: "super_admin",
      timestamp: new Date(),
    });
    await order.save();

    // ---- ATTEMPT SHIPROCKET SYNC — FAILURE HERE MUST NOT UNDO THE APPROVAL ----
    try {
      const { order: updatedOrder } = await createShipmentForOrder(order._id);

      if (updatedOrder.shipping?.shipmentId) {
        updatedOrder.fulfillmentStatus = updatedOrder.shipping.awbCode
          ? FULFILLMENT_STATUS.AWB_ASSIGNED
          : FULFILLMENT_STATUS.AWB_PENDING;
      } else {
        updatedOrder.fulfillmentStatus = FULFILLMENT_STATUS.SHIPROCKET_FAILED;
      }
      updatedOrder.statusHistory.push({
        status: updatedOrder.fulfillmentStatus,
        role: "system",
        reason: updatedOrder.shipping?.lastError || null,
        timestamp: new Date(),
      });
      await updatedOrder.save();

      emitAdminApproved(updatedOrder);

      // ✅ Always 200 — the approval itself succeeded regardless of Shiprocket.
      return res.status(200).json({
        success: true,
        message: "Order approved and forwarded to Shiprocket",
        data: updatedOrder,
        shiprocketSync: { success: true },
      });
    } catch (shipErr) {
      order.fulfillmentStatus = FULFILLMENT_STATUS.SHIPROCKET_FAILED;
      order.shipping = order.shipping || {};
      order.shipping.syncStatus = "failed";
      order.shipping.syncError = shipErr.message;
      order.statusHistory.push({
        status: FULFILLMENT_STATUS.SHIPROCKET_FAILED,
        role: "system",
        reason: shipErr.message,
        timestamp: new Date(),
      });
      await order.save();

      emitAdminApproved(order);

      // ✅ 200, not 502 — the DB approval succeeded. Only Shiprocket
      // failed, and that's now retryable without redoing the approval.
      return res.status(200).json({
        success: true,
        message:
          "Order approved successfully, but Shiprocket synchronization failed. You can retry synchronization.",
        data: order,
        shiprocketSync: { success: false, error: shipErr.message },
      });
    }
  } catch (error) {
    console.error("❌ Admin approve order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to approve order" });
  }
};

// ✅ NEW — retry Shiprocket sync for an order whose admin approval already
// succeeded but whose Shiprocket sync failed or is incomplete (shipment
// created but AWB missing). Never re-runs seller/admin approval, and
// relies on createShipmentForOrder's own idempotency to avoid duplicates.
export const retryOrderShiprocketSync = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const RETRYABLE_STATUSES = [
      FULFILLMENT_STATUS.ADMIN_APPROVED,
      FULFILLMENT_STATUS.SHIPROCKET_FAILED,
      FULFILLMENT_STATUS.AWB_PENDING,
    ];
    if (!RETRYABLE_STATUSES.includes(order.fulfillmentStatus)) {
      return res.status(409).json({
        success: false,
        message: `Cannot retry Shiprocket sync for an order in state "${order.fulfillmentStatus}".`,
      });
    }

    try {
      const { order: updatedOrder } = await createShipmentForOrder(order._id);

      if (updatedOrder.shipping?.shipmentId) {
        updatedOrder.fulfillmentStatus = updatedOrder.shipping.awbCode
          ? FULFILLMENT_STATUS.AWB_ASSIGNED
          : FULFILLMENT_STATUS.AWB_PENDING;
      } else {
        updatedOrder.fulfillmentStatus = FULFILLMENT_STATUS.SHIPROCKET_FAILED;
      }
      updatedOrder.statusHistory.push({
        status: updatedOrder.fulfillmentStatus,
        role: "system",
        reason: updatedOrder.shipping?.lastError || null,
        timestamp: new Date(),
      });
      await updatedOrder.save();
      emitAdminApproved(updatedOrder);

      return res.status(200).json({
        success: true,
        message: updatedOrder.shipping?.shiprocketOrderId
          ? "Shiprocket synchronization successful"
          : "Retry attempted, but Shiprocket synchronization is still failing",
        data: updatedOrder,
        shiprocketSync: { success: !!updatedOrder.shipping?.shiprocketOrderId },
      });
    } catch (shipErr) {
      order.fulfillmentStatus = FULFILLMENT_STATUS.SHIPROCKET_FAILED;
      order.shipping = order.shipping || {};
      order.shipping.syncStatus = "failed";
      order.shipping.syncError = shipErr.message;
      order.statusHistory.push({
        status: FULFILLMENT_STATUS.SHIPROCKET_FAILED,
        role: "system",
        reason: shipErr.message,
        timestamp: new Date(),
      });
      await order.save();
      emitAdminApproved(order);

      return res.status(200).json({
        success: true,
        message:
          "Retry attempted, but Shiprocket synchronization failed again.",
        data: order,
        shiprocketSync: { success: false, error: shipErr.message },
      });
    }
  } catch (error) {
    console.error("❌ Retry Shiprocket sync error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retry synchronization" });
  }
};

export const adminRejectOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const { orderId } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "A rejection reason is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.fulfillmentStatus !== FULFILLMENT_STATUS.SELLER_CONFIRMED) {
      return res.status(409).json({
        success: false,
        message: `Cannot reject order in state "${order.fulfillmentStatus}".`,
      });
    }

    order.fulfillmentStatus = FULFILLMENT_STATUS.ADMIN_REJECTED;
    order.adminRejectedAt = new Date();
    order.adminRejectedBy = req.user._id || req.user.id;
    order.adminRejectionReason = reason.trim();
    order.statusHistory.push({
      status: FULFILLMENT_STATUS.ADMIN_REJECTED,
      changedBy: req.user._id || req.user.id,
      role: "super_admin",
      reason: reason.trim(),
      timestamp: new Date(),
    });
    await order.save();

    emitAdminRejected(order);

    return res
      .status(200)
      .json({ success: true, message: "Order rejected", data: order });
  } catch (error) {
    console.error("❌ Admin reject order error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to reject order" });
  }
};

const DATE_RANGE_TO_START = {
  today: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  },
  "7d": () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  "30d": () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
};

const buildStatusFilter = (statusKey) => {
  switch (statusKey) {
    case "PENDING_SELLER_CONFIRMATION":
      return { fulfillmentStatus: "PENDING_SELLER_CONFIRMATION" };
    case "SELLER_CONFIRMED":
      return { fulfillmentStatus: "SELLER_CONFIRMED" };
    case "ADMIN_APPROVED":
      return { fulfillmentStatus: "ADMIN_APPROVED" };
    case "PROCESSING":
      return {
        fulfillmentStatus: {
          $in: ["SHIPMENT_CREATED", "AWB_PENDING", "AWB_ASSIGNED"],
        },
      };
    case "READY_TO_SHIP":
      return { orderStatus: "ready_to_ship" };
    case "SHIPPED":
      return { orderStatus: "shipped" };
    case "IN_TRANSIT":
      return { orderStatus: "in_transit" };
    case "OUT_FOR_DELIVERY":
      return { orderStatus: "out_for_delivery" };
    case "DELIVERED":
      return { orderStatus: "delivered" };
    case "CANCELLED":
      return { orderStatus: "cancelled" };
    case "REJECTED":
      return {
        fulfillmentStatus: { $in: ["SELLER_REJECTED", "ADMIN_REJECTED"] },
      };
    case "FAILED":
      return { fulfillmentStatus: "SHIPROCKET_FAILED" };
    default:
      return {};
  }
};

const buildShiprocketFilter = (key) => {
  switch (key) {
    case "NOT_CREATED":
      return {
        $or: [
          { "shipping.shiprocketOrderId": { $exists: false } },
          { "shipping.shiprocketOrderId": null },
        ],
      };
    case "CREATED":
      return {
        "shipping.shiprocketOrderId": { $exists: true, $ne: null },
        $or: [
          { "shipping.awbCode": { $exists: false } },
          { "shipping.awbCode": null },
        ],
      };
    case "AWB_ASSIGNED":
      return { "shipping.awbCode": { $exists: true, $ne: null } };
    case "PICKED_UP":
      return { "shipping.shippedAt": { $exists: true, $ne: null } };
    case "IN_TRANSIT":
      return { orderStatus: "in_transit" };
    case "DELIVERED":
      return { "shipping.deliveredAt": { $exists: true, $ne: null } };
    case "FAILED":
      return { fulfillmentStatus: "SHIPROCKET_FAILED" };
    default:
      return {};
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const {
      search,
      status,
      payment,
      dateRange,
      startDate,
      endDate,
      shiprocket,
    } = req.query;

    const filter = {};

    if (search && search.trim()) {
      const re = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { orderNumber: re },
        { customerName: re },
        { customerEmail: re },
        { customerPhone: re },
      ];
    }

    if (status && status !== "ALL") {
      Object.assign(filter, buildStatusFilter(status));
    }

    if (payment && payment !== "ALL") {
      filter.paymentStatus = payment.toLowerCase();
    }

    if (shiprocket && shiprocket !== "ALL") {
      Object.assign(filter, buildShiprocketFilter(shiprocket));
    }

    if (dateRange === "custom" && (startDate || endDate)) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    } else if (dateRange && DATE_RANGE_TO_START[dateRange]) {
      filter.createdAt = { $gte: DATE_RANGE_TO_START[dateRange]() };
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("seller", "storeInfo.storeName fullName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalOrders / limit)),
        totalOrders,
        limit,
      },
    });
  } catch (error) {
    console.error("❌ Get order history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order history",
      error: error.message,
    });
  }
};

export const getOrderHistoryDetail = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const order = await Order.findById(req.params.id).populate(
      "seller",
      "storeInfo.storeName fullName email phone",
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Get order history detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};
