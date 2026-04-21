const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  submitApplication,
  getApplications,
  getApplicationById,
  reviewApplication,
} = require('../controllers/coordinatorApplication.controller');
const { protect, authorise } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { uploadDocument } = require('../middleware/upload.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

// @route  POST /api/coordinator-applications
// @access Public — submit a new coordinator application with document proof
router.post(
  '/',
  authLimiter,
  uploadDocument.single('documentProof'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  submitApplication
);

// ── All routes below require authentication + admin role ──
router.use(protect);
router.use(authorise('admin'));

// @route  GET /api/coordinator-applications
// @access Admin
router.get('/', getApplications);

// @route  GET /api/coordinator-applications/:id
// @access Admin
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid application ID')],
  validate,
  getApplicationById
);

// @route  PATCH /api/coordinator-applications/:id/review
// @access Admin — approve or reject
router.patch(
  '/:id/review',
  [
    param('id').isMongoId().withMessage('Invalid application ID'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be "approve" or "reject"'),
    body('rejectionReason').optional().isString(),
  ],
  validate,
  reviewApplication
);

module.exports = router;
