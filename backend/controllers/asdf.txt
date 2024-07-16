const Pick = require('../models/Pick');
const Entry = require('../models/Entry');
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new pick
// @route   POST /api/v1/entries/:entryId/picks
// @access  Private
exports.addPick = asyncHandler(async (req, res, next) => {
  const entry = await Entry.findById(req.params.entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry with the id of ${req.params.entryId}`, 404));
  }

  // Check if the entry is active
  if (!entry.isActive) {
    return next(new ErrorResponse(`This entry is not active`, 400));
  }

  // Check if user is the owner of the entry
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to add pick to this entry`, 401));
  }

  const game = await Game.findById(req.body.game);
  if (!game) {
    return next(new ErrorResponse(`No game with the id of ${req.body.game}`, 404));
  }

  // Check if user has already made a pick for this week in this entry
  const existingPick = entry.picks.find(pick => pick.weekNumber === game.schedule.week);
  if (existingPick) {
    return next(new ErrorResponse(`User has already made a pick for week ${game.schedule.week}`, 400));
  }

  entry.picks.push({
    game: req.body.game,
    team: req.body.team,
    weekNumber: game.schedule.week
  });

  await entry.save();

  res.status(201).json({
    success: true,
    data: entry
  });
});

// @desc    Get picks for a pool
// @route   GET /api/v1/pools/:poolId/picks
// @access  Private
exports.getPicksForPool = asyncHandler(async (req, res, next) => {
  const entries = await Entry.find({ pool: req.params.poolId }).populate('picks.game');

  const picks = entries.flatMap(entry => entry.picks.map(pick => ({
    user: entry.user,
    entryId: entry._id,
    ...pick.toObject()
  })));

  res.status(200).json({
    success: true,
    count: picks.length,
    data: picks
  });
});

// @desc    Get pick for a specific week
// @route   GET /api/v1/entries/:entryId/picks/:week
// @access  Private
exports.getPickForWeek = asyncHandler(async (req, res, next) => {
  const entry = await Entry.findById(req.params.entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry with the id of ${req.params.entryId}`, 404));
  }

  const pick = entry.picks.find(pick => pick.weekNumber === parseInt(req.params.week));
  if (!pick) {
    return next(new ErrorResponse(`No pick found for week ${req.params.week}`, 404));
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
  const entry = await Entry.findById(req.params.entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry with the id of ${req.params.entryId}`, 404));
  }

  const pick = entry.picks.id(req.params.pickId);
  if (!pick) {
    return next(new ErrorResponse(`No pick with the id of ${req.params.pickId}`, 404));
  }

  // Make sure user is the owner of the pick
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this pick`, 401));
  }

  Object.assign(pick, req.body);

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
  const entry = await Entry.findById(req.params.entryId);
  if (!entry) {
    return next(new ErrorResponse(`No entry with the id of ${req.params.entryId}`, 404));
  }

  const pick = entry.picks.id(req.params.pickId);
  if (!pick) {
    return next(new ErrorResponse(`No pick with the id of ${req.params.pickId}`, 404));
  }

  // Make sure user is the owner of the pick
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this pick`, 401));
  }

  pick.remove();
  await entry.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
