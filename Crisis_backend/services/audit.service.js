const AuditLog = require('../models/AuditLog');

/**
 * Record an administrative action. Fire-and-forget: never throws into the
 * caller's flow — a failed audit write must not break the main operation.
 */
const recordAudit = ({ actor, action, targetType, targetId, targetLabel, meta }) => {
  AuditLog.create({
    actor: actor._id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    targetType,
    targetId,
    targetLabel,
    meta: meta || {},
  }).catch((err) => console.error('[Audit] Failed to record audit log:', err.message));
};

/**
 * List audit logs with optional filters + pagination.
 */
const getAuditLogs = async (filters = {}) => {
  const query = {};
  if (filters.action) query.action = filters.action;
  if (filters.actor) query.actor = filters.actor;

  const mongoQuery = AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(filters.limit, 10) || 50, 200));

  return mongoQuery;
};

module.exports = { recordAudit, getAuditLogs };
