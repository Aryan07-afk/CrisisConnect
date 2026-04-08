const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboard.controller');
const { protect, authorise } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorise('admin', 'coordinator'));

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

module.exports = router;
