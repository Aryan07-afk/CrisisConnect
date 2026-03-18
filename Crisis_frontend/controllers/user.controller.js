const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get all users (admin)
// @route  GET /api/users
// @access Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users fetched', users);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get single user by ID
// @route  GET /api/users/:id
// @access Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, 'User fetched', user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Update user profile (self or admin)
// @route  PUT /api/users/:id
// @access Private
const updateUser = async (req, res) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return errorResponse(res, 403, 'Not authorised to update this user');
    }

    const allowed = ['name', 'phone', 'organization', 'skills', 'location', 'isAvailable'];
    if (isAdmin) allowed.push('role', 'isActive');

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, 'User updated', user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Deactivate / activate a user (admin only)
// @route  PATCH /api/users/:id/toggle-status
// @access Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, {
      isActive: user.isActive,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Delete user (admin only)
// @route  DELETE /api/users/:id
// @access Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, 'User deleted');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, toggleUserStatus, deleteUser };
