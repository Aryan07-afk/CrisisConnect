const HelpRequest = require('../models/HelpRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Create a new help request
// @route  POST /api/requests
// @access Volunteer, Coordinator, Admin
const createRequest = async (req, res) => {
  try {
    const {
      title, description, requestType, priority,
      location, affectedCount,
    } = req.body;

    const helpRequest = await HelpRequest.create({
      title, description, requestType, priority,
      location, affectedCount,
      raisedBy: req.user._id,
    });

    await helpRequest.populate('raisedBy', 'name email role');
    return successResponse(res, 201, 'Help request created', helpRequest);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get all help requests (with filters)
// @route  GET /api/requests
// @access Private
const getAllRequests = async (req, res) => {
  try {
    const { status, priority, requestType, raisedBy, assignedTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (requestType) filter.requestType = requestType;
    if (raisedBy) filter.raisedBy = raisedBy;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Volunteers can only see their own raised requests
    if (req.user.role === 'volunteer') {
      filter.raisedBy = req.user._id;
    }

    const requests = await HelpRequest.find(filter)
      .populate('raisedBy', 'name email')
      .populate('assignedTo', 'name email phone')
      .sort({ priority: -1, createdAt: -1 });

    return successResponse(res, 200, 'Requests fetched', requests);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get single help request
// @route  GET /api/requests/:id
// @access Private
const getRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('raisedBy', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('reviewedBy', 'name email')
      .populate('notes.author', 'name role');

    if (!request) return errorResponse(res, 404, 'Request not found');
    return successResponse(res, 200, 'Request fetched', request);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Update a help request
// @route  PUT /api/requests/:id
// @access Volunteer (own), Coordinator, Admin
const updateRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, 'Request not found');

    // Volunteers can only update their own pending requests
    if (
      req.user.role === 'volunteer' &&
      request.raisedBy.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Not authorised to update this request');
    }

    const allowedFields = ['title', 'description', 'requestType', 'priority', 'location', 'affectedCount'];
    if (req.user.role !== 'volunteer') allowedFields.push('status', 'assignedTo', 'reviewedBy');

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) request[field] = req.body[field];
    });

    if (req.body.status === 'resolved') {
      request.reviewedBy = req.user._id;
    }

    await request.save();
    await request.populate('raisedBy', 'name email');
    await request.populate('assignedTo', 'name email phone');

    return successResponse(res, 200, 'Request updated', request);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Add a note/comment to a request
// @route  POST /api/requests/:id/notes
// @access Private
const addNote = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, 'Request not found');

    request.notes.push({ author: req.user._id, message: req.body.message });
    await request.save();
    await request.populate('notes.author', 'name role');

    return successResponse(res, 200, 'Note added', request.notes);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Delete a help request
// @route  DELETE /api/requests/:id
// @access Admin, or volunteer (own + pending)
const deleteRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request) return errorResponse(res, 404, 'Request not found');

    const isOwner = request.raisedBy.toString() === req.user._id.toString();
    const isPending = request.status === 'pending';
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !(isOwner && isPending)) {
      return errorResponse(res, 403, 'Cannot delete this request');
    }

    await request.deleteOne();
    return successResponse(res, 200, 'Request deleted');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createRequest, getAllRequests, getRequestById,
  updateRequest, addNote, deleteRequest,
};
