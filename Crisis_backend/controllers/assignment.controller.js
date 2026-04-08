const assignmentService = require('../services/assignment.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Assign a volunteer to a help request
// @route  POST /api/assignments
// @access Admin, Coordinator
const createAssignment = async (req, res) => {
  try {
    const { requestId, volunteerId } = req.body;
    const assignment = await assignmentService.createAssignment({
      requestId,
      volunteerId,
      assignedById: req.user._id,
    });
    return successResponse(res, 201, 'Volunteer assigned successfully', assignment);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get all assignments (with filters) — paginated
// @route  GET /api/assignments?page=1&limit=20
// @access Admin, Coordinator
const getAllAssignments = async (req, res) => {
  try {
    const result = await assignmentService.getAllAssignments(req.query);
    return successResponse(res, 200, 'Assignments fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get assignments for logged-in volunteer — paginated
// @route  GET /api/assignments/my?page=1&limit=20
// @access Volunteer
const getMyAssignments = async (req, res) => {
  try {
    const result = await assignmentService.getMyAssignments(req.user._id, req.query);
    return successResponse(res, 200, 'My assignments fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Update assignment status (volunteer accepts/rejects or marks progress)
// @route  PATCH /api/assignments/:id/status
// @access Volunteer (own), Admin
const updateAssignmentStatus = async (req, res) => {
  try {
    const assignment = await assignmentService.updateAssignmentStatus(
      req.params.id, req.user, req.body
    );
    return successResponse(res, 200, 'Assignment status updated', assignment);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Delete / cancel an assignment (admin only)
// @route  DELETE /api/assignments/:id
// @access Admin
const deleteAssignment = async (req, res) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);
    return successResponse(res, 200, 'Assignment cancelled');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  createAssignment, getAllAssignments, getMyAssignments,
  updateAssignmentStatus, deleteAssignment,
};
