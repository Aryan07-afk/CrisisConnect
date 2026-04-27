const Assignment = require('../models/Assignment');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const paginate = require('../utils/pagination');
const { sendCriticalAssignmentEmail } = require('./email.service');

/**
 * Assign a volunteer to a help request.
 */
const createAssignment = async ({ requestId, volunteerId, assignedById, skipSkillCheck }) => {
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

  // Skill-gating soft block for critical/high priority tasks
  if (!skipSkillCheck && ['critical', 'high'].includes(helpRequest.priority)) {
    const requiredSkill = helpRequest.requestType;
    const hasSkill = volunteer.skills && volunteer.skills.includes(requiredSkill);
    if (!hasSkill) {
      return {
        warning: true,
        message: `Volunteer "${volunteer.name}" does not have the "${requiredSkill}" skill required for this ${helpRequest.priority}-priority task. Their skills: ${volunteer.skills?.join(', ') || 'none'}. Proceed anyway?`,
        requiresConfirmation: true,
      };
    }
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
  const isCoordinator = requestingUser.role === 'coordinator';

  if (!isSelf && !isAdmin && !isCoordinator) {
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
 * Delete / cancel an assignment.
 * Admins can delete any assignment. Coordinators can only delete assignments they created.
 * Reverts the help request to pending and frees the volunteer.
 */
const deleteAssignment = async (assignmentId, requestingUser) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    const err = new Error('Assignment not found');
    err.statusCode = 404;
    throw err;
  }

  // Coordinators can only cancel assignments they created
  if (requestingUser.role === 'coordinator' &&
      assignment.assignedBy.toString() !== requestingUser._id.toString()) {
    const err = new Error('Coordinators can only cancel assignments they created');
    err.statusCode = 403;
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

/**
 * Calculates Haversine distance in km between two lat/lng points
 */
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Returns a list of best-matching volunteers for a request based on skills and proximity.
 */
const findBestMatches = async (requestId) => {
  const request = await HelpRequest.findById(requestId);
  if (!request) {
    const err = new Error('Help request not found');
    err.statusCode = 404;
    throw err;
  }

  // 1. Get all available volunteers
  const volunteers = await User.find({ role: 'volunteer', isActive: true, isAvailable: true });

  const reqLat = request.location?.coordinates?.lat;
  const reqLng = request.location?.coordinates?.lng;
  const requiredSkill = request.requestType; // e.g., 'medical', 'rescue'

  // 2. Score them
  const scored = volunteers.map((vol) => {
    let score = 0;
    
    // Skill Match Filter/Score (+50 points)
    const hasSkill = vol.skills && vol.skills.includes(requiredSkill);
    if (hasSkill) {
      score += 50;
    }

    // Distance Score (Up to 50 points based on proximity)
    let distanceKm = null;
    if (reqLat && reqLng && vol.coordinates?.lat && vol.coordinates?.lng) {
      distanceKm = getDistanceFromLatLonInKm(
        reqLat, reqLng,
        vol.coordinates.lat, vol.coordinates.lng
      );
      
      // Inverse distance weighting: 0km = 50 pts, 10km = ~10 pts, >50km = ~0 pts
      // Example formula: max(0, 50 - distanceKm)
      score += Math.max(0, 50 - distanceKm);
    } else {
      // If no coords available, assume medium distance or zero bonus
      score += 10;
    }

    return {
      volunteer: vol,
      score,
      distanceKm,
      hasSkill
    };
  });

  // 3. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5); // Return top 5
};

module.exports = {
  createAssignment, getAllAssignments, getMyAssignments,
  updateAssignmentStatus, deleteAssignment, findBestMatches,
};
