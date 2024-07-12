// backend/controllers/games.js
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const rundownApi = require('../services/rundownApiService');
const seasonService = require('../services/seasonService');

// @desc    Fetch games from The Rundown API and store in database
// @route   POST /api/v1/games/fetch
// @access  Private
exports.fetchGames = asyncHandler(async (req, res, next) => {
  const { date, limit = 5 } = req.body;

  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  try {
    console.log(`Fetching games for date: ${date}`);
    const schedules = await rundownApi.fetchNFLSchedule(date, limit);
    
    console.log('API Response:', JSON.stringify(schedules, null, 2));

    if (!schedules || schedules.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No games found for the given date.'
      });
    }

    const games = schedules
      .map(seasonService.transformGameData)
      .filter(game => game !== null);

    const updatePromises = games.map(game => 
      Game.findOneAndUpdate(
        { event_id: game.event_id },
        game,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      count: games.length,
      message: `${games.length} games fetched and stored/updated successfully.`
    });
  } catch (error) {
    console.error('Error in fetchGames:', error);
    return next(new ErrorResponse('Error fetching games from external API', 500));
  }
});


// @desc    Create a new game
// @route   POST /api/v1/games
// @access  Private
exports.createGame = asyncHandler(async (req, res, next) => {
  const game = await Game.create(req.body);
  res.status(201).json({
    success: true,
    data: game
  });
});

// @desc    Get all games
// @route   GET /api/v1/games
// @access  Private
exports.getGames = asyncHandler(async (req, res, next) => {
  const games = await Game.find().sort({ date_event: 1 });

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
  const game = await Game.findById(req.params.id);

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: game
  });
});

// @desc    Get games for a specific team
// @route   GET /api/v1/games/team/:teamId
// @access  Private
exports.getGamesByTeam = asyncHandler(async (req, res, next) => {
  const games = await Game.find({
    $or: [
      { 'teams_normalized.0.team_id': parseInt(req.params.teamId) },
      { 'teams_normalized.1.team_id': parseInt(req.params.teamId) }
    ]
  }).sort('date_event');

  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

exports.getWeekGames = asyncHandler(async (req, res, next) => {
  const { seasonYear, weekNumber } = req.params;
  const games = await seasonService.getGamesByWeek(parseInt(seasonYear), parseInt(weekNumber));

  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

exports.filterGames = asyncHandler(async (req, res, next) => {
  const { season, week } = req.query;
  let query = {};
  if (season) query['schedule.season_year'] = parseInt(season);
  if (week) query['schedule.week'] = parseInt(week);
  
  const games = await Game.find(query);
  
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

exports.updateGameStatus = asyncHandler(async (req, res, next) => {
  const game = await Game.findByIdAndUpdate(
    req.params.id, 
    { 'score.event_status': req.body.status },
    { new: true, runValidators: true }
  );

  if (!game) {
    return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: game
  });

  // @desc    Join a pool
// @route   POST /api/v1/pools/:id/join
// @access  Private
exports.joinPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }

  // Check if the pool is full
  if (pool.participants.length >= pool.maxParticipants) {
    return next(new ErrorResponse(`Pool is already full`, 400));
  }

  // Check if the user is already in the pool
  if (pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is already in this pool`, 400));
  }

  pool.participants.push(req.user.id);
  await pool.save();

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Leave a pool
// @route   POST /api/v1/pools/:id/leave
// @access  Private
exports.leavePool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }

  // Check if the user is in the pool
  if (!pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is not in this pool`, 400));
  }

  pool.participants = pool.participants.filter(participant => participant.toString() !== req.user.id);
  await pool.save();

  res.status(200).json({
    success: true,
    data: pool
  });
});

});
