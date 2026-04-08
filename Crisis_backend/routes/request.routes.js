const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  addNote,
  deleteRequest,
} = require('../controllers/request.controller');
const { protect, authorise } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.use(protect);

router.get('/', getAllRequests);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid request ID')],
  validate,
  getRequestById
);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('requestType')
      .isIn(['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'])
      .withMessage('Invalid request type'),
    body('location.address').notEmpty().withMessage('Location address is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    body('affectedCount')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Affected count must be at least 1'),
  ],
  validate,
  createRequest
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('requestType')
      .optional()
      .isIn(['food', 'water', 'shelter', 'medical', 'rescue', 'clothing', 'other'])
      .withMessage('Invalid request type'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    body('status')
      .optional()
      .isIn(['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateRequest
);

router.post(
  '/:id/notes',
  [
    param('id').isMongoId().withMessage('Invalid request ID'),
    body('message').notEmpty().withMessage('Note message is required'),
  ],
  validate,
  addNote
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid request ID')],
  validate,
  deleteRequest
);

module.exports = router;
