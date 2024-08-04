// middleware/checkGameStart.js
const Game = require('../models/Game');
const Entry = require('../models/Entry');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');
const logger = require('../utils/logger');

const checkGameStart = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { team, week } = req.body;

    logger.info(`Checking game start for entry ${entryId}, team ${team}, week ${week}`);

    const { week: currentWeek, seasonYear } = await seasonService.getCurrentNFLWeek();
    const weekToCheck = (week && week > 0) ? week : currentWeek;

    const entry = await Entry.findById(entryId);
    if (!entry) {
      logger.error(`No entry found with id ${entryId}`);
      return next(new ErrorResponse(`No entry found with id ${entryId}`, 404));
    }

    const games = await Game.find({ 'schedule.week': weekToCheck, 'schedule.season_year': seasonYear }).sort('event_date');
    
    if (games.length === 0) {
      logger.warn(`No games found for week ${weekToCheck}`);
      return next(new ErrorResponse(`No games found for week ${weekToCheck}`, 404));
    }

    const now = new Date();
    const newGame = games.find(g => g.home_team === team || g.away_team === team);

    if (!newGame) {
      logger.warn(`No game found for team ${team} in week ${weekToCheck}`);
      return next(new ErrorResponse(`No game found for team ${team} in week ${weekToCheck}`, 404));
    }

    if (now >= new Date(newGame.event_date)) {
      logger.warn(`Attempt to pick a game that has already started: ${team} in week ${weekToCheck}`);
      return next(new ErrorResponse('Cannot pick a game that has already started', 400));
    }

    logger.info(`Game start check passed for entry ${entryId}, team ${team}, week ${weekToCheck}`);
    next();
  } catch (error) {
    logger.error(`Error in checkGameStart middleware: ${error.message}`);
    next(error);
  }
};

module.exports = checkGameStart;