const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all entries for a user
// @route   GET /api/v1/users/entries
// @access  Private
exports.getUserEntries = asyncHandler(async (req, res, next) => {
  const entries = await Entry.find({ user: req.user.id }).populate('pool');
  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries
  });
});

// @desc    Get single entry
// @route   GET /api/v1/entries/:id
// @access  Private
exports.getEntry = asyncHandler(async (req, res, next) => {
  const entry = await Entry.findById(req.params.id).populate('pool').populate('picks');

  if (!entry) {
    return next(new ErrorResponse(`Entry not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns entry
  if (entry.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this entry`, 401));
  }

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Request entry to a pool
// @route   POST /api/v1/pools/:poolId/request-entry
// @access  Private
exports.requestEntry = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const pool = await Pool.findById(poolId);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${poolId}`, 404));
  }

  // Check if user already requested entry or has an entry in this pool
  const existingRequest = await Entry.findOne({ user: req.user.id, pool: poolId, isActive: false });
  const existingEntry = await Entry.findOne({ user: req.user.id, pool: poolId, isActive: true });

  if (existingRequest || existingEntry) {
    return next(new ErrorResponse(`User already requested or has an entry in this pool`, 400));
  }

  const entryRequest = await Entry.create({
    user: req.user.id,
    pool: poolId,
    isActive: false
  });

  res.status(201).json({
    success: true,
    data: entryRequest
  });
});

// @desc    Approve entry request
// @route   PUT /api/v1/entries/:id/approve
// @access  Private/Admin
exports.approveEntry = asyncHandler(async (req, res, next) => {
  let entry = await Entry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`No entry request found with id of ${req.params.id}`, 404));
  }

  entry = await Entry.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Get entries for the pool
// @route   GET /api/v1/pools/:poolId/entries
// @access  Private
exports.getEntriesForPool = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const pool = await Pool.findById(poolId);
  if (!pool) {
    return next(new ErrorResponse('Pool not found', 404));
  }

  const entries = await Entry.find({ pool: poolId })
    .populate('user', 'username')
    .populate('picks');

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries
  });
});

// @desc    Update entry
// @route   PUT /api/v1/entries/:id
// @access  Private
exports.updateEntry = asyncHandler(async (req, res, next) => {
  let entry = await Entry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`No entry found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns entry or is admin
  if (entry.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this entry`, 401));
  }

  entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: entry
  });
});

// @desc    Delete entry
// @route   DELETE /api/v1/entries/:id
// @access  Private
exports.deleteEntry = asyncHandler(async (req, res, next) => {
  const entry = await Entry.findById(req.params.id);

  if (!entry) {
    return next(new ErrorResponse(`No entry found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns entry or is admin
  if (entry.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this entry`, 401));
  }

  await entry.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create entry
// @route   POST /api/v1/pools/:poolId/entries
// @access  Private
exports.createEntry = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;

  // Check if pool exists
  const pool = await Pool.findById(poolId);
  if (!pool) {
    return next(new ErrorResponse(`No pool found with id of ${poolId}`, 404));
  }

  // Check if user already has an entry in this pool
  const existingEntry = await Entry.findOne({ user: req.user.id, pool: poolId });
  if (existingEntry) {
    return next(new ErrorResponse('User already has an entry in this pool', 400));
  }

  // Check for an approved request
  const request = await Request.findOne({ pool: poolId, user: req.user.id, status: 'approved' });
  if (!request) {
    return next(new ErrorResponse('User does not have an approved request to join this pool', 403));
  }

  const entry = await Entry.create({
    user: req.user.id,
    pool: poolId
  });

  res.status(201).json({
    success: true,
    data: entry
  });
});