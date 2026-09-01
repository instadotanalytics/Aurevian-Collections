// backend/controllers/paymentSettingsController.js
import PaymentSettings from "../models/PaymentSettings.js";

// GET /api/payment-settings — public, storefront reads this before
// deciding whether to render the COD option at all.
export const getPaymentSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.getSingleton();
    return res.status(200).json({
      success: true,
      data: {
        codEnabled: settings.codEnabled,
        codMinOrderAmount: settings.codMinOrderAmount,
        codMaxOrderAmount: settings.codMaxOrderAmount,
        onlinePaymentEnabled: settings.onlinePaymentEnabled,
      },
    });
  } catch (error) {
    console.error("❌ Get payment settings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment settings" });
  }
};

// PATCH /api/payment-settings — admin only
export const updatePaymentSettings = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const {
      codEnabled,
      codMinOrderAmount,
      codMaxOrderAmount,
      onlinePaymentEnabled,
    } = req.body;

    const settings = await PaymentSettings.getSingleton();
    if (codEnabled !== undefined) settings.codEnabled = !!codEnabled;
    if (codMinOrderAmount !== undefined)
      settings.codMinOrderAmount = Math.max(0, Number(codMinOrderAmount) || 0);
    if (codMaxOrderAmount !== undefined)
      settings.codMaxOrderAmount = Math.max(0, Number(codMaxOrderAmount) || 0);
    if (onlinePaymentEnabled !== undefined)
      settings.onlinePaymentEnabled = !!onlinePaymentEnabled;
    settings.updatedBy = req.user._id || req.user.id;
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Payment settings updated",
      data: settings,
    });
  } catch (error) {
    console.error("❌ Update payment settings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update payment settings" });
  }
};
