const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get all volunteers (optionally filter by availability/skill)
// @route  GET /api/volunteers
// @access Admin, Coordinator
const getAllVolunteers = async (req, res) => {
  try {
    const { isAvailable, skill } = req.query;
    const filter = { role: 'volunteer', isActive: true };

    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (skill) filter.skills = { $in: [skill] };

    const volunteers = await User.find(filter).select('-password').sort({ name: 1 });
    return successResponse(res, 200, 'Volunteers fetched', volunteers);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get volunteer profile with their assigned requests
// @route  GET /api/volunteers/:id
// @access Admin, Coordinator, Self
const getVolunteerProfile = async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isPrivileged = ['admin', 'coordinator'].includes(req.user.role);

    if (!isSelf && !isPrivileged) {
      return errorResponse(res, 403, 'Not authorised');
    }

    const volunteer = await User.findOne({ _id: req.params.id, role: 'volunteer' }).select('-password');
    if (!volunteer) return errorResponse(res, 404, 'Volunteer not found');

    const assignedRequests = await HelpRequest.find({ assignedTo: volunteer._id })
      .select('title status priority requestType location createdAt')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Volunteer profile fetched', {
      volunteer,
      assignedRequests,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Toggle volunteer availability
// @route  PATCH /api/volunteers/:id/availability
// @access Self, Admin
const toggleAvailability = async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return errorResponse(res, 403, 'Not authorised');
    }

    const volunteer = await User.findOne({ _id: req.params.id, role: 'volunteer' });
    if (!volunteer) return errorResponse(res, 404, 'Volunteer not found');

    volunteer.isAvailable = !volunteer.isAvailable;
    await volunteer.save();

    return successResponse(res, 200, `Volunteer is now ${volunteer.isAvailable ? 'available' : 'unavailable'}`, {
      isAvailable: volunteer.isAvailable,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getAllVolunteers, getVolunteerProfile, toggleAvailability };
