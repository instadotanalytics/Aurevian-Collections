// backend/controllers/promotionController.js — NEW FILE

import mongoose from "mongoose";
import PromotionRequest, {
  GATED_SECTIONS,
} from "../models/PromotionRequest.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import { getPlan } from "../services/subscriptionPlanService.js";
import { expireIfNeeded } from "./subscriptionController.js";

// ============================================
// STATIC GUIDELINES — shown to sellers before they submit. Not yet
// admin-configurable (see note in delivery message); enforcement in
// validateProductEligibility below IS real and always runs regardless
// of what the UI displays.
// ============================================
export const PROMOTION_GUIDELINES = {
  "curated-for-you": {
    title: "Curated For You Guidelines",
    eligiblePlans: ["gold", "platinum"],
    rules: [
      "Product must be Published and active",
      "Product must have a valid thumbnail image",
      "Product must have a valid price greater than ₹0",
      "Product must have available stock",
      "Product must comply with marketplace policies",
      "Gold or Platinum membership required",
      "Subject to Super Admin approval before it appears on the homepage",
    ],
  },
  "new-collections": {
    title: "New Collections Guidelines",
    eligiblePlans: ["gold", "platinum"],
    rules: [
      "Product must be Published and active",
      "Product must have a valid thumbnail image",
      "Product must have a valid price greater than ₹0",
      "Product must have available stock",
      "Product must comply with marketplace policies",
      "Gold or Platinum membership required",
      "Subject to Super Admin approval before it appears on the homepage",
    ],
  },
};

const isValidGatedSection = (section) => GATED_SECTIONS.includes(section);

// Real, enforced eligibility check — not just displayed copy.
const validateProductEligibility = (product) => {
  const errors = [];
  if (!product) {
    return ["Product not found"];
  }
  if (product.status !== "Published") {
    errors.push("Product must be Published");
  }
  if (!product.isActive) {
    errors.push("Product must be active");
  }
  if (!product.thumbnail?.url) {
    errors.push("Product must have a thumbnail image");
  }
  const price = product.pricing?.salePrice || product.pricing?.originalPrice;
  if (!price || price <= 0) {
    errors.push("Product must have a valid price greater than ₹0");
  }
  if (!product.inventory || (product.inventory.stockQuantity || 0) <= 0) {
    errors.push("Product must have available stock");
  }
  return errors;
};

// ============================================
// PUBLIC — GUIDELINES
// ============================================
export const getPromotionGuidelines = async (req, res) => {
  return res.status(200).json({ success: true, data: PROMOTION_GUIDELINES });
};

// ============================================
// SELLER — ENTITLEMENT SUMMARY
// Shows current plan's homepage promotion access + usage counts, so the
// seller UI can render "3 of 10 used" / locked states without guessing.
// ============================================
export const getSellerEntitlementSummary = async (req, res) => {
  try {
    const seller = await expireIfNeeded(req.seller);
    const plan = await getPlan(seller.subscriptionPlanId || "free");
    const entitlement = plan?.homepagePromotion || { enabled: false, limit: 0 };

    const usage = {};
    for (const section of GATED_SECTIONS) {
      usage[section] = await PromotionRequest.countDocuments({
        seller: seller._id,
        section,
        status: { $in: ["pending", "approved"] },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        planId: plan?.id || "free",
        planName: plan?.name || "Free",
        subscriptionStatus: seller.subscriptionStatus,
        subscriptionExpiresAt: seller.subscriptionExpiresAt,
        homepagePromotion: entitlement,
        usage,
      },
    });
  } catch (error) {
    console.error("❌ Get seller entitlement summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get entitlement summary",
      error: error.message,
    });
  }
};

// ============================================
// SELLER — SEARCH OWN PRODUCTS ELIGIBLE FOR SUBMISSION
// Excludes products that already have a pending/approved request for
// this section.
// ============================================
export const getSellerAvailableProductsForPromotion = async (req, res) => {
  try {
    const { section, search, page = 1, limit = 20 } = req.query;
    const sellerId = req.seller._id;

    if (!isValidGatedSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${GATED_SECTIONS.join(", ")}`,
      });
    }

    const excludedIds = await PromotionRequest.find({
      seller: sellerId,
      section,
      status: { $in: ["pending", "approved"] },
    }).distinct("product");

    const query = {
      "seller.sellerId": sellerId,
      status: "Published",
      isActive: true,
      _id: { $nin: excludedIds },
    };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      JewelleryProduct.find(query)
        .select(
          "productName productSlug thumbnail pricing inventory.stockQuantity category status isActive",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JewelleryProduct.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ Get seller available products for promotion error:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
};

// ============================================
// SELLER — SUBMIT A PROMOTION REQUEST
// Guarded upstream by requireFeature("HOMEPAGE_PROMOTION") + checkPromotionLimit
// ============================================
export const submitPromotionRequest = async (req, res) => {
  try {
    const { section, productId } = req.body;
    const sellerId = req.seller._id;

    if (!isValidGatedSection(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Must be one of: ${GATED_SECTIONS.join(", ")}`,
      });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid productId is required",
      });
    }

    const product = await JewelleryProduct.findOne({
      _id: productId,
      "seller.sellerId": sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to you",
      });
    }

    const eligibilityErrors = validateProductEligibility(product);
    if (eligibilityErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Product does not meet the eligibility requirements",
        errors: eligibilityErrors,
      });
    }

    const existing = await PromotionRequest.findOne({
      seller: sellerId,
      product: productId,
      section,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `This product already has a ${existing.status} request for this section`,
      });
    }

    const request = await PromotionRequest.create({
      seller: sellerId,
      product: productId,
      section,
      planIdAtRequest: req.sellerPlan.id,
      status: "pending",
    });

    const populated = await request.populate(
      "product",
      "productName productSlug thumbnail pricing status isActive",
    );

    console.log(
      `✅ Promotion request submitted: seller=${sellerId} product=${productId} section=${section}`,
    );

    return res.status(201).json({
      success: true,
      message: "Promotion request submitted for review",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A pending or approved request already exists for this product in this section",
      });
    }
    console.error("❌ Submit promotion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit promotion request",
      error: error.message,
    });
  }
};

// ============================================
// SELLER — LIST OWN PROMOTION REQUESTS
// ============================================
export const getSellerPromotionRequests = async (req, res) => {
  try {
    const { section } = req.query;
    const query = { seller: req.seller._id };
    if (section) {
      if (!isValidGatedSection(section)) {
        return res.status(400).json({
          success: false,
          message: `Invalid section. Must be one of: ${GATED_SECTIONS.join(", ")}`,
        });
      }
      query.section = section;
    }

    const requests = await PromotionRequest.find(query)
      .sort({ createdAt: -1 })
      .populate(
        "product",
        "productName productSlug thumbnail pricing status isActive",
      )
      .lean();

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Get seller promotion requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get promotion requests",
      error: error.message,
    });
  }
};

// ============================================
// SELLER — CANCEL A PENDING REQUEST
// ============================================
export const cancelPromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PromotionRequest.findOne({
      _id: id,
      seller: req.seller._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Promotion request not found or does not belong to you",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending requests can be cancelled (this one is ${request.status})`,
      });
    }

    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Promotion request cancelled",
    });
  } catch (error) {
    console.error("❌ Cancel promotion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel promotion request",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — LIST PROMOTION REQUESTS
// ============================================
export const getPromotionRequestsAdmin = async (req, res) => {
  try {
    const { status, section, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (section && section !== "all") {
      if (!isValidGatedSection(section)) {
        return res.status(400).json({
          success: false,
          message: `Invalid section. Must be one of: ${GATED_SECTIONS.join(", ")}`,
        });
      }
      query.section = section;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      PromotionRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate(
          "seller",
          "firstName lastName fullName email storeInfo.storeName subscriptionPlanId subscriptionStatus subscriptionExpiresAt",
        )
        .populate(
          "product",
          "productName productSlug thumbnail pricing status isActive",
        )
        .populate("reviewedBy", "firstName lastName fullName")
        .lean(),
      PromotionRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get admin promotion requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get promotion requests",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — APPROVE
// ============================================
export const approvePromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, keepActiveAfterPlanExpiry } = req.body;

    const request = await PromotionRequest.findById(id)
      .populate("seller", "subscriptionPlanId")
      .populate("product");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Promotion request not found",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This request is already approved",
      });
    }

    // Re-validate at approval time — plan or product may have changed
    // since the seller submitted.
    const plan = await getPlan(request.seller?.subscriptionPlanId || "free");
    if (!plan?.homepagePromotion?.enabled) {
      return res.status(409).json({
        success: false,
        message: `This seller's current plan (${plan?.name || request.seller?.subscriptionPlanId}) no longer includes homepage promotion.`,
      });
    }

    const eligibilityErrors = validateProductEligibility(request.product);
    if (eligibilityErrors.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Product no longer meets eligibility requirements",
        errors: eligibilityErrors,
      });
    }

    request.status = "approved";
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    request.startDate = startDate ? new Date(startDate) : new Date();
    request.endDate = endDate ? new Date(endDate) : null;
    request.keepActiveAfterPlanExpiry = !!keepActiveAfterPlanExpiry;
    request.rejectionReason = null;
    await request.save();

    console.log(
      `✅ Promotion request ${id} approved by admin ${req.admin._id}`,
    );

    return res.status(200).json({
      success: true,
      message: "Promotion request approved",
      data: request,
    });
  } catch (error) {
    console.error("❌ Approve promotion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve promotion request",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — REJECT
// ============================================
export const rejectPromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection reason",
      });
    }

    const request = await PromotionRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Promotion request not found",
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason;
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    await request.save();

    console.log(
      `✅ Promotion request ${id} rejected by admin ${req.admin._id}`,
    );

    return res.status(200).json({
      success: true,
      message: "Promotion request rejected",
      data: request,
    });
  } catch (error) {
    console.error("❌ Reject promotion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject promotion request",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN — REMOVE / TAKE DOWN an approved promotion
// ============================================
export const removePromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PromotionRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Promotion request not found",
      });
    }

    request.status = "removed";
    request.reviewedBy = req.admin._id;
    request.reviewedAt = new Date();
    await request.save();

    console.log(`✅ Promotion request ${id} removed by admin ${req.admin._id}`);

    return res.status(200).json({
      success: true,
      message: "Promotion removed from the homepage",
      data: request,
    });
  } catch (error) {
    console.error("❌ Remove promotion request error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove promotion request",
      error: error.message,
    });
  }
};
