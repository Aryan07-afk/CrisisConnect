const nodemailer = require('nodemailer');

/**
 * Create a reusable SMTP transporter.
 * Falls back to console logging if credentials aren't configured.
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Base HTML email wrapper with CrisisConnect branding.
 */
const emailWrapper = (bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #080c12; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0e1420; border: 1px solid #1e2d47; border-radius: 14px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .logo-icon { width: 44px; height: 44px; background: #f97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #dce6f5; letter-spacing: -0.5px; }
    .logo-sub { font-size: 11px; color: #3d4f72; text-transform: uppercase; letter-spacing: 1px; }
    h2 { color: #dce6f5; font-size: 24px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.5px; }
    p { color: #7a8fb5; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #f97316; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: 700; box-shadow: 0 2px 12px rgba(249,115,22,0.3); }
    .info-box { background: #131b2e; border: 1px solid #1e2d47; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .info-label { font-size: 11px; color: #3d4f72; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .info-value { font-size: 15px; color: #dce6f5; font-weight: 600; }
    .divider { height: 1px; background: #1e2d47; margin: 24px 0; }
    .footer { text-align: center; color: #3d4f72; font-size: 12px; margin-top: 24px; }
    .footer a { color: #f97316; text-decoration: none; }
    .warning { font-size: 13px; color: #3d4f72; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">🚨</div>
        <div>
          <div class="logo-text">CrisisConnect</div>
          <div class="logo-sub">Relief Ops Platform</div>
        </div>
      </div>
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CrisisConnect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send welcome email after registration.
 * @param {Object} user - { name, email, role }
 */
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

  const roleName = {
    admin: 'Administrator',
    coordinator: 'Coordinator',
    volunteer: 'Volunteer',
    victim: 'Victim',
  }[user.role] || user.role;

  const html = emailWrapper(`
    <h2>Welcome aboard, ${user.name}! 🎉</h2>
    <p>Your account on <strong>CrisisConnect</strong> has been successfully created. You're now part of our disaster relief operations network.</p>
    
    <div class="info-box">
      <div style="display: flex; gap: 24px;">
        <div>
          <div class="info-label">Name</div>
          <div class="info-value">${user.name}</div>
        </div>
        <div>
          <div class="info-label">Role</div>
          <div class="info-value">${roleName}</div>
        </div>
        <div>
          <div class="info-label">Email</div>
          <div class="info-value">${user.email}</div>
        </div>
      </div>
    </div>

    <p>You can sign in to the platform at any time using the button below:</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${loginUrl}" class="btn">Sign in to CrisisConnect →</a>
    </p>
    
    <div class="divider"></div>
    <p class="warning">If you did not create this account, please ignore this email or contact our support team immediately.</p>
  `);

  if (!transporter) {
    console.log(`[Email] Welcome email for ${user.email}:\n`, `Subject: Welcome to CrisisConnect, ${user.name}!`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CrisisConnect" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Welcome to CrisisConnect, ${user.name}! 🚨`,
      html,
    });
    console.log(`[Email] Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to ${user.email}:`, error.message);
  }
};

/**
 * Send password reset email.
 * @param {Object} user - { name, email }
 * @param {string} resetUrl - Full URL with token for resetting password
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const transporter = createTransporter();

  const html = emailWrapper(`
    <h2>Password Reset Request</h2>
    <p>Hi <strong>${user.name}</strong>, we received a request to reset your password for your CrisisConnect account.</p>
    
    <p>Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.</p>
    
    <p style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" class="btn">Reset Password →</a>
    </p>

    <div class="info-box">
      <div class="info-label">Reset Link</div>
      <div class="info-value" style="word-break: break-all; font-size: 13px; font-weight: 400; color: #7a8fb5;">${resetUrl}</div>
    </div>
    
    <div class="divider"></div>
    <p class="warning">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `);

  if (!transporter) {
    console.log(`[Email] Password reset email for ${user.email}:\n`, `Reset URL: ${resetUrl}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CrisisConnect" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset — CrisisConnect 🔐',
      html,
    });
    console.log(`[Email] Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error(`[Email] Failed to send password reset email to ${user.email}:`, error.message);
    throw new Error('Failed to send password reset email. Please try again later.');
  }
};

/**
 * Send confirmation email when a coordinator application is received.
 * @param {Object} user - { name, email }
 */
const sendApplicationReceivedEmail = async (user) => {
  const transporter = createTransporter();

  const html = emailWrapper(`
    <h2>Application Received! 📋</h2>
    <p>Hi <strong>${user.name}</strong>, your coordinator application on <strong>CrisisConnect</strong> has been successfully submitted.</p>
    
    <div class="info-box">
      <div class="info-label">Status</div>
      <div class="info-value" style="color: #f59e0b;">⏳ Under Review</div>
    </div>

    <p>Our admin team will review your submitted documents and credentials. You will receive an email once your application has been processed.</p>
    <p>This typically takes <strong>1–3 business days</strong>.</p>
    
    <div class="divider"></div>
    <p class="warning">If you did not submit this application, please ignore this email or contact our support team.</p>
  `);

  if (!transporter) {
    console.log(`[Email] Application received email for ${user.email}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CrisisConnect" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Application Received — CrisisConnect 📋',
      html,
    });
    console.log(`[Email] Application received email sent to ${user.email}`);
  } catch (error) {
    console.error(`[Email] Failed to send application received email to ${user.email}:`, error.message);
  }
};

/**
 * Send rejection email when a coordinator application is denied.
 * @param {Object} user - { name, email }
 * @param {string} reason - Rejection reason provided by admin
 */
const sendApplicationRejectedEmail = async (user, reason) => {
  const transporter = createTransporter();

  const html = emailWrapper(`
    <h2>Application Update</h2>
    <p>Hi <strong>${user.name}</strong>, we've reviewed your coordinator application on <strong>CrisisConnect</strong>.</p>
    
    <div class="info-box">
      <div class="info-label">Status</div>
      <div class="info-value" style="color: #ef4444;">❌ Not Approved</div>
    </div>

    <div class="info-box">
      <div class="info-label">Reason</div>
      <div class="info-value" style="font-size: 14px; font-weight: 400; color: #7a8fb5;">${reason}</div>
    </div>

    <p>You may submit a new application with updated documents if you believe this was an error. You can also register as a <strong>Volunteer</strong> to start contributing immediately.</p>
    
    <div class="divider"></div>
    <p class="warning">If you have questions, please reach out to our admin team for clarification.</p>
  `);

  if (!transporter) {
    console.log(`[Email] Application rejected email for ${user.email}: ${reason}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CrisisConnect" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Application Update — CrisisConnect',
      html,
    });
    console.log(`[Email] Application rejected email sent to ${user.email}`);
  } catch (error) {
    console.error(`[Email] Failed to send application rejected email to ${user.email}:`, error.message);
  }
};

/**
 * Send critical assignment email to volunteer.
 * @param {Object} user - Volunteer object { name, email }
 * @param {Object} request - HelpRequest object { title, description, location, contactPhone }
 */
const sendCriticalAssignmentEmail = async (user, request) => {
  const transporter = createTransporter();

  // Format location string if it's an object with address
  const locationString = request.location?.address || 'Location not provided';
  // Attempt to use contactPhone if available on the request or the raisedBy user
  const phoneString = request.contactPhone || (request.raisedBy && request.raisedBy.phone) || 'No contact number provided';

  const html = emailWrapper(`
    <h2 style="color: #ef4444;">🚨 CRITICAL PRIORITY ASSIGNMENT</h2>
    <p>Hi <strong>${user.name}</strong>, you have been assigned to a <strong>CRITICAL</strong> priority rescue request. Please review the details below and respond immediately.</p>
    
    <div class="info-box" style="border-left: 4px solid #ef4444;">
      <div class="info-label">Title</div>
      <div class="info-value" style="color: #ef4444;">${request.title}</div>
    </div>

    <div class="info-box">
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div>
          <div class="info-label">Location</div>
          <div class="info-value">${locationString}</div>
        </div>
        <div>
          <div class="info-label">Victim Contact</div>
          <div class="info-value" style="color: #f97316;">${phoneString}</div>
        </div>
      </div>
    </div>

    <div class="info-box">
      <div class="info-label">Specific Instructions / Description</div>
      <div class="info-value" style="font-size: 14px; font-weight: 400; color: #7a8fb5; line-height: 1.5;">${request.description || 'No description provided'}</div>
    </div>

    <p style="text-align: center; margin: 28px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn" style="background: #ef4444; box-shadow: 0 2px 12px rgba(239,68,68,0.3);">View Request Dashboard →</a>
    </p>
    
    <div class="divider"></div>
    <p class="warning">This is an automated critical alert from CrisisConnect. Please act safely and swiftly.</p>
  `);

  if (!transporter) {
    console.log(`[Email] Critical assignment email for ${user.email}: ${request.title}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CrisisConnect Emergency" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🚨 URGENT: Critical Assignment — CrisisConnect',
      html,
    });
    console.log(`[Email] Critical assignment email sent to ${user.email}`);
  } catch (error) {
    console.error(`[Email] Failed to send critical assignment email to ${user.email}:`, error.message);
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendApplicationReceivedEmail, sendApplicationRejectedEmail, sendCriticalAssignmentEmail };
