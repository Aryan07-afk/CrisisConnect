const CoordinatorApplication = require('../models/CoordinatorApplication');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendApplicationReceivedEmail, sendApplicationRejectedEmail } = require('./email.service');
const paginate = require('../utils/pagination');

/**
 * Submit a new coordinator application.
 * Validates that the email isn't already taken by a User or a pending application.
 */
const createApplication = async ({ name, email, password, phone, organization, location, skills, documentProof }) => {
  // Check if email already exists as a registered user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('Email already registered. Please login instead.');
    err.statusCode = 400;
    throw err;
  }

  // Check if a pending application already exists for this email
  const existingApp = await CoordinatorApplication.findOne({ email, status: 'pending' });
  if (existingApp) {
    const err = new Error('A coordinator application for this email is already under review.');
    err.statusCode = 400;
    throw err;
  }

  const application = await CoordinatorApplication.create({
    name, email, password, phone, organization, location, skills, documentProof,
  });

  // Send confirmation email (fire-and-forget)
  sendApplicationReceivedEmail({ name, email }).catch(() => {});

  return {
    _id: application._id,
    name: application.name,
    email: application.email,
    status: application.status,
  };
};

/**
 * List all coordinator applications with optional status filter + pagination.
 */
const getAllApplications = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;

  const mongoQuery = CoordinatorApplication.find(query)
    .select('-password')
    .sort({ createdAt: -1 });

  return paginate(mongoQuery, { page: filters.page, limit: filters.limit });
};

/**
 * Get a single application by ID.
 */
const getApplicationById = async (applicationId) => {
  const application = await CoordinatorApplication.findById(applicationId)
    .select('-password')
    .populate('reviewedBy', 'name email');

  if (!application) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }
  return application;
};

/**
 * Approve or reject a coordinator application.
 * - Approve: creates a real User with role 'coordinator', removes the application.
 * - Reject: marks the application as rejected with a reason.
 */
const reviewApplication = async (applicationId, adminUser, { action, rejectionReason }) => {
  const application = await CoordinatorApplication.findById(applicationId).select('+password');
  if (!application) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  if (application.status !== 'pending') {
    const err = new Error(`This application has already been ${application.status}`);
    err.statusCode = 400;
    throw err;
  }

  if (action === 'approve') {
    // Check email hasn't been taken in the meantime
    const existingUser = await User.findOne({ email: application.email });
    if (existingUser) {
      const err = new Error('A user with this email was registered while the application was pending.');
      err.statusCode = 409;
      throw err;
    }

    // Create the actual user — password is already hashed in the application.
    // We bypass the User pre-save hook (which would double-hash) by using
    // a direct collection insert, then fetching the Mongoose document.
    const userData = {
      name: application.name,
      email: application.email,
      password: application.password, // already bcrypt-hashed
      role: 'coordinator',
      phone: application.phone || undefined,
      organization: application.organization || undefined,
      location: application.location || undefined,
      skills: application.skills || [],
      isActive: true,
      isAvailable: true,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await User.collection.insertOne(userData);
    const user = await User.findById(result.insertedId);

    // Mark application as approved and remove it
    application.status = 'approved';
    application.reviewedBy = adminUser._id;
    application.reviewedAt = new Date();
    await application.save();

    // Send welcome email to the new coordinator
    sendWelcomeEmail({ name: user.name, email: user.email, role: 'coordinator' }).catch(() => {});

    return { message: 'Application approved. Coordinator account created.', user: { _id: user._id, name: user.name, email: user.email, role: user.role } };
  }

  if (action === 'reject') {
    application.status = 'rejected';
    application.rejectionReason = rejectionReason || 'Application did not meet requirements.';
    application.reviewedBy = adminUser._id;
    application.reviewedAt = new Date();
    await application.save();

    // Notify applicant of rejection
    sendApplicationRejectedEmail(
      { name: application.name, email: application.email },
      application.rejectionReason
    ).catch(() => {});

    return { message: 'Application rejected.', applicationId: application._id };
  }

  const err = new Error('Invalid action. Use "approve" or "reject".');
  err.statusCode = 400;
  throw err;
};

module.exports = { createApplication, getAllApplications, getApplicationById, reviewApplication };
