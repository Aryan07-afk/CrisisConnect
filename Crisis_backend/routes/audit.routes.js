const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { protect, authorise } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorise('admin'));

// @route  GET /api/audit
// @access Admin
router.get('/', getAuditLogs);

module.exports = router;
