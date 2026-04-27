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

/**
 * Get heatmap data — disaster locations with intensity based on priority.
 * Returns coordinates from HelpRequests that have lat/lng.
 */
const getHeatmapData = async () => {
  const INTENSITY_MAP = {
    critical: 1.0,
    high: 0.75,
    medium: 0.5,
    low: 0.25,
  };

  const requests = await HelpRequest.find({
    status: { $in: ['pending', 'assigned', 'in_progress'] },
    'location.coordinates.lat': { $exists: true, $ne: null },
    'location.coordinates.lng': { $exists: true, $ne: null },
  }).select('location.coordinates priority status location.area location.address requestType affectedCount');

  return requests.map((r) => ({
    lat: r.location.coordinates.lat,
    lng: r.location.coordinates.lng,
    intensity: INTENSITY_MAP[r.priority] || 0.5,
    area: r.location.area || r.location.address,
    priority: r.priority,
    status: r.status,
    type: r.requestType,
    affected: r.affectedCount,
  }));
};

/**
 * Get positions of available volunteers for map display.
 */
const getVolunteerPositions = async () => {
  const volunteers = await User.find({
    role: 'volunteer',
    isActive: true,
    isAvailable: true,
    'coordinates.lat': { $exists: true, $ne: null },
    'coordinates.lng': { $exists: true, $ne: null },
  }).select('name skills coordinates location');

  return volunteers.map((v) => ({
    _id: v._id,
    name: v.name,
    skills: v.skills,
    lat: v.coordinates.lat,
    lng: v.coordinates.lng,
    location: v.location,
  }));
};

module.exports = { getDashboardStats, getRecentActivity, getHeatmapData, getVolunteerPositions };
