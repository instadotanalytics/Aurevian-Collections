// backend/models/PaymentSettings.js
import mongoose from "mongoose";

// Singleton settings document — one row governs checkout-wide payment
// availability. Read by the public checkout flow, written by admin only.
const paymentSettingsSchema = new mongoose.Schema(
  {
    codEnabled: { type: Boolean, default: true },
    // 0 = no minimum/maximum enforced
    codMinOrderAmount: { type: Number, default: 0 },
    codMaxOrderAmount: { type: Number, default: 0 },
    onlinePaymentEnabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
  },
  { timestamps: true },
);

paymentSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
