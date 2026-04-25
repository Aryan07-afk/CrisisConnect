const HelpRequest = require('../models/HelpRequest');
const paginate = require('../utils/pagination');

/**
 * Create a new help request.
 */
const createRequest = async (data, raisedById) => {
  const helpRequest = await HelpRequest.create({
    title: data.title,
    description: data.description,
    requestType: data.requestType,
    priority: data.priority,
    location: data.location,
    affectedCount: data.affectedCount,
    raisedBy: raisedById,
  });

  await helpRequest.populate('raisedBy', 'name email role');
  return helpRequest;
};

/**
 * Get all help requests with optional filters (paginated).
 * Volunteers can only see their own raised requests.
 */
const getAllRequests = async (filters, requestingUser) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.requestType) query.requestType = filters.requestType;
  if (filters.raisedBy) query.raisedBy = filters.raisedBy;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;

  // Volunteers and victims can only see their own raised requests
  if (requestingUser.role === 'volunteer' || requestingUser.role === 'victim') {
    query.raisedBy = requestingUser._id;
  }

  const mongoQuery = HelpRequest.find(query)
    .populate('raisedBy', 'name email')
    .populate('assignedTo', 'name email phone')
    .sort({ priority: -1, createdAt: -1 });

  return paginate(mongoQuery, { page: filters.page, limit: filters.limit });
};

/**
 * Get a single help request by ID.
 */
const getRequestById = async (requestId) => {
  const request = await HelpRequest.findById(requestId)
    .populate('raisedBy', 'name email phone')
    .populate('assignedTo', 'name email phone')
    .populate('reviewedBy', 'name email')
    .populate('notes.author', 'name role');

  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  return request;
};

/**
 * Update a help request.
 * Volunteers can only update their own pending requests.
 */
const updateRequest = async (requestId, requestingUser, body) => {
  const request = await HelpRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  // Volunteers can only update their own requests
  if (
    requestingUser.role === 'volunteer' &&
    request.raisedBy.toString() !== requestingUser._id.toString()
  ) {
    const err = new Error('Not authorised to update this request');
    err.statusCode = 403;
    throw err;
  }

  const allowedFields = ['title', 'description', 'requestType', 'priority', 'location', 'affectedCount'];
  if (['admin', 'coordinator'].includes(requestingUser.role)) allowedFields.push('status', 'assignedTo', 'reviewedBy');

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) request[field] = body[field];
  });

  if (body.status === 'resolved') {
    request.reviewedBy = requestingUser._id;
  }

  await request.save();
  await request.populate('raisedBy', 'name email');
  await request.populate('assignedTo', 'name email phone');

  return request;
};

/**
 * Add a note/comment to a help request.
 */
const addNote = async (requestId, authorId, message) => {
  const request = await HelpRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  request.notes.push({ author: authorId, message });
  await request.save();
  await request.populate('notes.author', 'name role');

  return request.notes;
};

/**
 * Delete a help request.
 * Only admins or the owner (when still pending) can delete.
 */
const deleteRequest = async (requestId, requestingUser) => {
  const request = await HelpRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = request.raisedBy.toString() === requestingUser._id.toString();
  const isPending = request.status === 'pending';
  const isAdmin = requestingUser.role === 'admin';

  if (!isAdmin && !(isOwner && isPending)) {
    const err = new Error('Cannot delete this request');
    err.statusCode = 403;
    throw err;
  }

  await request.deleteOne();
};

module.exports = {
  createRequest, getAllRequests, getRequestById,
  updateRequest, addNote, deleteRequest,
};
