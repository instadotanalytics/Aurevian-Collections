// backend/models/PlatformSettings.js
// Single-document config store. Both fields default to null — commission
// and payout minimums must be explicitly set by a super admin. Nothing
// downstream is allowed to fall back to a guessed number when these are
// null; see sellerEarningsController.js.

import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "singleton", unique: true },
    commissionPercent: { type: Number, default: null, min: 0, max: 100 },
    minimumPayoutAmount: { type: Number, default: null, min: 0 },
  },
  { timestamps: true },
);

platformSettingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ singleton: "singleton" });
  if (!doc) doc = await this.create({ singleton: "singleton" });
  return doc;
};

export default mongoose.model("PlatformSettings", platformSettingsSchema);
