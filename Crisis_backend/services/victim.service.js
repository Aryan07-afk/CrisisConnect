const VictimRequest = require('../models/VictimRequest');
const paginate = require('../utils/pagination');

/**
 * Submit a new SOS / help request.
 */
const submitRequest = async (victimId, data) => {
  const request = await VictimRequest.create({
    victim: victimId,
    needType: data.needType,
    description: data.description,
    urgency: data.urgency,
    peopleCount: data.peopleCount,
    location: data.location,
  });

  await request.populate('victim', 'name email phone');
  return request;
};

/**
 * Get all requests submitted by a specific victim (paginated).
 */
const getMyRequests = async (victimId, queryParams = {}) => {
  const query = VictimRequest.find({ victim: victimId })
    .populate('linkedRequest', 'title status assignedTo')
    .sort({ createdAt: -1 });
  return paginate(query, { page: queryParams.page, limit: queryParams.limit });
};

/**
 * Get a single victim request (own only).
 */
const getRequestById = async (requestId, victimId) => {
  const request = await VictimRequest.findOne({
    _id: requestId,
    victim: victimId,
  }).populate('linkedRequest', 'title status assignedTo priority');

  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  return request;
};

/**
 * Update a pending/reviewing request.
 */
const updateRequest = async (requestId, victimId, body) => {
  const request = await VictimRequest.findOne({
    _id: requestId,
    victim: victimId,
  });

  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  if (!['submitted', 'reviewing'].includes(request.status)) {
    const err = new Error('Cannot edit a request that is already being handled');
    err.statusCode = 400;
    throw err;
  }

  const allowed = ['needType', 'description', 'urgency', 'peopleCount', 'location'];
  allowed.forEach(f => { if (body[f] !== undefined) request[f] = body[f]; });
  await request.save();

  return request;
};

/**
 * Cancel / withdraw a request.
 */
const cancelRequest = async (requestId, victimId) => {
  const request = await VictimRequest.findOne({
    _id: requestId,
    victim: victimId,
  });

  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  if (!['submitted', 'reviewing'].includes(request.status)) {
    const err = new Error('Cannot cancel a request that is already being handled');
    err.statusCode = 400;
    throw err;
  }

  request.status = 'closed';
  await request.save();
};

/**
 * Get all victim requests (admin / coordinator view) — paginated.
 */
const getAllVictimRequests = async (filters = {}) => {
  const query = {};
  if (filters.status)   query.status   = filters.status;
  if (filters.urgency)  query.urgency  = filters.urgency;
  if (filters.needType) query.needType = filters.needType;

  const mongoQuery = VictimRequest.find(query)
    .populate('victim', 'name email phone address district state')
    .populate('linkedRequest', 'title status')
    .sort({ createdAt: -1 });

  return paginate(mongoQuery, { page: filters.page, limit: filters.limit });
};

/**
 * Update victim request status and optionally link to a HelpRequest (admin / coordinator).
 */
const manageVictimRequest = async (requestId, { status, linkedRequest, responseNote }) => {
  const request = await VictimRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  if (status)        request.status       = status;
  if (linkedRequest) request.linkedRequest = linkedRequest;
  if (responseNote)  request.responseNote  = responseNote;
  await request.save();

  await request.populate('victim', 'name email');
  await request.populate('linkedRequest', 'title status');
  return request;
};

module.exports = {
  submitRequest, getMyRequests, getRequestById,
  updateRequest, cancelRequest,
  getAllVictimRequests, manageVictimRequest,
};
