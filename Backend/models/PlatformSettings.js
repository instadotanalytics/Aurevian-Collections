// backend/models/PlatformSettings.js
// Single-document config store for platform-wide financial settings.
//
// ✅ CHANGED — commissionPercent now defaults to 10 (was null). The
// platform's core business rule is "10% commission on every eligible
// sale" and that must work out of the box; a super admin can still
// change it via PATCH /api/super-admin/settings/platform (see
// platformSettingsController.js). minimumPayoutAmount now defaults to 0
// (no minimum enforced) rather than null/"payouts disabled" — a super
// admin can raise it later. Every consumer of this document (see
// commissionService.js, sellerEarningsController.js) reads these two
// fields fresh at calculation time; nothing hardcodes "10" anywhere else
// in the codebase.

import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "singleton", unique: true },
    // Percentage, e.g. 10 means 10%. Defaults to the platform's standard
    // marketplace commission rate.
    commissionPercent: { type: Number, default: 10, min: 0, max: 100 },
    // 0 = no minimum enforced.
    minimumPayoutAmount: { type: Number, default: 0, min: 0 },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
  },
  { timestamps: true },
);

platformSettingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ singleton: "singleton" });
  if (!doc) doc = await this.create({ singleton: "singleton" });
  return doc;
};

export default mongoose.model("PlatformSettings", platformSettingsSchema);
