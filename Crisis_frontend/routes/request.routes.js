const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
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
router.get('/:id', getRequestById);

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
  ],
  validate,
  createRequest
);

router.put('/:id', updateRequest);

router.post(
  '/:id/notes',
  [body('message').notEmpty().withMessage('Note message is required')],
  validate,
  addNote
);

router.delete('/:id', deleteRequest);

module.exports = router;
