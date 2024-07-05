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
    weekNumber: game.week
  });

  if (existingPick) {
    return next(new ErrorResponse(`User has already made a pick for week ${game.week}`, 400));
  }

  const pick = await Pick.create({
    user: req.user.id,
    pool: req.params.poolId,
    weekNumber: game.week,
    team: req.body.team,
    game: req.body.game,
    market: req.body.market,
    lineValue: req.body.lineValue,
    odds: req.body.odds
  });

  // Update UserPoolStats
  await UserPoolStats.findOneAndUpdate(
    { user: req.user.id, pool: req.params.poolId },
    { 
      $set: { lastPickedWeek: game.week },
      $push: { pickedTeams: req.body.team }
    }
  );

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

// ... (other methods remain the same)