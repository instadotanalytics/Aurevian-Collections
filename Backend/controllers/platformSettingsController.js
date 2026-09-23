// backend/controllers/platformSettingsController.js
// Super-admin-only configuration of the platform-wide commission rate
// and minimum payout amount. Mounted under the already-protected
// /api/super-admin router (see superAdminRoutes.js — protectSuperAdmin
// is applied to the whole router), so no extra auth check is needed here
// beyond what protectSuperAdmin already guarantees.

import PlatformSettings from "../models/PlatformSettings.js";
import { logAudit } from "../services/auditLogService.js";

// GET /api/super-admin/settings/platform
export const getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    return res.status(200).json({
      success: true,
      data: {
        commissionPercent: settings.commissionPercent,
        minimumPayoutAmount: settings.minimumPayoutAmount,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Get platform settings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load platform settings" });
  }
};

// PATCH /api/super-admin/settings/platform
export const updatePlatformSettings = async (req, res) => {
  try {
    const { commissionPercent, minimumPayoutAmount } = req.body;

    if (commissionPercent !== undefined) {
      const pct = Number(commissionPercent);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: "commissionPercent must be a number between 0 and 100",
        });
      }
    }
    if (minimumPayoutAmount !== undefined) {
      const amt = Number(minimumPayoutAmount);
      if (Number.isNaN(amt) || amt < 0) {
        return res.status(400).json({
          success: false,
          message: "minimumPayoutAmount must be a non-negative number",
        });
      }
    }

    const settings = await PlatformSettings.getSettings();
    const previous = {
      commissionPercent: settings.commissionPercent,
      minimumPayoutAmount: settings.minimumPayoutAmount,
    };

    if (commissionPercent !== undefined) {
      settings.commissionPercent = Number(commissionPercent);
    }
    if (minimumPayoutAmount !== undefined) {
      settings.minimumPayoutAmount = Number(minimumPayoutAmount);
    }
    settings.updatedBy = req.admin._id;
    await settings.save();

    await logAudit({
      action: "PLATFORM_SETTINGS_UPDATE",
      entityType: "PlatformSettings",
      entityId: settings._id,
      performedBy: req.admin._id,
      performedByRole: "super_admin",
      previousStatus: previous,
      newStatus: {
        commissionPercent: settings.commissionPercent,
        minimumPayoutAmount: settings.minimumPayoutAmount,
      },
      reason: "Admin updated platform financial settings",
    });

    return res.status(200).json({
      success: true,
      message: "Platform settings updated",
      data: {
        commissionPercent: settings.commissionPercent,
        minimumPayoutAmount: settings.minimumPayoutAmount,
      },
    });
  } catch (error) {
    console.error("❌ Update platform settings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update platform settings" });
  }
};
