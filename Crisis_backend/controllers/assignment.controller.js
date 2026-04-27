const assignmentService = require('../services/assignment.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Assign a volunteer to a help request
// @route  POST /api/assignments
// @access Admin, Coordinator
const createAssignment = async (req, res) => {
  try {
    const { requestId, volunteerId, skipSkillCheck } = req.body;
    const result = await assignmentService.createAssignment({
      requestId,
      volunteerId,
      assignedById: req.user._id,
      skipSkillCheck,
    });
    // Skill-gating soft block: return warning instead of creating
    if (result && result.warning) {
      return successResponse(res, 200, result.message, { warning: true, requiresConfirmation: true });
    }
    return successResponse(res, 201, 'Volunteer assigned successfully', result);
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

// @desc   Delete / cancel an assignment
// @route  DELETE /api/assignments/:id
// @access Admin, Coordinator (own assignments only)
const deleteAssignment = async (req, res) => {
  try {
    await assignmentService.deleteAssignment(req.params.id, req.user);
    return successResponse(res, 200, 'Assignment cancelled');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get recommended best matches for a request
// @route  GET /api/assignments/best-match/:requestId
// @access Admin, Coordinator
const getBestMatches = async (req, res) => {
  try {
    const matches = await assignmentService.findBestMatches(req.params.requestId);
    return successResponse(res, 200, 'Best matches fetched', matches);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  createAssignment, getAllAssignments, getMyAssignments,
  updateAssignmentStatus, deleteAssignment, getBestMatches,
};
