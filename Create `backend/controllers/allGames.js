const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const rundownApi = require('../services/rundownApiService');
const seasonService = require('../services/seasonService');

// @desc    Fetch all games from The Rundown API and store in database
// @route   POST /api/v1/allGames/fetch
// @access  Private
exports.fetchAllGames = asyncHandler(async (req, res, next) => {
  const { date, limit = 5 } = req.body;

  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }

  try {
    console.log(`Fetching all games for date: ${date}`);
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
    console.error('Error in fetchAllGames:', error);
    return next(new ErrorResponse('Error fetching games from external API', 500));
  }
});

// @desc    Get all games
// @route   GET /api/v1/allGames
// @access  Private
exports.getAllGames = asyncHandler(async (req, res, next) => {
  const games = await Game.find().sort({ date_event: 1 });

  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

// @desc    Get single game
// @route   GET /api/v1/allGames/:id
// @access  Private
exports.getSingleGame = asyncHandler(async (req, res, next) => {
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
// @route   GET /api/v1/allGames/team/:teamId
// @access  Private
exports.getAllGamesByTeam = asyncHandler(async (req, res, next) => {
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

exports.getAllWeekGames = asyncHandler(async (req, res, next) => {
  const { seasonYear, weekNumber } = req.params;
  const games = await seasonService.getGamesByWeek(parseInt(seasonYear), parseInt(weekNumber));

  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

exports.filterAllGames = asyncHandler(async (req, res, next) => {
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

exports.updateAllGameStatus = asyncHandler(async (req, res, next) => {
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
});
