// backend/models/AuditLog.js
// Generic, append-only audit trail. Rows here are never edited or
// deleted by application code. Used for financial admin actions
// (payout status changes, commission-rate changes) so there is always a
// record of who did what and when, per the audit-trail requirement.

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true }, // e.g. "PAYOUT_STATUS_CHANGE", "PLATFORM_SETTINGS_UPDATE"
    entityType: { type: String, required: true, index: true }, // e.g. "SellerPayout", "PlatformSettings"
    entityId: { type: mongoose.Schema.Types.ObjectId, index: true },

    performedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedByRole: {
      type: String,
      enum: ["super_admin", "seller", "system"],
      required: true,
    },

    previousStatus: mongoose.Schema.Types.Mixed,
    newStatus: mongoose.Schema.Types.Mixed,
    reason: String,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

export default mongoose.model("AuditLog", auditLogSchema);
