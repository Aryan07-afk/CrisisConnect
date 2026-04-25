const Assignment = require('../models/Assignment');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const paginate = require('../utils/pagination');
const { sendCriticalAssignmentEmail } = require('./email.service');

/**
 * Assign a volunteer to a help request.
 */
const createAssignment = async ({ requestId, volunteerId, assignedById }) => {
  const [helpRequest, volunteer] = await Promise.all([
    HelpRequest.findById(requestId),
    User.findOne({ _id: volunteerId, role: 'volunteer', isActive: true, isAvailable: true }),
  ]);

  if (!helpRequest) {
    const err = new Error('Help request not found');
    err.statusCode = 404;
    throw err;
  }
  if (!volunteer) {
    const err = new Error('Volunteer not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  if (['resolved', 'cancelled'].includes(helpRequest.status)) {
    const err = new Error('Cannot assign to a resolved or cancelled request');
    err.statusCode = 400;
    throw err;
  }

  // Check for existing active assignment
  const existing = await Assignment.findOne({ request: requestId, volunteer: volunteerId });
  if (existing) {
    const err = new Error('Volunteer is already assigned to this request');
    err.statusCode = 400;
    throw err;
  }

  const assignment = await Assignment.create({
    request: requestId,
    volunteer: volunteerId,
    assignedBy: assignedById,
  });

  // Update the help request
  helpRequest.assignedTo = volunteerId;
  helpRequest.status = 'assigned';
  helpRequest.reviewedBy = assignedById;
  await helpRequest.save();

  // Mark volunteer as unavailable
  volunteer.isAvailable = false;
  await volunteer.save();

  await assignment.populate([
    { path: 'request', select: 'title status priority' },
    { path: 'volunteer', select: 'name email phone' },
    { path: 'assignedBy', select: 'name role' },
  ]);

  // Send email if priority is critical
  if (helpRequest.priority === 'critical') {
    sendCriticalAssignmentEmail(volunteer, helpRequest).catch(() => {});
  }

  return assignment;
};

/**
 * Get all assignments with optional filters (paginated).
 */
const getAllAssignments = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.volunteer) query.volunteer = filters.volunteer;
  if (filters.request) query.request = filters.request;

  const mongoQuery = Assignment.find(query)
    .populate('request', 'title status priority requestType location')
    .populate('volunteer', 'name email phone skills')
    .populate('assignedBy', 'name role')
    .sort({ createdAt: -1 });

  return paginate(mongoQuery, { page: filters.page, limit: filters.limit });
};

/**
 * Get assignments for a specific volunteer (paginated).
 */
const getMyAssignments = async (volunteerId, queryParams = {}) => {
  const mongoQuery = Assignment.find({ volunteer: volunteerId })
    .populate('request', 'title status priority requestType location affectedCount createdAt')
    .sort({ createdAt: -1 });

  return paginate(mongoQuery, { page: queryParams.page, limit: queryParams.limit });
};

/**
 * Update assignment status with proper state-machine transitions.
 * Also syncs the HelpRequest status and volunteer availability.
 */
const updateAssignmentStatus = async (assignmentId, requestingUser, { status, remarks }) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    throw err;
  }

  const isSelf = assignment.volunteer.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'admin';

  if (!isSelf && !isAdmin) {
    const err = new Error('Not authorised to update this assignment');
    err.statusCode = 403;
    throw err;
  }

  const validTransitions = {
    assigned: ['accepted', 'rejected'],
    accepted: ['in_progress'],
    in_progress: ['completed'],
  };

  if (!validTransitions[assignment.status]?.includes(status)) {
    const err = new Error(`Cannot transition from '${assignment.status}' to '${status}'`);
    err.statusCode = 400;
    throw err;
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

  return assignment;
};

/**
 * Delete / cancel an assignment (admin only).
 * Reverts the help request to pending and frees the volunteer.
 */
const deleteAssignment = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    throw err;
  }

  if (['completed', 'rejected'].includes(assignment.status)) {
    const err = new Error('Cannot delete a completed or rejected assignment');
    err.statusCode = 400;
    throw err;
  }

  await assignment.deleteOne();

  // Revert request to pending
  await HelpRequest.findByIdAndUpdate(assignment.request, {
    status: 'pending',
    assignedTo: null,
  });

  // Free volunteer
  await User.findByIdAndUpdate(assignment.volunteer, { isAvailable: true });
};

module.exports = {
  createAssignment, getAllAssignments, getMyAssignments,
  updateAssignmentStatus, deleteAssignment,
};
