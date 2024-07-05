// backend/controllers/games.js
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all games
// @route   GET /api/v1/games
// @access  Private
exports.getGames = asyncHandler(async (req, res, next) => {
  const games = await Game.find()
    .populate('homeTeam', 'name abbreviation')
    .populate('awayTeam', 'name abbreviation');

  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

// @desc    Get single game
// @route   GET /api/v1/games/:id
// @access  Private
exports.getGame = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id)
    .populate('homeTeam', 'name abbreviation')
    .populate('awayTeam', 'name abbreviation');

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: game
  });
});

// @desc    Get game markets
// @route   GET /api/v1/games/:id/markets
// @access  Private
exports.getGameMarkets = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: game.markets
  });
});