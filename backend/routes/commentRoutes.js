const express = require('express');
const router = express.Router();
const { createComment, getBlogComments, likeComment, editComment, deleteComment, getComments } = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/blogs/:blogId/comments', getBlogComments);

// Protected routes (authenticated users only)
router.post('/blogs/:blogId/comments', protect, createComment);
router.post('/comments/:commentId/like', protect, likeComment);
router.put('/comments/:commentId', protect, editComment);
router.delete('/comments/:commentId', protect, deleteComment);

// Admin only route (if needed)
router.get('/comments', protect, authorize('admin'), getComments);

module.exports = router;