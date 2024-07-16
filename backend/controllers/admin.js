// backend/controllers/admin.js
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get application statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getAppStats = asyncHandler(async (req, res, next) => {
  const stats = {
    usersCount: await User.countDocuments()
  };
  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Sync rundown data
// @route   POST /api/v1/admin/sync-rundown
// @access  Private/Admin
exports.syncRundownData = asyncHandler(async (req, res, next) => {
  // Implement your data syncing logic here
  res.status(200).json({
    success: true,
    data: 'Data synced successfully'
  });
});

// @desc    Grant admin privileges to a user
// @route   PUT /api/v1/admin/users/:id/grant-admin
// @access  Private/Admin
exports.grantAdminPrivileges = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.role = 'admin';
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});