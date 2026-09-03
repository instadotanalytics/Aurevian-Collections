// backend/controllers/returnController.js
import Order from "../models/Order.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import ReturnRequest, {
  RETURN_STATUS,
  BLOCKING_RETURN_STATUSES,
  RETURN_REASONS,
} from "../models/ReturnRequest.js";
import cloudinaryService from "../services/cloudinaryService.js";
import shiprocketService from "../services/shiprocketService.js";
import {
  resolveOrderSeller,
  assertSellerPickupLocationRegistered,
} from "./shippingController.js";

const RETURN_WINDOW_DEFAULT_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ============================================
// ELIGIBILITY — shared by the eligibility-check endpoint and the
// create-request endpoint so both use exactly the same rules.
//
// ✅ FIXED (ROOT CAUSE — matching fix to jewelleryProductController's
// normalizeReturnPolicy): this used to include a
// `product.returnPolicy?.returnAvailable === false` gate that returned
// `eligible: false` for any product with that field stored as `false`.
// Since every existing product ended up with that field stored as
// `false` (see jewelleryProductController.js normalizeReturnPolicy
// comment for the full history), that gate was blocking every single
// return REQUEST at the API level too — even though the Product Detail
// Page and this eligibility check are two different code paths, they'd
// both been failing the same way for the same underlying reason.
//
// CURRENT AUREVIAN BUSINESS RULE: there is no supported per-product
// return restriction right now — every product is return/exchange
// eligible. The gate has been removed entirely rather than "fixed" to
// check something else, per that rule. If a genuine, deliberate
// per-product opt-out is required in the future, reintroduce a single,
// explicit gate right here (this is the one and only place that should
// decide it) — and make sure jewelleryProductController's
// normalizeReturnPolicy is updated to match, so the Product Detail Page
// and the actual return-submission flow never disagree again.
// ============================================
async function getItemEligibility(order, item) {
  const base = {
    productId: item.product.toString(),
    productName: item.name,
    quantity: item.quantity,
    price: item.price,
  };

  const product = await JewelleryProduct.findById(item.product).select(
    "productName thumbnail returnPolicy",
  );

  if (!product) {
    return {
      ...base,
      eligible: false,
      reason: "This product is no longer available",
    };
  }

  if (order.orderStatus === "cancelled") {
    return {
      ...base,
      eligible: false,
      reason: "This order was cancelled",
    };
  }

  if (order.orderStatus !== "delivered") {
    return {
      ...base,
      eligible: false,
      reason: "This item is not eligible until the order has been delivered",
    };
  }

  const deliveredAt = order.shipping?.deliveredAt;
  if (!deliveredAt) {
    return {
      ...base,
      eligible: false,
      reason: "Delivery date has not been recorded yet",
    };
  }

  // ✅ REMOVED — see fix note above. Every product is return/exchange
  // eligible under the current business rule; this no longer gates on
  // product.returnPolicy.returnAvailable at all.

  const returnDays =
    product.returnPolicy?.returnDays || RETURN_WINDOW_DEFAULT_DAYS;
  const eligibleUntil = new Date(
    new Date(deliveredAt).getTime() + returnDays * MS_PER_DAY,
  );

  if (Date.now() > eligibleUntil.getTime()) {
    return {
      ...base,
      eligible: false,
      reason: `The ${returnDays}-day return window for this item has expired`,
      eligibleUntil,
    };
  }

  const existing = await ReturnRequest.findOne({
    order: order._id,
    product: item.product,
    status: { $in: BLOCKING_RETURN_STATUSES },
  }).select("status requestType");

  if (existing) {
    return {
      ...base,
      eligible: false,
      reason: "A return/exchange request already exists for this item",
      existingRequest: {
        _id: existing._id,
        status: existing.status,
        requestType: existing.requestType,
      },
      eligibleUntil,
    };
  }

  return {
    ...base,
    eligible: true,
    eligibleUntil,
    returnDays,
    productImage: product.thumbnail?.url || item.image,
  };
}

// ============================================
// GET /api/returns/order/:orderId  (customer)
// ============================================
export const getOrderReturnEligibility = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: userId,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const items = await Promise.all(
      order.items.map((item) => getItemEligibility(order, item)),
    );

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderStatus: order.orderStatus,
        deliveredAt: order.shipping?.deliveredAt || null,
        items,
      },
    });
  } catch (error) {
    console.error("❌ Get order return eligibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check return eligibility",
    });
  }
};

// ============================================
// POST /api/returns  (customer) — multipart/form-data
// fields: orderId, productId, requestType, reason, notes, quantity
// files: images[] (up to 5, handled by multer in returnRoutes.js)
// ============================================
export const createReturnRequest = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId, productId, requestType, reason, notes, quantity } =
      req.body;

    if (!orderId || !productId || !requestType || !reason) {
      return res.status(400).json({
        success: false,
        message: "orderId, productId, requestType and reason are required",
      });
    }
    if (!["return", "exchange"].includes(requestType)) {
      return res.status(400).json({
        success: false,
        message: "requestType must be 'return' or 'exchange'",
      });
    }
    if (!RETURN_REASONS.includes(reason)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid return reason" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const item = order.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "This product is not part of the given order",
      });
    }

    const eligibility = await getItemEligibility(order, item);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason || "This item is not eligible for return",
      });
    }

    if (!item.seller) {
      return res.status(400).json({
        success: false,
        message: "Unable to determine the seller for this item",
      });
    }

    // Re-check for a duplicate right before insert — the eligibility check
    // above covers the common case, this guards a race between two
    // near-simultaneous requests for the same item.
    const duplicate = await ReturnRequest.findOne({
      order: order._id,
      product: item.product,
      status: { $in: BLOCKING_RETURN_STATUSES },
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "A return/exchange request already exists for this item",
      });
    }

    const requestedQty = Math.max(
      1,
      Math.min(Number(quantity) || item.quantity, item.quantity),
    );

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinaryService.uploadBuffer(
            file.buffer,
            `returns/${userId}`,
            { timeout: 60000 },
          );
          if (result.success) {
            images.push({ url: result.url, publicId: result.publicId });
          }
        } catch (uploadErr) {
          console.error("⚠️ Return image upload failed:", uploadErr.message);
        }
      }
    }

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      orderNumber: order.orderNumber,
      product: item.product,
      productName: item.name,
      productImage: eligibility.productImage || item.image,
      user: userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      seller: item.seller,
      requestType,
      reason,
      customerNotes: (notes || "").toString().trim(),
      images,
      quantity: requestedQty,
      unitPrice: item.price,
      orderPlacedAt: order.placedAt || order.createdAt,
      orderDeliveredAt: order.shipping.deliveredAt,
      eligibleUntil: eligibility.eligibleUntil,
      status: RETURN_STATUS.REQUESTED,
      statusHistory: [
        {
          status: RETURN_STATUS.REQUESTED,
          changedBy: userId,
          role: "customer",
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: `${requestType === "exchange" ? "Exchange" : "Return"} request submitted`,
      data: returnRequest,
    });
  } catch (error) {
    console.error("❌ Create return request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit return request",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/returns/my  (customer)
// ============================================
export const getMyReturnRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const requests = await ReturnRequest.find({ user: userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Get my return requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch return requests",
    });
  }
};

// ============================================
// POST /api/returns/:id/cancel  (customer, own request only)
// ============================================
export const cancelReturnRequest = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const request = await ReturnRequest.findOne({
      _id: req.params.id,
      user: userId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Return request not found" });
    }

    if (request.status !== RETURN_STATUS.REQUESTED) {
      return res.status(409).json({
        success: false,
        message: `Cannot cancel a request in state "${request.status}"`,
      });
    }

    request.status = RETURN_STATUS.CANCELLED;
    request.cancelledAt = new Date();
    request.cancelledBy = userId;
    request.statusHistory.push({
      status: RETURN_STATUS.CANCELLED,
      changedBy: userId,
      role: "customer",
      timestamp: new Date(),
    });
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Return request cancelled",
      data: request,
    });
  } catch (error) {
    console.error("❌ Cancel return request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel return request",
    });
  }
};

// ============================================
// GET /api/returns/seller/all  (seller)
// ============================================
export const getSellerReturnRequests = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const requests = await ReturnRequest.find({ seller: sellerId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Get seller return requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch return requests",
    });
  }
};

// ============================================
// SHIPROCKET REVERSE PICKUP — shared by approve + retry.
// Idempotent: never creates a second Shiprocket return shipment for the
// same request. Mutates and persists `request`.
// ============================================
async function syncReturnWithShiprocket(request) {
  if (request.shiprocketReturn?.shiprocketOrderId) {
    return { success: true, alreadyExists: true };
  }

  request.shiprocketReturn = request.shiprocketReturn || {};
  request.shiprocketReturn.syncStatus = "pending";
  request.shiprocketReturn.lastSyncAttemptAt = new Date();
  await request.save();

  const order = await Order.findById(request.order);
  if (!order) {
    request.shiprocketReturn.syncStatus = "failed";
    request.shiprocketReturn.syncError = "Original order no longer exists";
    await request.save();
    return { success: false, error: request.shiprocketReturn.syncError };
  }

  let seller;
  try {
    seller = await resolveOrderSeller(order);
    await assertSellerPickupLocationRegistered(seller);
  } catch (sellerErr) {
    request.shiprocketReturn.syncStatus = "failed";
    request.shiprocketReturn.syncError = sellerErr.message;
    await request.save();
    return { success: false, error: sellerErr.message };
  }

  const addr = order.shippingAddress;
  const pickup = seller.pickupAddress;

  const payload = {
    order_id: `${order.orderNumber}-RET-${request._id.toString().slice(-6)}`,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_customer_name: addr.fullName,
    pickup_address: addr.addressLine1,
    pickup_address_2: addr.addressLine2 || "",
    pickup_city: addr.city,
    pickup_state: addr.state,
    pickup_country: addr.country || "India",
    pickup_pincode: addr.pincode,
    pickup_email: order.customerEmail,
    pickup_phone: (order.customerPhone || addr.phone || "")
      .replace(/\D/g, "")
      .slice(-10),
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
    order_items: [
      {
        name: request.productName,
        sku: request.product.toString(),
        units: request.quantity,
        selling_price: request.unitPrice,
      },
    ],
    payment_method: "Prepaid",
    sub_total: request.unitPrice * request.quantity,
    length: order.shipping?.dimensions?.length || 10,
    breadth: order.shipping?.dimensions?.breadth || 10,
    height: order.shipping?.dimensions?.height || 5,
    weight: order.shipping?.weight || 0.5,
  };

  let result;
  try {
    result = await shiprocketService.createReturnOrder(payload);
  } catch (err) {
    console.error(
      "❌ Shiprocket return creation failed:",
      err.message,
      err.details || "",
    );
    request.shiprocketReturn.syncStatus = "failed";
    request.shiprocketReturn.syncError = err.message;
    await request.save();
    return { success: false, error: err.message };
  }

  if (!result?.order_id || !result?.shipment_id) {
    const reason =
      result?.message ||
      (result?.errors && JSON.stringify(result.errors)) ||
      "Shiprocket did not return an order_id/shipment_id";
    request.shiprocketReturn.syncStatus = "failed";
    request.shiprocketReturn.syncError = reason;
    await request.save();
    return { success: false, error: reason };
  }

  request.shiprocketReturn.shiprocketOrderId = String(result.order_id);
  request.shiprocketReturn.shipmentId = String(result.shipment_id);
  request.shiprocketReturn.syncStatus = "synced";
  request.shiprocketReturn.syncError = undefined;
  request.shiprocketReturn.syncedAt = new Date();
  request.status = RETURN_STATUS.PICKUP_SCHEDULED;
  request.statusHistory.push({
    status: RETURN_STATUS.PICKUP_SCHEDULED,
    role: "system",
    timestamp: new Date(),
  });
  await request.save();

  return { success: true };
}

// ============================================
// POST /api/returns/:id/seller-approve  (seller)
// ============================================
export const sellerApproveReturn = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const request = await ReturnRequest.findOne({
      _id: req.params.id,
      seller: sellerId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Return request not found" });
    }

    if (request.status !== RETURN_STATUS.REQUESTED) {
      return res.status(409).json({
        success: false,
        message: `Cannot approve a request in state "${request.status}"`,
      });
    }

    const order = await Order.findById(request.order).select("orderStatus");
    if (order && order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve a return for a cancelled order",
      });
    }

    request.status = RETURN_STATUS.APPROVED;
    request.sellerDecisionAt = new Date();
    request.statusHistory.push({
      status: RETURN_STATUS.APPROVED,
      changedBy: sellerId,
      role: "seller",
      timestamp: new Date(),
    });
    await request.save();

    const syncResult = await syncReturnWithShiprocket(request);

    return res.status(200).json({
      success: true,
      message: syncResult.success
        ? "Return approved and reverse pickup initiated with Shiprocket."
        : "Return approved. Shiprocket reverse-pickup synchronization failed — you can retry from this page.",
      data: { returnRequest: request, shiprocketSync: syncResult },
    });
  } catch (error) {
    console.error("❌ Seller approve return error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve return request",
    });
  }
};

// ============================================
// POST /api/returns/:id/seller-reject  (seller)
// ============================================
export const sellerRejectReturn = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "A rejection reason is required" });
    }

    const request = await ReturnRequest.findOne({
      _id: req.params.id,
      seller: sellerId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Return request not found" });
    }

    if (request.status !== RETURN_STATUS.REQUESTED) {
      return res.status(409).json({
        success: false,
        message: `Cannot reject a request in state "${request.status}"`,
      });
    }

    request.status = RETURN_STATUS.REJECTED;
    request.sellerDecisionAt = new Date();
    request.sellerRejectionReason = reason.trim();
    request.statusHistory.push({
      status: RETURN_STATUS.REJECTED,
      changedBy: sellerId,
      role: "seller",
      reason: reason.trim(),
      timestamp: new Date(),
    });
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Return request rejected",
      data: request,
    });
  } catch (error) {
    console.error("❌ Seller reject return error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject return request",
    });
  }
};

// ============================================
// POST /api/returns/:id/retry-shiprocket-sync  (seller)
// ============================================
export const retryReturnShiprocketSync = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const request = await ReturnRequest.findOne({
      _id: req.params.id,
      seller: sellerId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Return request not found" });
    }

    if (request.status !== RETURN_STATUS.APPROVED) {
      return res.status(409).json({
        success: false,
        message: `Cannot retry Shiprocket sync for a request in state "${request.status}"`,
      });
    }

    const syncResult = await syncReturnWithShiprocket(request);

    return res.status(200).json({
      success: true,
      message: syncResult.success
        ? "Reverse pickup synced with Shiprocket."
        : "Shiprocket synchronization failed again.",
      data: { returnRequest: request, shiprocketSync: syncResult },
    });
  } catch (error) {
    console.error("❌ Retry return Shiprocket sync error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retry synchronization",
    });
  }
};

// ============================================
// PATCH /api/returns/:id/status  (seller) — manual downstream progression
// for stages Shiprocket doesn't report back on for this codebase yet
// (pickup confirmation, receipt, refund/exchange completion).
// ============================================
const SELLER_ADVANCEABLE_STATUSES = [
  RETURN_STATUS.PICKED_UP,
  RETURN_STATUS.RECEIVED,
  RETURN_STATUS.REFUND_PROCESSING,
  RETURN_STATUS.REFUNDED,
  RETURN_STATUS.EXCHANGE_PROCESSING,
  RETURN_STATUS.EXCHANGE_COMPLETED,
];

const ALLOWED_PREVIOUS = {
  [RETURN_STATUS.PICKED_UP]: [
    RETURN_STATUS.PICKUP_SCHEDULED,
    RETURN_STATUS.APPROVED,
  ],
  [RETURN_STATUS.RECEIVED]: [RETURN_STATUS.PICKED_UP],
  [RETURN_STATUS.REFUND_PROCESSING]: [RETURN_STATUS.RECEIVED],
  [RETURN_STATUS.REFUNDED]: [RETURN_STATUS.REFUND_PROCESSING],
  [RETURN_STATUS.EXCHANGE_PROCESSING]: [RETURN_STATUS.RECEIVED],
  [RETURN_STATUS.EXCHANGE_COMPLETED]: [RETURN_STATUS.EXCHANGE_PROCESSING],
};

export const updateReturnStatus = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { status } = req.body;

    if (!SELLER_ADVANCEABLE_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const request = await ReturnRequest.findOne({
      _id: req.params.id,
      seller: sellerId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Return request not found" });
    }

    const allowedPrev = ALLOWED_PREVIOUS[status] || [];
    if (!allowedPrev.includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot move a request from "${request.status}" to "${status}"`,
      });
    }

    if (
      (status === RETURN_STATUS.REFUND_PROCESSING ||
        status === RETURN_STATUS.REFUNDED) &&
      request.requestType !== "return"
    ) {
      return res.status(400).json({
        success: false,
        message: "This request is an exchange, not a return",
      });
    }
    if (
      (status === RETURN_STATUS.EXCHANGE_PROCESSING ||
        status === RETURN_STATUS.EXCHANGE_COMPLETED) &&
      request.requestType !== "exchange"
    ) {
      return res.status(400).json({
        success: false,
        message: "This request is a return, not an exchange",
      });
    }

    request.status = status;
    request.statusHistory.push({
      status,
      changedBy: sellerId,
      role: "seller",
      timestamp: new Date(),
    });
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Return status updated",
      data: request,
    });
  } catch (error) {
    console.error("❌ Update return status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update return status",
    });
  }
};
