const commentService = require('../services/commentService');

exports.createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const comment = await commentService.createComment(blogId, req.user._id, content);
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const comments = await commentService.getBlogComments(blogId);
    res.json(comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await commentService.likeComment(commentId, req.user._id);
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await commentService.editComment(commentId, req.user._id, content);
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    await commentService.deleteComment(commentId, req.user._id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await commentService.getComments({}, page, limit);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};