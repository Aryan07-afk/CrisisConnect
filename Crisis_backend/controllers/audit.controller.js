const auditService = require('../services/audit.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get audit logs (admin) — most recent first
// @route  GET /api/audit?action=user_role_changed&limit=50
// @access Admin
const getAuditLogs = async (req, res) => {
  try {
    const logs = await auditService.getAuditLogs(req.query);
    return successResponse(res, 200, 'Audit logs fetched', logs);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getAuditLogs };
