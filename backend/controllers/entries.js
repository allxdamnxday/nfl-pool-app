const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const Request = require('../models/Request');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all entries for a user
// @route   GET /api/v1/entries/user
// @access  Private
exports.getUserEntries = asyncHandler(async (req, res, next) => {
  console.log('User ID:', req.user.id); // Add this line to log the user ID
  const entries = await Entry.find({ user: req.user.id }).populate('pool', 'name currentWeek');
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

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to approve this entry`, 403));
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

  // Check if user already has an active entry in this pool
  const existingEntry = await Entry.findOne({ user: req.user.id, pool: poolId, isActive: true });
  if (existingEntry) {
    return next(new ErrorResponse('User already has an active entry in this pool', 400));
  }

  // Check for an approved request
  const approvedRequest = await Entry.findOne({ user: req.user.id, pool: poolId, isActive: false });
  if (!approvedRequest) {
    return next(new ErrorResponse('User does not have an approved request to join this pool', 403));
  }

  // Update the approved request to be an active entry
  approvedRequest.isActive = true;
  await approvedRequest.save();

  res.status(201).json({
    success: true,
    data: approvedRequest
  });
});

// @desc    Add or update a pick for an entry
// @route   POST /api/v1/entries/:entryId/picks
// @access  Private
exports.addOrUpdatePick = asyncHandler(async (req, res, next) => {
  const { entryId } = req.params;
  const { team, week } = req.body;

  const entry = await Entry.findById(entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
  }

  // Check if a pick for this week already exists
  let pickIndex = entry.picks.findIndex(p => p.week === parseInt(week));
  
  if (pickIndex !== -1) {
    // Update existing pick
    entry.picks[pickIndex].team = team;
  } else {
    // Add new pick
    entry.picks.push({ team, week: parseInt(week) });
  }

  await entry.save();

  res.status(200).json({
    success: true,
    data: entry.picks.find(p => p.week === parseInt(week))
  });
});


// @desc    Get a pick for an entry and week
// @route   GET /api/v1/entries/:entryId/picks/:week
// @access  Private
exports.getPickForWeek = asyncHandler(async (req, res, next) => {
  const { entryId, week } = req.params;
  
  const entry = await Entry.findById(entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
  }

  const pick = entry.picks.find(p => p.week === parseInt(week));
  
  if (!pick) {
    // Instead of throwing an error, return null or an empty object
    return res.status(200).json({
      success: true,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    data: pick
  });
});

// @desc    Update pick
// @route   PUT /api/v1/entries/:entryId/picks/:pickId
// @access  Private
exports.updatePick = asyncHandler(async (req, res, next) => {
  const { entryId, pickId } = req.params;
  const { team } = req.body;

  const entry = await Entry.findById(entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
  }

  const pick = entry.picks.id(pickId);
  if (!pick) {
    return next(new ErrorResponse(`No pick found with id ${pickId}`, 404));
  }

  pick.team = team;
  await entry.save();

  res.status(200).json({
    success: true,
    data: pick
  });
});

// @desc    Delete pick
// @route   DELETE /api/v1/entries/:entryId/picks/:pickId
// @access  Private
exports.deletePick = asyncHandler(async (req, res, next) => {
  const { entryId, pickId } = req.params;

  const entry = await Entry.findById(entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
  }

  const pick = entry.picks.id(pickId);
  if (!pick) { 
    return next(new ErrorResponse(`No pick found with id ${pickId}`, 404));
  }

  entry.picks.pull(pickId);
  await entry.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get all picks for an entry
exports.getPicksForEntry = asyncHandler(async (req, res, next) => {
  const { entryId } = req.params;
  
  const entry = await Entry.findById(entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
  }

  res.status(200).json({
    success: true,
    data: entry.picks
  });
});