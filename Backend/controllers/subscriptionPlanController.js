// backend/controllers/subscriptionPlanController.js — full file (createPlan/deletePlan updated)

import SubscriptionPlan from "../models/SubscriptionPlan.js";

// ============================================
// GET ALL PLANS (Admin) — includes inactive ones
// ============================================
export const getAllPlansAdmin = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.getAllSorted();
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error("❌ Get all plans (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans",
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE PLAN (Admin)
// ============================================
export const getPlanByIdAdmin = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findOne({ id: req.params.id });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error("❌ Get plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    });
  }
};

// ============================================
// CREATE PLAN — now supports any custom slug, not just the original 4
// ============================================
export const createPlan = async (req, res) => {
  try {
    const adminId = req.admin.id;
    let { id } = req.body;

    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Plan id (slug) is required",
      });
    }

    // Normalize: lowercase, spaces/underscores → hyphens, strip anything else
    id = id
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan id must contain at least one letter or number",
      });
    }

    const existing = await SubscriptionPlan.findOne({ id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A plan with id "${id}" already exists — edit it instead of creating a new one`,
      });
    }

    const {
      name,
      icon,
      price,
      priceDisplay,
      bestFor,
      isPopular,
      badge,
      commissionRate,
      settlementDays,
      productLimit,
      imagesPerProduct,
      supportLevel,
      sellerLevel,
      isSuperSeller,
      durationDays,
      features,
      order,
      isActive,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      !priceDisplay ||
      commissionRate === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "name, price, priceDisplay and commissionRate are required",
      });
    }

    // Default new plans to the end of the list unless an order is given
    let planOrder = order;
    if (planOrder === undefined || planOrder === null) {
      const last = await SubscriptionPlan.findOne()
        .sort({ order: -1 })
        .select("order");
      planOrder = last ? last.order + 1 : 0;
    }

    const plan = await SubscriptionPlan.create({
      id,
      name,
      icon: icon || "🟢",
      price,
      priceDisplay,
      bestFor: bestFor || "",
      isPopular: !!isPopular,
      badge: badge || null,
      commissionRate,
      settlementDays: settlementDays ?? 0,
      productLimit: productLimit ?? 0,
      imagesPerProduct: imagesPerProduct ?? 1,
      supportLevel: supportLevel || "Email",
      sellerLevel: sellerLevel || "basic",
      isSuperSeller: !!isSuperSeller,
      durationDays: durationDays || 30,
      features: Array.isArray(features) ? features : [],
      order: planOrder,
      isActive: isActive !== undefined ? isActive : true,
      isSystemPlan: false,
      createdBy: adminId,
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("❌ Create plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE PLAN
// ============================================
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const plan = await SubscriptionPlan.findOne({ id });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    const editableFields = [
      "name",
      "icon",
      "price",
      "priceDisplay",
      "bestFor",
      "isPopular",
      "badge",
      "commissionRate",
      "settlementDays",
      "productLimit",
      "imagesPerProduct",
      "supportLevel",
      "sellerLevel",
      "isSuperSeller",
      "durationDays",
      "features",
      "order",
      "isActive",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    if (plan.isSystemPlan && req.body.isActive === false) {
      return res.status(400).json({
        success: false,
        message: `The ${plan.name} plan can't be deactivated — it's a protected system plan`,
      });
    }

    plan.updatedBy = adminId;
    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("❌ Update plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: error.message,
    });
  }
};

// ============================================
// TOGGLE PLAN STATUS
// ============================================
export const togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const plan = await SubscriptionPlan.findOne({ id });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    if (plan.isSystemPlan && plan.isActive) {
      return res.status(400).json({
        success: false,
        message: `The ${plan.name} plan can't be deactivated — it's a protected system plan`,
      });
    }

    plan.isActive = !plan.isActive;
    plan.updatedBy = adminId;
    await plan.save();

    return res.status(200).json({
      success: true,
      message: `Plan ${plan.isActive ? "activated" : "deactivated"} successfully`,
      data: plan,
    });
  } catch (error) {
    console.error("❌ Toggle plan status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle plan status",
      error: error.message,
    });
  }
};

// ============================================
// DELETE PLAN — only custom (non-system) plans can be deleted
// ============================================
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findOne({ id });
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    if (plan.isSystemPlan) {
      return res.status(400).json({
        success: false,
        message: `The ${plan.name} plan is protected and can't be deleted`,
      });
    }

    await plan.deleteOne();

    return res.status(200).json({
      success: true,
      message: `${plan.name} plan deleted successfully`,
    });
  } catch (error) {
    console.error("❌ Delete plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE PLAN ORDER (drag-reorder support)
// ============================================
export const updatePlanOrder = async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }]

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: "orders array is required",
      });
    }

    const updates = orders.map(({ id, order }) =>
      SubscriptionPlan.findOneAndUpdate({ id }, { order }, { new: true }),
    );
    const updated = await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: "Plan order updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Update plan order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update plan order",
      error: error.message,
    });
  }
};
