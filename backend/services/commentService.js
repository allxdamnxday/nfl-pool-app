// backend/services/commentService.js

const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

exports.createComment = async (blogId, userId, content) => {
  const comment = new Comment({
    content,
    author: userId,
    blog: blogId
  });
  await comment.save();
  await Blog.findByIdAndUpdate(blogId, { $push: { comments: comment._id } });
  return comment.populate('author', 'username');
};

exports.getBlogComments = async (blogId) => {
  return Comment.find({ blog: blogId })
    .populate('author', 'username')
    .sort({ createdAt: -1 });
};

exports.likeComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  
  const likeIndex = comment.likes.indexOf(userId);
  if (likeIndex > -1) {
    comment.likes.splice(likeIndex, 1);
  } else {
    comment.likes.push(userId);
  }
  
  await comment.save();
  return comment;
};

exports.editComment = async (commentId, userId, newContent) => {
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, author: userId },
    { content: newContent, updatedAt: Date.now() },
    { new: true }
  ).populate('author', 'username');
  
  if (!comment) throw new Error('Comment not found or user not authorized');
  return comment;
};

exports.deleteComment = async (commentId, userId) => {
  const comment = await Comment.findOneAndDelete({ _id: commentId, author: userId });
  if (!comment) throw new Error('Comment not found or user not authorized');
  await Blog.findByIdAndUpdate(comment.blog, { $pull: { comments: commentId } });
  return comment;
};

exports.getComments = async (query = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const comments = await Comment.find(query)
    .populate('author', 'username')
    .populate('blog', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Comment.countDocuments(query);
  
  return {
    comments,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};