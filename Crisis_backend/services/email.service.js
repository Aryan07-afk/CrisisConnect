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

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
