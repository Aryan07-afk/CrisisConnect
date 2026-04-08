const express = require('express');
const router  = express.Router();
const { body, param } = require('express-validator');
const {
  submitRequest, getMyRequests, getRequestById,
  updateRequest, cancelRequest,
  getAllVictimRequests, manageVictimRequest,
} = require('../controllers/victim.controller');
const { protect, authorise } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.use(protect);

// ── Victim routes ─────────────────────────────────────
router.get('/requests/my', authorise('victim'), getMyRequests);

router.get(
  '/requests/:id',
  authorise('victim'),
  [param('id').isMongoId().withMessage('Invalid request ID')],
  validate,
  getRequestById
);

router.delete(
  '/requests/:id',
  authorise('victim'),
  [param('id').isMongoId().withMessage('Invalid request ID')],
  validate,
  cancelRequest
);

router.put(
  '/requests/:id',
  authorise('victim'),
  [
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('needType')
      .optional()
      .isIn(['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'])
      .withMessage('Invalid need type'),
    body('urgency')
      .optional()
      .isIn(['critical', 'high', 'medium', 'low'])
      .withMessage('Invalid urgency'),
    body('peopleCount')
      .optional()
      .isInt({ min: 1 })
      .withMessage('People count must be at least 1'),
  ],
  validate,
  updateRequest
);

router.post(
  '/requests',
  authorise('victim'),
  [
    body('needType')
      .isIn(['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'])
      .withMessage('Invalid need type'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location.address').notEmpty().withMessage('Location address is required'),
    body('urgency')
      .optional()
      .isIn(['critical', 'high', 'medium', 'low'])
      .withMessage('Invalid urgency'),
    body('peopleCount')
      .optional()
      .isInt({ min: 1 })
      .withMessage('People count must be at least 1'),
  ],
  validate,
  submitRequest
);

// ── Admin / Coordinator routes ────────────────────────
router.get('/', authorise('admin', 'coordinator'), getAllVictimRequests);

router.patch(
  '/:id/manage',
  authorise('admin', 'coordinator'),
  [
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('status')
      .optional()
      .isIn(['submitted', 'reviewing', 'linked', 'resolved', 'closed'])
      .withMessage('Invalid status'),
    body('linkedRequest')
      .optional()
      .isMongoId()
      .withMessage('Invalid linked request ID'),
  ],
  validate,
  manageVictimRequest
);

module.exports = router;
