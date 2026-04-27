const dashboardService = require('../services/dashboard.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get dashboard summary stats
// @route  GET /api/dashboard/stats
// @access Admin, Coordinator
const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return successResponse(res, 200, 'Dashboard stats fetched', stats);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get recent activity feed
// @route  GET /api/dashboard/activity
// @access Admin, Coordinator
const getRecentActivity = async (req, res) => {
  try {
    const activity = await dashboardService.getRecentActivity();
    return successResponse(res, 200, 'Recent activity fetched', activity);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get heatmap data for disaster locations
// @route  GET /api/dashboard/heatmap
// @access Admin, Coordinator
const getHeatmapData = async (req, res) => {
  try {
    const data = await dashboardService.getHeatmapData();
    return successResponse(res, 200, 'Heatmap data fetched', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get volunteer positions for map display
// @route  GET /api/dashboard/volunteer-positions
// @access Admin, Coordinator
const getVolunteerPositions = async (req, res) => {
  try {
    const data = await dashboardService.getVolunteerPositions();
    return successResponse(res, 200, 'Volunteer positions fetched', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getDashboardStats, getRecentActivity, getHeatmapData, getVolunteerPositions };
