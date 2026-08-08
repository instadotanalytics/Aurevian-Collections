// backend/controllers/orderController.js
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import razorpayService from "../services/razorpayService.js";

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

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { items, shippingAddress } = req.body;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "No items to order" });
    }
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete shipping address is required",
        });
    }

    const orderItems = [];
    let itemsTotal = 0;

    for (const it of items) {
      const product = await JewelleryProduct.findOne({
        _id: it.productId,
        status: "Published",
        isActive: true,
      });

      if (!product) {
        return res
          .status(404)
          .json({
            success: false,
            message: `Product not found: ${it.productId}`,
          });
      }
      const snap = getProductSnapshot(product);
      const quantity = Math.max(1, Number(it.quantity) || 1);

      if (snap.stock !== undefined && quantity > snap.stock) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Only ${snap.stock} unit(s) of "${snap.name}" available`,
          });
      }

      const subtotal = snap.price * quantity;
      itemsTotal += subtotal;

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

    const shippingFee = itemsTotal > 5000 ? 0 : 49;
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
      return res
        .status(500)
        .json({
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
        totalAmount,
      },
    });
  } catch (error) {
    console.error("❌ Create Razorpay order error:", error);
    return res
      .status(500)
      .json({
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

    return res
      .status(200)
      .json({
        success: true,
        message: "Payment verified successfully",
        data: order,
      });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Payment verification failed",
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
    return res
      .status(500)
      .json({
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
    return res
      .status(500)
      .json({
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

    // Only show orders that have completed/attempted payment, newest first
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
        createdAt: order.createdAt,
      };
    });

    return res.status(200).json({ success: true, data: shaped });
  } catch (error) {
    console.error("❌ Get seller orders error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "placed",
      "processing",
      "shipped",
      "delivered",
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

    order.orderStatus = status;
    await order.save();

    return res
      .status(200)
      .json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update order status",
        error: error.message,
      });
  }
};
