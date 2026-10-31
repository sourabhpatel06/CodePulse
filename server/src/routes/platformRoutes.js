const express = require('express');
const { protect } = require('../middleware/auth');
const { connectHandles, getMyStats, resync } = require('../controllers/platformController');

const router = express.Router();

router.post('/connect', protect, connectHandles);
router.get('/me', protect, getMyStats);
router.post('/resync', protect, resync);

module.exports = router;