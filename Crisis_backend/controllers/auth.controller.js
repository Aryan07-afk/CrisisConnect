const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return successResponse(res, 201, 'Registration successful', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get current logged-in user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return successResponse(res, 200, 'Profile fetched', user);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Update password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    await authService.changePassword(req.user._id, req.body);
    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Forgot password — send reset email
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    return successResponse(res, 200, 'Password reset email sent. Please check your inbox.');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Reset password via token
// @route  PUT /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    return successResponse(res, 200, 'Password reset successful. You can now sign in with your new password.');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
