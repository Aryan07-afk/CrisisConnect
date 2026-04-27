const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('./email.service');

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

  // The first registered user automatically becomes the admin
  const userCount = await User.countDocuments();
  let assignedRole = role || 'volunteer';
  let adminLevel = null;
  
  if (userCount === 0) {
    assignedRole = 'admin';
    adminLevel = 1;
  } else if (assignedRole === 'admin' || assignedRole === 'coordinator') {
    // Failsafe in case route validation is bypassed
    const err = new Error('Cannot directly register as admin or coordinator');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.create({
    name, email, password, role: assignedRole, adminLevel, phone, organization, skills, location,
  });

  const token = generateToken(user._id);

  // Send welcome email (fire-and-forget — don't block registration)
  sendWelcomeEmail({ name: user.name, email: user.email, role: user.role }).catch(() => {});

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      isAvailable: user.isAvailable,
      isActive: user.isActive,
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

  user.lastActiveAt = new Date();
  await user.save();

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
      isActive: user.isActive,
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

/**
 * Forgot password — generate a reset token and email the user.
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('No account found with that email address');
    err.statusCode = 404;
    throw err;
  }

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and store it on the user
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  // Build reset URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail({ name: user.name, email: user.email }, resetUrl);
  } catch (error) {
    // Clean up token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const err = new Error('Failed to send reset email. Please try again later.');
    err.statusCode = 500;
    throw err;
  }
};

/**
 * Reset password using the token from the email link.
 */
const resetPassword = async (token, newPassword) => {
  // Hash the incoming token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    const err = new Error('Invalid or expired reset token');
    err.statusCode = 400;
    throw err;
  }

  // Set new password and clear reset fields
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

module.exports = { registerUser, loginUser, getProfile, changePassword, forgotPassword, resetPassword };
