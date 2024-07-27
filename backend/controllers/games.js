const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');

// @desc    Get games for the current week
// @route   GET /api/v1/games/current-week
// @access  Private
exports.getCurrentWeekGames = asyncHandler(async (req, res, next) => {
  console.log('Fetching current week games...');
  const games = await seasonService.getCurrentWeekGames();
  console.log('Games fetched:', games);
  
  if (!games || games.length === 0) {
    console.log('No games found for the current week');
    return next(new ErrorResponse('No games found for the current week', 404));
  }
  
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

// @desc    Get games for a specific week
// @route   GET /api/v1/games/week
// @access  Private
exports.getGamesForWeek = asyncHandler(async (req, res, next) => {
  const { week, season_year } = req.query;
  const games = await Game.find({
    'schedule.week': parseInt(week),
    'schedule.season_year': parseInt(season_year)
  }).sort('event_date');
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

// @desc    Update game status
// @route   PUT /api/v1/games/:id/status
// @access  Private
exports.updateGameStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['scheduled', 'completed', 'canceled'];
  if (!status || !validStatuses.includes(status)) {
    return next(new ErrorResponse('Please provide a valid status', 400));
  }
  const game = await Game.findByIdAndUpdate(
    req.params.id, 
    { 'score.event_status': status },
    { new: true, runValidators: true }
  );
  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: game });
});

// @desc    Update game data
// @route   PUT /api/v1/games/update-data
// @access  Private
exports.updateGameData = asyncHandler(async (req, res, next) => {
  const { date } = req.body;
  if (!date || isNaN(Date.parse(date))) {
    return next(new ErrorResponse('Please provide a valid date', 400));
  }
  await seasonService.updateGameData(new Date(date));
  res.status(200).json({ success: true, message: 'Game data updated successfully' });
});

// @desc    Initialize season data
// @route   POST /api/v1/games/initialize-season
// @access  Private
exports.initializeSeasonData = asyncHandler(async (req, res, next) => {
  const { year } = req.body;
  if (!year || isNaN(parseInt(year))) {
    return next(new ErrorResponse('Please provide a valid year', 400));
  }
  await seasonService.initializeSeasonData(parseInt(year));
  res.status(200).json({ success: true, message: 'Season data initialized successfully' });
});