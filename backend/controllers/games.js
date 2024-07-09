// backend/controllers/games.js
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const rundownApi = require('../services/rundownApiService');
const { getGamesByWeek } = require('../services/seasonService');

// @desc    Fetch games from The Rundown API and store in database
// @route   POST /api/v1/games/fetch
// @access  Private
exports.fetchGames = asyncHandler(async (req, res, next) => {
  const { date } = req.body; // Expect date in YYYY-MM-DD format

  const response = await rundownApi.get(`/sports/2/events/${date}`, {
    params: { offset: '0' }
  });

  const games = response.data.events.map(event => ({
    event_id: event.event_id,
    event_uuid: event.event_uuid,
    sport_id: event.sport_id,
    event_date: new Date(event.event_date),
    rotation_number_away: event.rotation_number_away,
    rotation_number_home: event.rotation_number_home,
    score: event.score,
    teams_normalized: event.teams_normalized,
    schedule: event.schedule
  }));

  // Use updateMany with upsert option to update existing games or insert new ones
  const updatePromises = games.map(game => 
    Game.updateOne(
      { event_id: game.event_id },
      game,
      { upsert: true, setDefaultsOnInsert: true }
    )
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    count: games.length,
    message: `${games.length} games fetched and stored/updated successfully.`
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
  //get games by week
  exports.getWeekGames = async (req, res, next) => {
    try {
      const { seasonYear, weekNumber } = req.params;
      const games = await getGamesByWeek(parseInt(seasonYear), parseInt(weekNumber));
  
      res.status(200).json({
        success: true,
        count: games.length,
        data: games
      });
    } catch (error) {
      next(error);
    }
  };
});
