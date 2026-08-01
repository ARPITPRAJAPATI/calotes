// Import mongoose utilities for schema and model creation
import mongoose, { Schema, model, models } from 'mongoose';

/**
 * AuditLog — immutable append-only record of admin actions.
 *
 * Every admin mutation (order status change, role change, product delete,
 * price update, refund grant) must create an AuditLog entry BEFORE or AFTER
 * the mutation so there is a permanent attributable trail.
 *
 * This satisfies the requirement that "no single admin account can silently
 * alter orders/refunds without an audit trail."
 *
 * IMPORTANT: Never delete or update AuditLog documents. Use soft-delete or
 * archival approaches only. The immutability is the security guarantee.
 */
const AuditLogSchema = new Schema(
  {
    // Type of action that was performed (e.g. 'ORDER_STATUS_CHANGED', 'ROLE_CHANGED', 'PRODUCT_DELETED')
    action: {
      type: String,
      required: true,
      enum: [
        'ORDER_STATUS_CHANGED',
        'ORDER_PAYMENT_STATUS_CHANGED',
        'ROLE_CHANGED',
        'PRODUCT_CREATED',
        'PRODUCT_UPDATED',
        'PRODUCT_DELETED',
        'PROMO_CREATED',
        'PROMO_UPDATED',
        'PROMO_DELETED',
        'SETTINGS_UPDATED',
        'ADMIN_LOGIN',
      ],
    },
    // The admin user who performed the action — required for attribution
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Human-readable email of the admin at time of action (denormalized for readability even if account is later deleted)
    adminEmail: {
      type: String,
      required: true,
    },
    // The collection/model being mutated
    targetModel: {
      type: String,
      required: true,
    },
    // The ObjectId of the document being mutated
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    // Snapshot of the document state BEFORE the mutation (for diff/rollback)
    before: {
      type: Schema.Types.Mixed,
      default: null,
    },
    // Snapshot of the document state AFTER the mutation (for auditing final state)
    after: {
      type: Schema.Types.Mixed,
      default: null,
    },
    // IP address of the admin making the request (for geographic anomaly detection)
    ip: {
      type: String,
      default: 'unknown',
    },
    // Optional freetext reason or note for the action (e.g. "Customer requested refund via email")
    reason: {
      type: String,
      default: '',
    },
  },
  // createdAt is the canonical timestamp of the audit event.
  // updatedAt is intentionally not useful here — documents should never be updated.
  { timestamps: true }
);

// Index for fast lookup by target document (e.g. get all history for order X)
AuditLogSchema.index({ targetModel: 1, targetId: 1, createdAt: -1 });
// Index for admin attribution queries (e.g. all actions by admin Y)
AuditLogSchema.index({ adminId: 1, createdAt: -1 });

const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);

export default AuditLog;
