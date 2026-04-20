const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Get all users (admin) — paginated
// @route  GET /api/users?page=1&limit=20&role=volunteer&isActive=true
// @access Admin
const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);
    return successResponse(res, 200, 'Users fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get single user by ID
// @route  GET /api/users/:id
// @access Admin
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, 200, 'User fetched', user);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Update user profile (self or admin)
// @route  PUT /api/users/:id
// @access Private
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.user, req.body);
    return successResponse(res, 200, 'User updated', user);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Deactivate / activate a user (admin only)
// @route  PATCH /api/users/:id/toggle-status
// @access Admin
const toggleUserStatus = async (req, res) => {
  try {
    const result = await userService.toggleUserStatus(req.params.id, req.user);
    const label = result.isActive ? 'activated' : 'deactivated';
    return successResponse(res, 200, `User ${label}`, result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Delete user (admin only)
// @route  DELETE /api/users/:id
// @access Admin
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
    return successResponse(res, 200, 'User deleted');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, toggleUserStatus, deleteUser };
