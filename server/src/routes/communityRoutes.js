const express = require('express');
const { protect } = require('../middleware/auth');
const { createPost, getPosts, toggleLike, deletePost } = require('../controllers/communityController');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.post('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);

module.exports = router;