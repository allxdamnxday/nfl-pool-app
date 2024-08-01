// backend/routes/blogs.js
const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getFeaturedBlogs
} = require('../controllers/blogs');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/featured').get(getFeaturedBlogs);
router.route('/').get(getBlogs).post(protect, authorize('admin', 'author'), createBlog);
router.route('/:id').get(getBlog).put(protect, authorize('admin', 'author'), updateBlog).delete(protect, authorize('admin', 'author'), deleteBlog);
router.route('/:id/like').post(protect, likeBlog);

module.exports = router;