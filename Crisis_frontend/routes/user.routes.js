const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorise } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

router.get('/', authorise('admin', 'coordinator'), getAllUsers);
router.get('/:id', authorise('admin', 'coordinator'), getUserById);
router.put('/:id', updateUser);
router.patch('/:id/toggle-status', authorise('admin'), toggleUserStatus);
router.delete('/:id', authorise('admin'), deleteUser);

module.exports = router;
