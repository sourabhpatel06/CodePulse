const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;