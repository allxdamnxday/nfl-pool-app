// backend/controllers/blogs.js
const Blog = require('../models/Blog');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all blog posts
// @route   GET /api/v1/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find().populate('author', 'username');
  res.status(200).json({ success: true, count: blogs.length, data: blogs });
});

// @desc    Get single blog post
// @route   GET /api/v1/blogs/:id
// @access  Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'username');
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: blog });
});

// @desc    Create new blog post
// @route   POST /api/v1/blogs
// @access  Private/Admin
exports.createBlog = asyncHandler(async (req, res, next) => {
    const { title, content, imageUrl } = req.body;
    
    const blogData = {
      title,
      content,
      author: req.user.id
    };
  
    if (imageUrl) {
      blogData.imageUrl = imageUrl;
    }
  
    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, data: blog });
  });
  
  // @desc    Update blog post
  // @route   PUT /api/v1/blogs/:id
  // @access  Private/Admin
  exports.updateBlog = asyncHandler(async (req, res, next) => {
    const { title, content, imageUrl } = req.body;
    
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }
    
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this blog post`, 401));
    }
    
    const updateData = { title, content };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }
    
    blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { 
      new: true, 
      runValidators: true 
    });
    
    res.status(200).json({ success: true, data: blog });
  });

// @desc    Delete blog post
// @route   DELETE /api/v1/blogs/:id
// @access  Private/Admin
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this blog post`, 401));
  }
  await blog.remove();
  res.status(200).json({ success: true, data: {} });
});