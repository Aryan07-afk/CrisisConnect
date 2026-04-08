const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user.
 * @returns {{ token, user }} on success
 * @throws  Error with a `statusCode` property on validation/business failure
 */
const registerUser = async ({ name, email, password, role, phone, organization, skills, location }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({
    name, email, password, role, phone, organization, skills, location,
  });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      isAvailable: user.isAvailable,
    },
  };
};

/**
 * Authenticate a user by email + password.
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      isAvailable: user.isAvailable,
    },
  };
};

/**
 * Retrieve the current user's profile.
 */
const getProfile = async (userId) => {
  return User.findById(userId);
};

/**
 * Change the current user's password.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    throw err;
  }

  user.password = newPassword;
  await user.save();
};

module.exports = { registerUser, loginUser, getProfile, changePassword };
