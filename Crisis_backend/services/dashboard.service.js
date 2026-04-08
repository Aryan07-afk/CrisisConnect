const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

/**
 * Aggregate dashboard statistics.
 */
const getDashboardStats = async () => {
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

  return {
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
  };
};

/**
 * Get the recent activity feed (last 10 updated requests).
 */
const getRecentActivity = async () => {
  return HelpRequest.find()
    .populate('raisedBy', 'name role')
    .populate('assignedTo', 'name')
    .sort({ updatedAt: -1 })
    .limit(10)
    .select('title status priority requestType location updatedAt raisedBy assignedTo');
};

module.exports = { getDashboardStats, getRecentActivity };
