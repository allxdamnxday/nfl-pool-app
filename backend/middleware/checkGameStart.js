/**
 * @module CheckGameStartMiddleware
 * @description Middleware to verify if a game has started before allowing a pick to be made.
 */

const Game = require('../models/Game');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');
const logger = require('../utils/logger');
const moment = require('moment');

/**
 * Checks if the game for the selected team has started.
 * @function checkGameStart
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ErrorResponse} If no game found or game has already started
 */
const checkGameStart = async (req, res, next) => {
  try {
    const { entryId, entryNumber, week } = req.params;
    const { team } = req.body;

    console.log('Request body:', req.body);
    console.log('Params:', req.params);

    logger.info(`Checking game start for entry ${entryId}, entryNumber ${entryNumber}, team ${team}, week ${week}`);

    const { week: currentWeek, seasonYear } = seasonService.getCurrentNFLWeek();
    console.log('Current NFL Week:', currentWeek, 'Season Year:', seasonYear);

    const weekToCheck = parseInt(week) || currentWeek;
    const yearToCheck = seasonYear;

    console.log('Searching for game with criteria:', {
      'schedule.week': weekToCheck,
      'schedule.season_year': yearToCheck,
      $or: [
        { away_team: team },
        { home_team: team },
        { 'teams_normalized.name': team }
      ]
    });

    const game = await Game.findOne({
      'schedule.week': weekToCheck,
      'schedule.season_year': yearToCheck,
      $or: [
        { away_team: team },
        { home_team: team },
        { 'teams_normalized.name': team }
      ]
    });

    console.log('Game found:', game);

    if (!game) {
      logger.warn(`No game found for team ${team} in week ${weekToCheck} of season ${yearToCheck}`);
      return next(new ErrorResponse(`No game found for team ${team} in week ${weekToCheck} of season ${yearToCheck}`, 404));
    }

    const now = moment.utc();
    if (now.isAfter(moment(game.event_date))) {
      logger.warn(`Attempt to pick a game that has already started: ${team} in week ${weekToCheck}`);
      return next(new ErrorResponse('Cannot pick a game that has already started', 400));
    }

    // Add the game to the request object for use in the service
    req.game = game;

    logger.info(`Game start check passed for entry ${entryId}, entryNumber ${entryNumber}, team ${team}, week ${weekToCheck}`);
    next();
  } catch (error) {
    logger.error(`Error in checkGameStart middleware: ${error.message}`);
    next(error);
  }
};

module.exports = checkGameStart;

/**
 * @example
 * // Using checkGameStart middleware in a route
 * router.post('/picks/:entryId/:entryNumber/:week', checkGameStart, (req, res) => {
 *   // Handle pick submission
 * });
 */

/**
 * Additional Notes:
 * - This middleware should be used before processing pick submissions.
 * - It checks if the game for the selected team has started based on the current UTC date and time.
 * - If the game has already started, it prevents the pick from being made.
 * - It uses the seasonService to get the current NFL week if not provided in the request.
 * - Logging is implemented for debugging and tracking purposes.
 * - The middleware handles various error scenarios (no game found, game already started) and passes appropriate error responses.
 * - The game object is added to the request for potential use in subsequent middleware or route handlers.
 */