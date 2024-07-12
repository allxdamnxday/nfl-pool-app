// backend/controllers/picks.js
const Pick = require('../models/Pick');
const Pool = require('../models/Pool');
const Game = require('../models/Game');
const UserPoolStats = require('../models/UserPoolStats');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new pick
// @route   POST /api/v1/pools/:poolId/picks
// @access  Private
exports.addPick = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.poolId);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.poolId}`, 404));
  }

  // Check if user is part of the pool
  if (!pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is not part of this pool`, 400));
  }

  const game = await Game.findById(req.body.game);
  if (!game) {
    return next(new ErrorResponse(`No game with the id of ${req.body.game}`, 404));
  }

  // Check if user has already made a pick for this week
  const existingPick = await Pick.findOne({
    user: req.user.id,
    pool: req.params.poolId,
    weekNumber: game.schedule.week
  });

  if (existingPick) {
    return next(new ErrorResponse(`User has already made a pick for week ${game.schedule.week}`, 400));
  }

  const pick = await Pick.create({
    user: req.user.id,
    pool: req.params.poolId,
    weekNumber: game.schedule.week,
    team: req.body.team,
    game: req.body.game
  });

  res.status(201).json({
    success: true,
    data: pick
  });
});

// @desc    Get picks for a pool
// @route   GET /api/v1/pools/:poolId/picks
// @access  Private
exports.getPicksForPool = asyncHandler(async (req, res, next) => {
  const picks = await Pick.find({ pool: req.params.poolId })
    .populate('user', 'username')
    .populate('team', 'name')
    .populate('game', 'homeTeam awayTeam eventDate')
    .populate('market', 'name');

  res.status(200).json({
    success: true,
    count: picks.length,
    data: picks
  });
});

// @desc    Get pick for a specific week
// @route   GET /api/v1/pools/:poolId/picks/:week
// @access  Private
exports.getPickForWeek = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.poolId);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.poolId}`, 404));
  }

  const pick = await Pick.findOne({
    pool: req.params.poolId,
    user: req.user.id,
    weekNumber: req.params.week
  }).populate('team');

  if (!pick) {
    return next(new ErrorResponse(`No pick found for week ${req.params.week}`, 404));
  }

  res.status(200).json({
    success: true,
    data: pick
  });
});

// @desc    Update pick
// @route   PUT /api/v1/picks/:id
// @access  Private
exports.updatePick = asyncHandler(async (req, res, next) => {
  let pick = await Pick.findById(req.params.id);

  if (!pick) {
    return next(new ErrorResponse(`No pick with the id of ${req.params.id}`, 404));
  }

  // Make sure user is pick owner
  if (pick.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this pick`, 401));
  }

  pick = await Pick.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: pick
  });
});

// @desc    Delete pick
// @route   DELETE /api/v1/picks/:id
// @access  Private
exports.deletePick = asyncHandler(async (req, res, next) => {
  const pick = await Pick.findById(req.params.id);

  if (!pick) {
    return next(new ErrorResponse(`No pick with the id of ${req.params.id}`, 404));
  }

  // Make sure user is pick owner
  if (pick.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this pick`, 401));
  }

  await pick.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});