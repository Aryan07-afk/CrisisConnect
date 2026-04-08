const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const {
  getAllVolunteers,
  getVolunteerProfile,
  toggleAvailability,
} = require('../controllers/volunteer.controller');
const { protect, authorise } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.use(protect);

router.get('/', authorise('admin', 'coordinator'), getAllVolunteers);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid volunteer ID')],
  validate,
  getVolunteerProfile
);

router.patch(
  '/:id/availability',
  [param('id').isMongoId().withMessage('Invalid volunteer ID')],
  validate,
  toggleAvailability
);

module.exports = router;
