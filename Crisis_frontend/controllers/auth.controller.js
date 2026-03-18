const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, organization, skills, location } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 400, 'Email already registered');
    }

    const user = await User.create({
      name, email, password, role, phone, organization, skills, location,
    });

    const token = generateToken(user._id);

    return successResponse(res, 201, 'Registration successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated');
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, 'Login successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Get current logged-in user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, 'Profile fetched', user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc   Update password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = { register, login, getMe, changePassword };
