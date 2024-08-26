const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Blog = require('../models/Blog'); // Add this line
const blogService = require('../services/blogService');

// @desc    Get all blog posts
// @route   GET /api/v1/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await blogService.getBlogs(page, limit);

  res.status(200).json({
    success: true,
    count: result.count,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: result.blogs
  });
});

// @desc    Get single blog post
// @route   GET /api/v1/blogs/:id
// @access  Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await blogService.getBlog(req.params.id);
  res.status(200).json({ success: true, data: blog });
});

// @desc    Create new blog post
// @route   POST /api/v1/blogs
// @access  Private
exports.createBlog = asyncHandler(async (req, res, next) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  // Handle file upload
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }

    // Pass the file object to the service
    req.body.image = file;
  }

  const blog = await blogService.createBlog(req.user.id, req.body);
  res.status(201).json({ success: true, data: blog });
});

// @desc    Update blog post
// @route   PUT /api/v1/blogs/:id
// @access  Private
exports.updateBlog = asyncHandler(async (req, res, next) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is blog owner
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this blog`, 401));
  }

  // Handle file upload
  if (req.files && req.files.image) {
    const file = req.files.image;
    
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }

    // Pass the file object to the service
    req.body.image = file;
  }

  blog = await blogService.updateBlog(req.params.id, req.user.id, req.body);

  res.status(200).json({ success: true, data: blog });
});

// @desc    Delete blog post
// @route   DELETE /api/v1/blogs/:id
// @access  Private
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  await blogService.deleteBlog(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: {} });
});

// @desc    Like/Unlike blog post
// @route   POST /api/v1/blogs/:id/like
// @access  Private
exports.likeBlog = asyncHandler(async (req, res, next) => {
  const blog = await blogService.likeBlog(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: blog });
});

// @desc    Get featured blog posts
// @route   GET /api/v1/blogs/featured
// @access  Public
exports.getFeaturedBlogs = asyncHandler(async (req, res, next) => {
  const featuredBlogs = await blogService.getFeaturedBlogs();
  res.status(200).json({ success: true, count: featuredBlogs.length, data: featuredBlogs });
});

// @desc    Get comments for a blog post
// @route   GET /api/v1/blogs/:id/comments
// @access  Public
exports.getBlogComments = asyncHandler(async (req, res, next) => {
  const comments = await blogService.getBlogComments(req.params.id);
  res.status(200).json({ success: true, count: comments.length, data: comments });
});

// @desc    Create a new comment
// @route   POST /api/v1/blogs/:id/comments
// @access  Private
exports.createComment = asyncHandler(async (req, res, next) => {
  const comment = await blogService.createComment(req.params.id, req.user.id, req.body);
  res.status(201).json({ success: true, data: comment });
});

// @desc    Update a comment
// @route   PUT /api/v1/blogs/:id/comments/:commentId
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await blogService.updateComment(req.params.commentId, req.user.id, req.body);
  res.status(200).json({ success: true, data: comment });
});

// @desc    Delete a comment
// @route   DELETE /api/v1/blogs/:id/comments/:commentId
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  await blogService.deleteComment(req.params.commentId, req.user.id);
  res.status(200).json({ success: true, data: {} });
});

// @desc    Like/Unlike a comment
// @route   POST /api/v1/blogs/:id/comments/:commentId/like
// @access  Private
exports.likeComment = asyncHandler(async (req, res, next) => {
  const comment = await blogService.likeComment(req.params.commentId, req.user.id);
  res.status(200).json({ success: true, data: comment });
});