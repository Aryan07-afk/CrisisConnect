const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get dashboard summary stats
// @route  GET /api/dashboard/stats
// @access Admin, Coordinator
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      inProgressRequests,
      resolvedRequests,
      criticalRequests,
      totalVolunteers,
      availableVolunteers,
      totalAssignments,
    ] = await Promise.all([
      HelpRequest.countDocuments(),
      HelpRequest.countDocuments({ status: 'pending' }),
      HelpRequest.countDocuments({ status: { $in: ['assigned', 'in_progress'] } }),
      HelpRequest.countDocuments({ status: 'resolved' }),
      HelpRequest.countDocuments({ priority: 'critical', status: { $ne: 'resolved' } }),
      User.countDocuments({ role: 'volunteer', isActive: true }),
      User.countDocuments({ role: 'volunteer', isActive: true, isAvailable: true }),
      Assignment.countDocuments(),
    ]);

    // Request breakdown by type
    const requestsByType = await HelpRequest.aggregate([
      { $group: { _id: '$requestType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Request breakdown by priority
    const requestsByPriority = await HelpRequest.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Recent 5 pending critical requests
    const urgentRequests = await HelpRequest.find({
      status: 'pending',
      priority: { $in: ['critical', 'high'] },
    })
      .populate('raisedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 200, 'Dashboard stats fetched', {
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        resolved: resolvedRequests,
        critical: criticalRequests,
      },
      volunteers: {
        total: totalVolunteers,
        available: availableVolunteers,
        busy: totalVolunteers - availableVolunteers,
      },
      assignments: { total: totalAssignments },
      requestsByType,
      requestsByPriority,
      urgentRequests,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get recent activity feed
// @route  GET /api/dashboard/activity
// @access Admin, Coordinator
const getRecentActivity = async (req, res) => {
  try {
    const recentRequests = await HelpRequest.find()
      .populate('raisedBy', 'name role')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title status priority requestType location updatedAt raisedBy assignedTo');

    return successResponse(res, 200, 'Recent activity fetched', recentRequests);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getDashboardStats, getRecentActivity };
