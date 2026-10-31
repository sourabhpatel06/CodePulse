const express = require('express');
const { protect } = require('../middleware/auth');
const {
  listContests,
  googleAuthStart,
  googleAuthCallback,
  calendarStatus,
  addToCalendar,
} = require('../controllers/contestController');

const router = express.Router();

router.get('/', protect, listContests);
router.get('/google/status', protect, calendarStatus);
router.get('/google/start', protect, googleAuthStart);
router.get('/google/callback', googleAuthCallback); // NOT behind `protect` — Google redirects the browser here directly, with no JWT attached
router.post('/add-to-calendar', protect, addToCalendar);

module.exports = router;