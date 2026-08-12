// backend/controllers/orderController.js
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import razorpayService from "../services/razorpayService.js";
import {
  createShipmentForOrder,
  calculateShippingRate,
  getItemWeightKg,
  isValidIndianPincode,
  ShippingUnavailableError,
} from "./shippingController.js";

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

const resolveShippingFee = async ({ pincode, weightKg, paymentMethod }) => {
  try {
    const rate = await calculateShippingRate({
      deliveryPincode: pincode,
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

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { items, shippingAddress } = req.body;

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

    let orderItems, itemsTotal, totalWeightKg;
    try {
      ({ orderItems, itemsTotal, totalWeightKg } =
        await buildOrderItemsAndTotals(items));
    } catch (e) {
      return res
        .status(e.status || 400)
        .json({ success: false, message: e.message });
    }

    let shippingFee;
    try {
      shippingFee = await resolveShippingFee({
        pincode: shippingAddress.pincode,
        weightKg: totalWeightKg,
        paymentMethod: "prepaid",
      });
    } catch (e) {
      return res
        .status(e.status || 502)
        .json({ success: false, message: e.message });
    }

    const totalAmount = itemsTotal + shippingFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: userId,
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
    order.placedAt = new Date();
    order.razorpay = {
      orderId: razorpay_order_id || order.razorpay?.orderId,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    };
    await order.save();

    await finalizeInventoryAndCart(order, userId);

    try {
      await createShipmentForOrder(order._id);
    } catch (shipErr) {
      console.error(
        `⚠️ Shiprocket shipment creation failed for order ${order.orderNumber}:`,
        shipErr.message,
      );
    }

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
    const { items, shippingAddress } = req.body;

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

    let orderItems, itemsTotal, totalWeightKg;
    try {
      ({ orderItems, itemsTotal, totalWeightKg } =
        await buildOrderItemsAndTotals(items));
    } catch (e) {
      return res
        .status(e.status || 400)
        .json({ success: false, message: e.message });
    }

    let shippingFee;
    try {
      shippingFee = await resolveShippingFee({
        pincode: shippingAddress.pincode,
        weightKg: totalWeightKg,
        paymentMethod: "cod",
      });
    } catch (e) {
      return res
        .status(e.status || 502)
        .json({ success: false, message: e.message });
    }

    const totalAmount = itemsTotal + shippingFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: userId,
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
      placedAt: new Date(),
    });

    await finalizeInventoryAndCart(order, userId);

    try {
      await createShipmentForOrder(order._id);
    } catch (shipErr) {
      console.error(
        `⚠️ Shiprocket shipment creation failed for COD order ${order.orderNumber}:`,
        shipErr.message,
      );
    }

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
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
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

// ✅ NEW: statuses that only make sense once Shiprocket has actually
// created a shipment for this order. This is the fix for the reported bug:
// a seller could previously set orderStatus to "ready_to_ship" (or
// shipped/delivered/etc.) from the dashboard dropdown with zero validation,
// even while shipping.status was "CREATE_FAILED" and no Shiprocket
// shipment existed — producing exactly the inconsistent state reported
// (paymentStatus: paid, orderStatus: ready_to_ship, shipping.status:
// CREATE_FAILED). These statuses should only be reachable via the
// Shiprocket webhook or the internal shipping pipeline (schedulePickup,
// etc.), which already require shipping.awbCode/shipmentId to exist before
// touching orderStatus.
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

    // ✅ NEW: reject manual writes into a shipment-dependent status when no
    // Shiprocket shipment actually exists for this order yet.
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
