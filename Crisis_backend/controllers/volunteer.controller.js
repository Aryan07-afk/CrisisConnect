const volunteerService = require('../services/volunteer.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get all volunteers (optionally filter by availability/skill)
// @route  GET /api/volunteers
// @access Admin, Coordinator
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await volunteerService.getAllVolunteers(req.query);
    return successResponse(res, 200, 'Volunteers fetched', volunteers);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get volunteer profile with their assigned requests
// @route  GET /api/volunteers/:id
// @access Admin, Coordinator, Self
const getVolunteerProfile = async (req, res) => {
  try {
    const result = await volunteerService.getVolunteerProfile(req.params.id, req.user);
    return successResponse(res, 200, 'Volunteer profile fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Toggle volunteer availability
// @route  PATCH /api/volunteers/:id/availability
// @access Self, Admin
const toggleAvailability = async (req, res) => {
  try {
    const result = await volunteerService.toggleAvailability(req.params.id, req.user);
    const label = result.isAvailable ? 'available' : 'unavailable';
    return successResponse(res, 200, `Volunteer is now ${label}`, result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getAllVolunteers, getVolunteerProfile, toggleAvailability };
