// controllers/entries.js
const Entry = require('../models/Entry');
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

// @desc    Create entry
// @route   POST /api/v1/pools/:poolId/entries
// @access  Private
exports.createEntry = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.pool = req.params.poolId;

  const entry = await Entry.create(req.body);

  res.status(201).json({
    success: true,
    data: entry
  });
});

// @desc    Get entries for a pool
// @route   GET /api/v1/pools/:poolId/entries
// @access  Private
exports.getEntriesForPool = asyncHandler(async (req, res, next) => {
  const entries = await Entry.find({ pool: req.params.poolId })
    .populate('user', 'username')
    .populate('picks');

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries
  });
});

// Add more functions as needed (update, delete, etc.)