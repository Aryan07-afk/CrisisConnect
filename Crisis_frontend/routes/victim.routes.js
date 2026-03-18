const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
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
router.get('/requests/:id', authorise('victim'), getRequestById);
router.delete('/requests/:id', authorise('victim'), cancelRequest);
router.put('/requests/:id', authorise('victim'), updateRequest);

router.post(
  '/requests',
  authorise('victim'),
  [
    body('needType').isIn(['food','water','shelter','medical','rescue','clothing','other'])
      .withMessage('Invalid need type'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location.address').notEmpty().withMessage('Location address is required'),
  ],
  validate,
  submitRequest
);

// ── Admin / Coordinator routes ────────────────────────
router.get('/', authorise('admin', 'coordinator'), getAllVictimRequests);
router.patch('/:id/manage', authorise('admin', 'coordinator'), manageVictimRequest);

module.exports = router;
