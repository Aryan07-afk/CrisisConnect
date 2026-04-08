const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
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
    body('requestId').isMongoId().withMessage('Valid requestId is required'),
    body('volunteerId').isMongoId().withMessage('Valid volunteerId is required'),
  ],
  validate,
  createAssignment
);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid assignment ID'),
    body('status')
      .isIn(['accepted', 'rejected', 'in_progress', 'completed'])
      .withMessage('Invalid status'),
    body('remarks').optional().isString().withMessage('Remarks must be a string'),
  ],
  validate,
  updateAssignmentStatus
);

router.delete(
  '/:id',
  authorise('admin'),
  [param('id').isMongoId().withMessage('Invalid assignment ID')],
  validate,
  deleteAssignment
);

module.exports = router;
