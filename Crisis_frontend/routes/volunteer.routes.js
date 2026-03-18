const express = require('express');
const router = express.Router();
const {
  getAllVolunteers,
  getVolunteerProfile,
  toggleAvailability,
} = require('../controllers/volunteer.controller');
const { protect, authorise } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorise('admin', 'coordinator'), getAllVolunteers);
router.get('/:id', getVolunteerProfile);
router.patch('/:id/availability', toggleAvailability);

module.exports = router;
