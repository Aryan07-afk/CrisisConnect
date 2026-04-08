const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorise } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

// All routes require authentication
router.use(protect);

router.get('/', authorise('admin', 'coordinator'), getAllUsers);

router.get(
  '/:id',
  authorise('admin', 'coordinator'),
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  getUserById
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ],
  validate,
  updateUser
);

router.patch(
  '/:id/toggle-status',
  authorise('admin'),
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  toggleUserStatus
);

router.delete(
  '/:id',
  authorise('admin'),
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  deleteUser
);

module.exports = router;
