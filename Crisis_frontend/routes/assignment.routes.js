const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAssignment,
  getAllAssignments,
  getMyAssignments,
  updateAssignmentStatus,
  deleteAssignment,
} = require('../controllers/assignment.controller');
const { protect, authorise } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.use(protect);

router.get('/', authorise('admin', 'coordinator'), getAllAssignments);
router.get('/my', getMyAssignments);

router.post(
  '/',
  authorise('admin', 'coordinator'),
  [
    body('requestId').notEmpty().withMessage('requestId is required'),
    body('volunteerId').notEmpty().withMessage('volunteerId is required'),
  ],
  validate,
  createAssignment
);

router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['accepted', 'rejected', 'in_progress', 'completed'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateAssignmentStatus
);

router.delete('/:id', authorise('admin'), deleteAssignment);

module.exports = router;
