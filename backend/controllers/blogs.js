// backend/controllers/blogs.js
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all blog posts
// @route   GET /api/v1/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const blogs = await Blog.find()
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Blog.countDocuments();

  res.status(200).json({
    success: true,
    count: blogs.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: blogs
  });
});

// @desc    Get single blog post
// @route   GET /api/v1/blogs/:id
// @access  Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', 'username')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'username' },
      options: { sort: { createdAt: -1 } }
    });

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Increment view count
  blog.views += 1;
  await blog.save();

  res.status(200).json({ success: true, data: blog });
});

// @desc    Create new blog post
// @route   POST /api/v1/blogs
// @access  Private
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
  // @access  Private
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
// @access  Private
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }
  if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this blog post`, 401));
  }

  // Delete associated comments
  await Comment.deleteMany({ post: req.params.id });

  await blog.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Like/Unlike blog post
// @route   POST /api/v1/blogs/:id/like
// @access  Private
exports.likeBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  const likeIndex = blog.likes.indexOf(req.user.id);
  if (likeIndex > -1) {
    // User has already liked, so unlike
    blog.likes.splice(likeIndex, 1);
  } else {
    // User hasn't liked, so add like
    blog.likes.push(req.user.id);
  }

  await blog.save();

  res.status(200).json({ success: true, data: blog });
});

// @desc    Get featured blog posts
// @route   GET /api/v1/blogs/featured
// @access  Public
exports.getFeaturedBlogs = asyncHandler(async (req, res, next) => {
  const featuredBlogs = await Blog.find({ featured: true })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({ success: true, count: featuredBlogs.length, data: featuredBlogs });
});