const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const ErrorResponse = require('../utils/errorResponse');
const sanitizeHtml = require('sanitize-html');
const cloudinary = require('../config/cloudinary');

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  const entities = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&amp;': '&'
  };
  return text.replace(/&[^;]+;/g, entity => entities[entity] || entity);
}

const blogService = {
  // Blog-related services

  async getBlogs(page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Blog.countDocuments();

    return {
      blogs,
      count: blogs.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  },

  async getBlog(id) {
    const blog = await Blog.findById(id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
        options: { sort: { createdAt: -1 } }
      });

    if (!blog) {
      throw new ErrorResponse(`Blog not found with id of ${id}`, 404);
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    return blog;
  },

  async createBlog(userId, blogData) {
    console.log('BlogData received in service:', blogData);

    // Decode and sanitize the content
    const decodedContent = decodeHtmlEntities(blogData.content);
    const sanitizedContent = sanitizeHtml(decodedContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt']
      }
    });

    // Handle image upload if present
    let imageUrl, imagePublicId;
    if (blogData.image && blogData.image.tempFilePath) {
      try {
        console.log('Attempting to upload image to Cloudinary');
        console.log('Image data:', blogData.image);
        const result = await cloudinary.uploader.upload(blogData.image.tempFilePath, {
          folder: 'blog_images'
        });
        console.log('Cloudinary upload result:', result);
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new ErrorResponse('Image upload failed: ' + error.message, 500);
      }
    }

    console.log('Creating blog with imageUrl:', imageUrl, 'and imagePublicId:', imagePublicId);

    const blog = await Blog.create({
      title: blogData.title,
      content: sanitizedContent,
      author: userId,
      imageUrl,
      imagePublicId,
      tags: JSON.parse(blogData.tags),
      readTimeMinutes: blogData.readTimeMinutes,
      status: blogData.status
    });

    console.log('Created blog:', blog);
    return blog;
  },

  async updateBlog(id, userId, blogData) {
    let blog = await Blog.findById(id);
    if (!blog) {
      throw new ErrorResponse(`Blog not found with id of ${id}`, 404);
    }
    
    if (blog.author.toString() !== userId && req.user.role !== 'admin') {
      throw new ErrorResponse(`User ${userId} is not authorized to update this blog post`, 401);
    }
    
    if (blogData.content) {
      // Decode and sanitize the content
      const decodedContent = decodeHtmlEntities(blogData.content);
      blogData.content = sanitizeHtml(decodedContent, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt']
        }
      });
    }

    // Handle image update if present
    if (blogData.image && blogData.image.tempFilePath) {
      try {
        // Delete old image if exists
        if (blog.imagePublicId) {
          await cloudinary.uploader.destroy(blog.imagePublicId);
        }
        // Upload new image
        const result = await cloudinary.uploader.upload(blogData.image.tempFilePath, {
          folder: 'blog_images'
        });
        blogData.imageUrl = result.secure_url;
        blogData.imagePublicId = result.public_id;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new ErrorResponse('Image upload failed: ' + error.message, 500);
      }
    }
    
    blog = await Blog.findByIdAndUpdate(id, blogData, { 
      new: true, 
      runValidators: true 
    });
    
    return blog;
  },

  async deleteBlog(id, userId) {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new ErrorResponse(`Blog not found with id of ${id}`, 404);
    }
    if (blog.author.toString() !== userId && req.user.role !== 'admin') {
      throw new ErrorResponse(`User ${userId} is not authorized to delete this blog post`, 401);
    }

    // Delete associated image from Cloudinary if exists
    if (blog.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(blog.imagePublicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }

    // Delete associated comments
    await Comment.deleteMany({ blog: id });

    await blog.remove();
    return true;
  },

  async likeBlog(id, userId) {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new ErrorResponse(`Blog not found with id of ${id}`, 404);
    }

    const likeIndex = blog.likes.indexOf(userId);
    if (likeIndex > -1) {
      // User has already liked, so unlike
      blog.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked, so add like
      blog.likes.push(userId);
    }

    await blog.save();
    return blog;
  },

  async getFeaturedBlogs(limit = 5) {
    const featuredBlogs = await Blog.find({ featured: true })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit);

    return featuredBlogs;
  },

  // Comment-related services

  async getBlogComments(blogId) {
    const comments = await Comment.find({ blog: blogId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    return comments;
  },

  async createComment(blogId, userId, commentData) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new ErrorResponse(`Blog not found with id of ${blogId}`, 404);
    }

    const comment = await Comment.create({
      ...commentData,
      author: userId,
      blog: blogId
    });

    return comment;
  },

  async updateComment(commentId, userId, commentData) {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ErrorResponse(`Comment not found with id of ${commentId}`, 404);
    }

    if (comment.author.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to update this comment`, 401);
    }

    comment = await Comment.findByIdAndUpdate(commentId, commentData, {
      new: true,
      runValidators: true
    });

    return comment;
  },

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ErrorResponse(`Comment not found with id of ${commentId}`, 404);
    }

    if (comment.author.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to delete this comment`, 401);
    }

    await comment.remove();
    return true;
  },

  async likeComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ErrorResponse(`Comment not found with id of ${commentId}`, 404);
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      // User has already liked, so unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked, so add like
      comment.likes.push(userId);
    }

    await comment.save();
    return comment;
  }
};

module.exports = blogService;