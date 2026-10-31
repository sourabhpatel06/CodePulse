const express = require('express');
const { protect } = require('../middleware/auth');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', protect, getLeaderboard);

module.exports = router;