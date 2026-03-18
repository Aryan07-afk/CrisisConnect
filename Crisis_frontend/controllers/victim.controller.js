const VictimRequest = require('../models/VictimRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Submit a new SOS / help request (victim)
// @route  POST /api/victim/requests
// @access Victim
const submitRequest = async (req, res) => {
  try {
    const {
      needType, description, urgency,
      peopleCount, location,
    } = req.body;

    const request = await VictimRequest.create({
      victim: req.user._id,
      needType, description, urgency,
      peopleCount, location,
    });

    await request.populate('victim', 'name email phone');
    return successResponse(res, 201, 'SOS request submitted successfully', request);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get all my submitted requests (victim)
// @route  GET /api/victim/requests/my
// @access Victim
const getMyRequests = async (req, res) => {
  try {
    const requests = await VictimRequest.find({ victim: req.user._id })
      .populate('linkedRequest', 'title status assignedTo')
      .sort({ createdAt: -1 });
    return successResponse(res, 200, 'Requests fetched', requests);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get single request detail (victim - own only)
// @route  GET /api/victim/requests/:id
// @access Victim
const getRequestById = async (req, res) => {
  try {
    const request = await VictimRequest.findOne({
      _id: req.params.id,
      victim: req.user._id,
    }).populate('linkedRequest', 'title status assignedTo priority');

    if (!request) return errorResponse(res, 404, 'Request not found');
    return successResponse(res, 200, 'Request fetched', request);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Update a pending request (victim)
// @route  PUT /api/victim/requests/:id
// @access Victim
const updateRequest = async (req, res) => {
  try {
    const request = await VictimRequest.findOne({
      _id: req.params.id,
      victim: req.user._id,
    });

    if (!request) return errorResponse(res, 404, 'Request not found');
    if (!['submitted', 'reviewing'].includes(request.status)) {
      return errorResponse(res, 400, 'Cannot edit a request that is already being handled');
    }

    const allowed = ['needType', 'description', 'urgency', 'peopleCount', 'location'];
    allowed.forEach(f => { if (req.body[f] !== undefined) request[f] = req.body[f]; });
    await request.save();

    return successResponse(res, 200, 'Request updated', request);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Cancel/withdraw a request (victim)
// @route  DELETE /api/victim/requests/:id
// @access Victim
const cancelRequest = async (req, res) => {
  try {
    const request = await VictimRequest.findOne({
      _id: req.params.id,
      victim: req.user._id,
    });

    if (!request) return errorResponse(res, 404, 'Request not found');
    if (!['submitted', 'reviewing'].includes(request.status)) {
      return errorResponse(res, 400, 'Cannot cancel a request that is already being handled');
    }

    request.status = 'closed';
    await request.save();
    return successResponse(res, 200, 'Request cancelled');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── ADMIN / COORDINATOR VIEWS ──────────────────────────

// @desc   Get all victim requests (admin/coordinator)
// @route  GET /api/victim/requests
// @access Admin, Coordinator
const getAllVictimRequests = async (req, res) => {
  try {
    const { status, urgency, needType } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (urgency)  filter.urgency  = urgency;
    if (needType) filter.needType = needType;

    const requests = await VictimRequest.find(filter)
      .populate('victim', 'name email phone address district state')
      .populate('linkedRequest', 'title status')
      .sort({ urgency: -1, createdAt: -1 });

    return successResponse(res, 200, 'All victim requests fetched', requests);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Update victim request status + link to HelpRequest (admin/coordinator)
// @route  PATCH /api/victim/requests/:id/manage
// @access Admin, Coordinator
const manageVictimRequest = async (req, res) => {
  try {
    const { status, linkedRequest, responseNote } = req.body;
    const request = await VictimRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, 'Request not found');

    if (status)        request.status       = status;
    if (linkedRequest) request.linkedRequest = linkedRequest;
    if (responseNote)  request.responseNote  = responseNote;
    await request.save();

    await request.populate('victim', 'name email');
    await request.populate('linkedRequest', 'title status');
    return successResponse(res, 200, 'Victim request updated', request);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  submitRequest, getMyRequests, getRequestById,
  updateRequest, cancelRequest,
  getAllVictimRequests, manageVictimRequest,
};
