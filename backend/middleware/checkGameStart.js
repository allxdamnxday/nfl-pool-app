// middleware/checkGameStart.js
const Game = require('../models/Game');
const Entry = require('../models/Entry');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');

const checkGameStart = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { team, week } = req.body;

    // Get the current NFL week
    const { week: currentWeek, seasonYear } = await seasonService.getCurrentNFLWeek();

    // Use the current week if the provided week is invalid
    const weekToCheck = (week && week > 0) ? week : currentWeek;

    const entry = await Entry.findById(entryId);
    if (!entry) {
      return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
    }

    // Get all games for the week
    const games = await Game.find({ 'schedule.week': weekToCheck, 'schedule.season_year': seasonYear }).sort('event_date');
    
    if (games.length === 0) {
      return next(new ErrorResponse(`No games found for week ${weekToCheck}`, 404));
    }

    const now = new Date();

    // Check if the new pick's game has started
    const newGame = games.find(g => g.home_team === team || g.away_team === team);
    if (!newGame) {
      return next(new ErrorResponse(`No game found for team ${team} in week ${weekToCheck}`, 404));
    }
    if (now >= new Date(newGame.event_date)) {
      return next(new ErrorResponse('Cannot pick a game that has already started', 400));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkGameStart;