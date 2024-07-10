// backend/controllers/games.js
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const rundownApi = require('../services/rundownApiService');

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

// @desc    Fetch games from The Rundown API
// @route   POST /api/v1/games/fetch
// @access  Private
exports.fetchGames = asyncHandler(async (req, res, next) => {
  const { season_year, sport_id } = req.body;

  const response = await rundownApi.get('/sports/{sport_id}/events/{season_year}', {
    params: {
      sport_id,
      season_year
    }
  });

  const games = response.data.events.map(event => ({
    id: event.id,
    event_id: event.event_id,
    event_uuid: event.event_uuid,
    sport_id: event.sport_id,
    season_type: event.season_type,
    season_year: event.season_year,
    away_team_id: event.away_team_id,
    home_team_id: event.home_team_id,
    away_team: event.away_team,
    home_team: event.home_team,
    date_event: new Date(event.date_event),
    neutral_site: event.neutral_site,
    conference_competition: event.conference_competition,
    away_score: event.away_score,
    home_score: event.home_score,
    league_name: event.league_name,
    event_name: event.event_name,
    event_location: event.event_location,
    attendance: event.attendance,
    updated_at: new Date(event.updated_at),
    event_status: event.event_status,
    event_status_detail: event.event_status_detail
  }));

  await Game.insertMany(games, { ordered: false });

  res.status(201).json({
    success: true,
    count: games.length,
    data: games
  });
});
