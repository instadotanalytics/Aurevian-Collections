// backend/controllers/headerConfigController.js

import HeaderConfig from "../models/HeaderConfig.js";
import { getActiveHeaderConfig } from "../services/headerConfigService.js";

// ============================================
// GET ACTIVE HEADER CONFIG (Public — used by the storefront navbar)
// ============================================
export const getPublicHeaderConfig = async (req, res) => {
  try {
    const config = await getActiveHeaderConfig();
    if (!config) {
      return res
        .status(404)
        .json({ success: false, message: "Header config not found" });
    }
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("❌ Get public header config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch header config",
      error: error.message,
    });
  }
};

// ============================================
// GET HEADER CONFIG (Admin)
// ============================================
export const getHeaderConfigAdmin = async (req, res) => {
  try {
    let config = await HeaderConfig.findOne({ key: "active" });
    if (!config) {
      config = await HeaderConfig.create({ key: "active" });
    }
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("❌ Get header config (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch header config",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE HEADER CONFIG (Admin) — full-document replace, since the
// admin UI always sends the complete edited object back.
// ============================================
export const updateHeaderConfigAdmin = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const editableFields = [
      "announcements",
      "mainNav",
      "shopMegaMenu",
      "giftGuideMegaMenu",
      "collectionsDropdown",
      "offersDropdown",
      "aboutDropdown",
    ];

    const update = { updatedBy: adminId };
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    const config = await HeaderConfig.findOneAndUpdate(
      { key: "active" },
      update,
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Header updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("❌ Update header config error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update header config",
      error: error.message,
    });
  }
};
