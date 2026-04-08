const requestService = require('../services/request.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Create a new help request
// @route  POST /api/requests
// @access Volunteer, Coordinator, Admin
const createRequest = async (req, res) => {
  try {
    const helpRequest = await requestService.createRequest(req.body, req.user._id);
    return successResponse(res, 201, 'Help request created', helpRequest);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get all help requests (with filters)
// @route  GET /api/requests
// @access Private
const getAllRequests = async (req, res) => {
  try {
    const requests = await requestService.getAllRequests(req.query, req.user);
    return successResponse(res, 200, 'Requests fetched', requests);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get single help request
// @route  GET /api/requests/:id
// @access Private
const getRequestById = async (req, res) => {
  try {
    const request = await requestService.getRequestById(req.params.id);
    return successResponse(res, 200, 'Request fetched', request);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Update a help request
// @route  PUT /api/requests/:id
// @access Volunteer (own), Coordinator, Admin
const updateRequest = async (req, res) => {
  try {
    const request = await requestService.updateRequest(req.params.id, req.user, req.body);
    return successResponse(res, 200, 'Request updated', request);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Add a note/comment to a request
// @route  POST /api/requests/:id/notes
// @access Private
const addNote = async (req, res) => {
  try {
    const notes = await requestService.addNote(req.params.id, req.user._id, req.body.message);
    return successResponse(res, 200, 'Note added', notes);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Delete a help request
// @route  DELETE /api/requests/:id
// @access Admin, or volunteer (own + pending)
const deleteRequest = async (req, res) => {
  try {
    await requestService.deleteRequest(req.params.id, req.user);
    return successResponse(res, 200, 'Request deleted');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  createRequest, getAllRequests, getRequestById,
  updateRequest, addNote, deleteRequest,
};
