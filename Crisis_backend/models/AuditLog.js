const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Denormalised for readability even if the actor is later deleted
    actorName: { type: String },
    actorRole: { type: String },
    action: {
      type: String,
      required: true,
      enum: [
        'user_role_changed',
        'user_deactivated',
        'user_activated',
        'user_deleted',
        'coordinator_approved',
        'coordinator_rejected',
        'assignment_created',
        'assignment_cancelled',
      ],
      index: true,
    },
    targetType: {
      type: String,
      enum: ['User', 'CoordinatorApplication', 'Assignment', 'HelpRequest'],
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetLabel: { type: String }, // human-readable, e.g. user email
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { from: 'volunteer', to: 'admin' }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
