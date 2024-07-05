// backend/controllers/pools.js
const Pool = require('../models/Pool');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new pool
// @route   POST /api/v1/pools
// @access  Private
exports.createPool = asyncHandler(async (req, res, next) => {
  req.body.creator = req.user.id;

  const pool = await Pool.create(req.body);

  res.status(201).json({
    success: true,
    data: pool
  });
});

// @desc    Get all pools
// @route   GET /api/v1/pools
// @access  Public
exports.getPools = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single pool
// @route   GET /api/v1/pools/:id
// @access  Public
exports.getPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id).populate({
    path: 'participants',
    select: 'username email'
  });

  if (!pool) {
    return next(new ErrorResponse(`Pool not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Update pool
// @route   PUT /api/v1/pools/:id
// @access  Private
exports.updatePool = asyncHandler(async (req, res, next) => {
  let pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`Pool not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is pool creator
  if (pool.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this pool`, 401));
  }

  pool = await Pool.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Delete pool
// @route   DELETE /api/v1/pools/:id
// @access  Private
exports.deletePool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`Pool not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is pool creator
  if (pool.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this pool`, 401));
  }

  await pool.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join pool
// @route   POST /api/v1/pools/:id/join
// @access  Private
exports.joinPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`Pool not found with id of ${req.params.id}`, 404));
  }

  if (pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse('User already joined this pool', 400));
  }

  if (pool.participants.length >= pool.maxParticipants) {
    return next(new ErrorResponse('Pool has reached maximum number of participants', 400));
  }

  pool.participants.push(req.user.id);
  await pool.save();

  res.status(200).json({
    success: true,
    data: pool
  });
});