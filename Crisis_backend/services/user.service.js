const User = require('../models/User');
const paginate = require('../utils/pagination');

/**
 * List users with optional role / isActive filters + pagination.
 */
const getAllUsers = async (filters = {}) => {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';

  const mongoQuery = User.find(query).select('-password').sort({ createdAt: -1 });
  return paginate(mongoQuery, { page: filters.page, limit: filters.limit });
};

/**
 * Fetch a single user by ID.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Update a user's profile.
 * - Regular users can only update their own allowed fields.
 * - Admins can additionally update role & isActive.
 */
const updateUser = async (targetUserId, requestingUser, body) => {
  const isSelf = requestingUser._id.toString() === targetUserId;
  const isAdmin = requestingUser.role === 'admin';

  if (!isSelf && !isAdmin) {
    const err = new Error('Not authorised to update this user');
    err.statusCode = 403;
    throw err;
  }

  const allowed = ['name', 'phone', 'organization', 'skills', 'location', 'isAvailable'];
  if (isAdmin) {
    allowed.push('role', 'isActive');
  } else if (isSelf && body.isActive === false) {
    allowed.push('isActive');
  }

  const updates = {};
  allowed.forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  const user = await User.findByIdAndUpdate(targetUserId, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Toggle a user's isActive flag.
 */
const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  user.isActive = !user.isActive;
  await user.save();
  return { isActive: user.isActive };
};

/**
 * Delete a user by ID.
 */
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAllUsers, getUserById, updateUser, toggleUserStatus, deleteUser };
