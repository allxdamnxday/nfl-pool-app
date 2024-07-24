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

  console.log(`fetchGames called with date: ${date}, limit: ${limit}`);

  if (!date || isNaN(Date.parse(date))) {
    console.error('Invalid date provided');
    return next(new ErrorResponse('Please provide a valid date', 400));
  }

  try {
    const schedules = await rundownApi.fetchNFLSchedule(date, limit);
    console.log('API Response:', schedules);

    const games = schedules
      .map(schedule => ({
        event_id: schedule.event_id,
        event_date: schedule.event_date,
        // Add other necessary fields here
      }))
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
      data: games
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return next(new ErrorResponse('Error fetching games', 500));
  }
});

// @desc    Get all games
// @route   GET /api/v1/games
// @access  Private
exports.getGames = asyncHandler(async (req, res, next) => {
  console.log('getGames called');

  try {
    const games = await Game.find().sort({ event_date: 1 }).exec();
    console.log('Games found:', games);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error getting games:', error);
    return next(new ErrorResponse('Error getting games', 500));
  }
});

// @desc    Get a single game by ID
// @route   GET /api/v1/games/:id
// @access  Private
exports.getGame = asyncHandler(async (req, res, next) => {
  console.log(`getGame called with id: ${req.params.id}`);

  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      console.error(`Game not found with id of ${req.params.id}`);
      return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error getting game:', error);
    return next(new ErrorResponse('Error getting game', 500));
  }
});

// @desc    Get games for a specific week
// @route   GET /api/v1/games/week/:seasonYear/:weekNumber
// @access  Private
exports.getWeekGames = asyncHandler(async (req, res, next) => {
  const { seasonYear, weekNumber } = req.params;
  console.log(`getWeekGames called with seasonYear: ${seasonYear}, weekNumber: ${weekNumber}`);

  if (isNaN(seasonYear) || isNaN(weekNumber)) {
    console.error('Invalid season year or week number');
    return next(new ErrorResponse('Invalid season year or week number', 400));
  }

  try {
    const games = await seasonService.getGamesByWeek(parseInt(seasonYear), parseInt(weekNumber));
    console.log('Games found for week:', games);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error getting games for week:', error);
    return next(new ErrorResponse('Error getting games for week', 500));
  }
});

// @desc    Update game status
// @route   PUT /api/v1/games/:id/status
// @access  Private
exports.updateGameStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  console.log(`updateGameStatus called with id: ${req.params.id}, status: ${status}`);

  const validStatuses = ['scheduled', 'completed', 'canceled']; // Example statuses

  if (!status || !validStatuses.includes(status)) {
    console.error('Invalid status provided');
    return next(new ErrorResponse('Please provide a valid status', 400));
  }

  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id, 
      { 'score.event_status': status },
      { new: true, runValidators: true }
    );

    if (!game) {
      console.error(`Game not found with id of ${req.params.id}`);
      return next(new ErrorResponse(`Game not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error updating game status:', error);
    return next(new ErrorResponse('Error updating game status', 500));
  }
});

exports.filterGames = asyncHandler(async (req, res, next) => {
  const { season, week } = req.query;
  console.log(`filterGames called with season: ${season}, week: ${week}`);

  const query = {};
  if (season) query['schedule.season_year'] = season;
  if (week) query['schedule.week'] = week;

  try {
    const games = await Game.find(query).sort({ event_date: 1 });
    console.log('Filtered games found:', games);

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error filtering games:', error);
    return next(new ErrorResponse('Error filtering games', 500));
  }
});

// Add the missing getGamesByTeam function
exports.getGamesByTeam = asyncHandler(async (req, res, next) => {
  const { teamId } = req.params;
  console.log(`getGamesByTeam called with teamId: ${teamId}`);

  try {
    const games = await Game.find({
      $or: [
        { 'teams_normalized.0.team_id': parseInt(teamId) },
        { 'teams_normalized.1.team_id': parseInt(teamId) }
      ]
    }).sort('event_date');

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error getting games by team:', error);
    return next(new ErrorResponse('Error getting games by team', 500));
  }
});

// Add the missing createGame function
exports.createGame = asyncHandler(async (req, res, next) => {
  console.log('createGame called with body:', req.body);

  try {
    const game = await Game.create(req.body);
    res.status(201).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return next(new ErrorResponse('Error creating game', 500));
  }
});

exports.updateGameData = asyncHandler(async (req, res, next) => {
  const { date } = req.body;
  if (!date || isNaN(Date.parse(date))) {
    return next(new ErrorResponse('Please provide a valid date', 400));
  }
  await seasonService.updateGameData(new Date(date));
  res.status(200).json({ success: true, message: 'Game data updated successfully' });
});

exports.initializeSeasonData = asyncHandler(async (req, res, next) => {
  const { year } = req.body;
  if (!year || isNaN(parseInt(year))) {
    return next(new ErrorResponse('Please provide a valid year', 400));
  }
  await seasonService.initializeSeasonData(parseInt(year));
  res.status(200).json({ success: true, message: 'Season data initialized successfully' });
});

// Update the module exports to include all functions
module.exports = {
  fetchGames: exports.fetchGames,
  getGames: exports.getGames,
  getGame: exports.getGame,
  getWeekGames: exports.getWeekGames,
  updateGameStatus: exports.updateGameStatus,
  getGamesByTeam: exports.getGamesByTeam,
  filterGames: exports.filterGames,
  createGame: exports.createGame,
  updateGameData: exports.updateGameData,
  initializeSeasonData: exports.initializeSeasonData
};