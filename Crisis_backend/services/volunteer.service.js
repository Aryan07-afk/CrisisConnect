const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');

/**
 * Get all volunteers with optional availability / skill filters.
 */
const getAllVolunteers = async (filters = {}) => {
  const query = { role: 'volunteer', isActive: true };

  if (filters.isAvailable !== undefined) query.isAvailable = filters.isAvailable === 'true';
  if (filters.skill) query.skills = { $in: [filters.skill] };

  return User.find(query).select('-password').sort({ name: 1 });
};

/**
 * Get a volunteer's profile along with their assigned requests.
 */
const getVolunteerProfile = async (volunteerId, requestingUser) => {
  const isSelf = requestingUser._id.toString() === volunteerId;
  const isPrivileged = ['admin', 'coordinator'].includes(requestingUser.role);

  if (!isSelf && !isPrivileged) {
    const err = new Error('Not authorised');
    err.statusCode = 403;
    throw err;
  }

  const volunteer = await User.findById(volunteerId).select('-password');
  if (!volunteer) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const assignedRequests = await HelpRequest.find({ assignedTo: volunteer._id })
    .select('title status priority requestType location createdAt')
    .sort({ createdAt: -1 });

  return { volunteer, assignedRequests };
};

/**
 * Toggle a volunteer's availability flag.
 */
const toggleAvailability = async (volunteerId, requestingUser) => {
  const isSelf = requestingUser._id.toString() === volunteerId;
  const isAdmin = requestingUser.role === 'admin';

  if (!isSelf && !isAdmin) {
    const err = new Error('Not authorised');
    err.statusCode = 403;
    throw err;
  }

  const volunteer = await User.findOne({ _id: volunteerId, role: 'volunteer' });
  if (!volunteer) {
    const err = new Error('Volunteer not found');
    err.statusCode = 404;
    throw err;
  }

  volunteer.isAvailable = !volunteer.isAvailable;
  await volunteer.save();
  return { isAvailable: volunteer.isAvailable };
};

module.exports = { getAllVolunteers, getVolunteerProfile, toggleAvailability };
