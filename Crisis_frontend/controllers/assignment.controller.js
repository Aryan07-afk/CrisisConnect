const Assignment = require('../models/Assignment');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Assign a volunteer to a help request
// @route  POST /api/assignments
// @access Admin, Coordinator
const createAssignment = async (req, res) => {
  try {
    const { requestId, volunteerId } = req.body;

    const [helpRequest, volunteer] = await Promise.all([
      HelpRequest.findById(requestId),
      User.findOne({ _id: volunteerId, role: 'volunteer', isActive: true }),
    ]);

    if (!helpRequest) return errorResponse(res, 404, 'Help request not found');
    if (!volunteer) return errorResponse(res, 404, 'Volunteer not found or inactive');

    if (['resolved', 'cancelled'].includes(helpRequest.status)) {
      return errorResponse(res, 400, 'Cannot assign to a resolved or cancelled request');
    }

    // Check for existing active assignment
    const existing = await Assignment.findOne({ request: requestId, volunteer: volunteerId });
    if (existing) return errorResponse(res, 400, 'Volunteer is already assigned to this request');

    const assignment = await Assignment.create({
      request: requestId,
      volunteer: volunteerId,
      assignedBy: req.user._id,
    });

    // Update the help request
    helpRequest.assignedTo = volunteerId;
    helpRequest.status = 'assigned';
    helpRequest.reviewedBy = req.user._id;
    await helpRequest.save();

    // Mark volunteer as unavailable
    volunteer.isAvailable = false;
    await volunteer.save();

    await assignment.populate([
      { path: 'request', select: 'title status priority' },
      { path: 'volunteer', select: 'name email phone' },
      { path: 'assignedBy', select: 'name role' },
    ]);

    return successResponse(res, 201, 'Volunteer assigned successfully', assignment);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get all assignments (with filters)
// @route  GET /api/assignments
// @access Admin, Coordinator
const getAllAssignments = async (req, res) => {
  try {
    const { status, volunteer, request } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (volunteer) filter.volunteer = volunteer;
    if (request) filter.request = request;

    const assignments = await Assignment.find(filter)
      .populate('request', 'title status priority requestType location')
      .populate('volunteer', 'name email phone skills')
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Assignments fetched', assignments);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get assignments for logged-in volunteer
// @route  GET /api/assignments/my
// @access Volunteer
const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ volunteer: req.user._id })
      .populate('request', 'title status priority requestType location affectedCount createdAt')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'My assignments fetched', assignments);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Update assignment status (volunteer accepts/rejects or marks progress)
// @route  PATCH /api/assignments/:id/status
// @access Volunteer (own), Admin
const updateAssignmentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return errorResponse(res, 404, 'Assignment not found');

    const isSelf = assignment.volunteer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return errorResponse(res, 403, 'Not authorised to update this assignment');
    }

    const validTransitions = {
      assigned: ['accepted', 'rejected'],
      accepted: ['in_progress'],
      in_progress: ['completed'],
    };

    if (!validTransitions[assignment.status]?.includes(status)) {
      return errorResponse(
        res, 400,
        `Cannot transition from '${assignment.status}' to '${status}'`
      );
    }

    assignment.status = status;
    if (remarks) assignment.remarks = remarks;
    if (status === 'accepted') assignment.acceptedAt = new Date();
    if (status === 'completed') assignment.completedAt = new Date();
    await assignment.save();

    // Sync HelpRequest status
    const helpRequest = await HelpRequest.findById(assignment.request);
    if (helpRequest) {
      if (status === 'in_progress') helpRequest.status = 'in_progress';
      if (status === 'completed') helpRequest.status = 'resolved';
      if (status === 'rejected') {
        helpRequest.status = 'pending';
        helpRequest.assignedTo = null;
      }
      await helpRequest.save();
    }

    // Free up volunteer if rejected or completed
    if (['rejected', 'completed'].includes(status)) {
      await User.findByIdAndUpdate(assignment.volunteer, { isAvailable: true });
    }

    return successResponse(res, 200, 'Assignment status updated', assignment);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Delete / cancel an assignment (admin only)
// @route  DELETE /api/assignments/:id
// @access Admin
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return errorResponse(res, 404, 'Assignment not found');

    // Revert request to pending
    await HelpRequest.findByIdAndUpdate(assignment.request, {
      status: 'pending',
      assignedTo: null,
    });

    // Free volunteer
    await User.findByIdAndUpdate(assignment.volunteer, { isAvailable: true });

    return successResponse(res, 200, 'Assignment cancelled');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createAssignment, getAllAssignments, getMyAssignments,
  updateAssignmentStatus, deleteAssignment,
};
