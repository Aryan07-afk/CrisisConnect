const victimService = require('../services/victim.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Submit a new SOS / help request (victim)
// @route  POST /api/victim/requests
// @access Victim
const submitRequest = async (req, res) => {
  try {
    const request = await victimService.submitRequest(req.user._id, req.body);
    return successResponse(res, 201, 'SOS request submitted successfully', request);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get all my submitted requests (victim) — paginated
// @route  GET /api/victim/requests/my?page=1&limit=20
// @access Victim
const getMyRequests = async (req, res) => {
  try {
    const result = await victimService.getMyRequests(req.user._id, req.query);
    return successResponse(res, 200, 'Requests fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get single request detail (victim - own only)
// @route  GET /api/victim/requests/:id
// @access Victim
const getRequestById = async (req, res) => {
  try {
    const request = await victimService.getRequestById(req.params.id, req.user._id);
    return successResponse(res, 200, 'Request fetched', request);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Update a pending request (victim)
// @route  PUT /api/victim/requests/:id
// @access Victim
const updateRequest = async (req, res) => {
  try {
    const request = await victimService.updateRequest(req.params.id, req.user._id, req.body);
    return successResponse(res, 200, 'Request updated', request);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Cancel/withdraw a request (victim)
// @route  DELETE /api/victim/requests/:id
// @access Victim
const cancelRequest = async (req, res) => {
  try {
    await victimService.cancelRequest(req.params.id, req.user._id);
    return successResponse(res, 200, 'Request cancelled');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// ── ADMIN / COORDINATOR VIEWS ──────────────────────────

// @desc   Get all victim requests (admin/coordinator) — paginated
// @route  GET /api/victim?page=1&limit=20&status=submitted
// @access Admin, Coordinator
const getAllVictimRequests = async (req, res) => {
  try {
    const result = await victimService.getAllVictimRequests(req.query);
    return successResponse(res, 200, 'All victim requests fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Update victim request status + link to HelpRequest (admin/coordinator)
// @route  PATCH /api/victim/:id/manage
// @access Admin, Coordinator
const manageVictimRequest = async (req, res) => {
  try {
    const request = await victimService.manageVictimRequest(req.params.id, req.body);
    return successResponse(res, 200, 'Victim request updated', request);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  submitRequest, getMyRequests, getRequestById,
  updateRequest, cancelRequest,
  getAllVictimRequests, manageVictimRequest,
};
