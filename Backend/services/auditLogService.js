// backend/services/auditLogService.js
import AuditLog from "../models/AuditLog.js";

/**
 * Writes one audit trail entry. Deliberately swallows errors — an audit
 * log failure must never block or roll back the real financial action it
 * is describing; it only logs to console so the gap is visible.
 */
export async function logAudit({
  action,
  entityType,
  entityId,
  performedBy,
  performedByRole,
  previousStatus,
  newStatus,
  reason,
  metadata,
}) {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId,
      performedBy,
      performedByRole,
      previousStatus,
      newStatus,
      reason,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("⚠️ Audit log write failed:", error.message);
  }
}

export default { logAudit };
