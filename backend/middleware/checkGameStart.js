/**
 * @module CheckGameStartMiddleware
 * @description Middleware to verify if a game has started before allowing a pick to be made.
 */

const Game = require('../models/Game');
const Pick = require('../models/Pick'); // Assuming you have a Pick model
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
    const { entryId, week } = req.params;
    const { team } = req.body;

    logger.info(`Checking game start for entry ${entryId}, team ${team}, week ${week}`);

    const { week: currentWeek, seasonYear } = seasonService.getCurrentNFLWeek();
    const weekToCheck = parseInt(week);

    if (weekToCheck < 1 || weekToCheck > 18) {
      return next(new ErrorResponse('Invalid week number', 400));
    }

    // Find the game for the new pick
    const newGame = await Game.findOne({
      'schedule.week': weekToCheck,
      'schedule.season_year': seasonYear,
      $or: [
        { away_team: team },
        { home_team: team },
        { 'teams_normalized.name': team }
      ]
    });

    if (!newGame) {
      logger.warn(`No game found for team ${team} in week ${weekToCheck} of season ${seasonYear}`);
      return next(new ErrorResponse(`No game found for team ${team} in week ${weekToCheck}`, 404));
    }

    const newGameStart = moment(newGame.event_date);
    const now = moment();

    // Check if the pick is for a past week
    if (weekToCheck < currentWeek) {
      logger.warn(`Attempt to make a pick for a past week: ${weekToCheck}`);
      return next(new ErrorResponse('Cannot make picks for past weeks', 400));
    }

    // Check if the pick is for the current week and if the game has started
    if (weekToCheck === currentWeek && now.isAfter(newGameStart)) {
      logger.warn(`Attempt to pick a game that has already started: ${team} in week ${weekToCheck}`);
      return next(new ErrorResponse('Cannot pick a game that has already started', 400));
    }

    // Check if the user already has a pick for this week
    const existingPick = await Pick.findOne({ entry: entryId, week: weekToCheck }).populate('game');

    if (existingPick) {
      const existingGameStart = moment(existingPick.game.event_date);

      // If it's the current week and the existing pick's game has started, prevent changes
      if (weekToCheck === currentWeek && now.isAfter(existingGameStart)) {
        logger.warn(`Attempt to change pick after game start for entry ${entryId} in week ${weekToCheck}`);
        return next(new ErrorResponse('Cannot change pick after the game has started', 400));
      }
    }

    // Add the game to the request object for use in the service
    req.game = newGame;

    logger.info(`Game start check passed for entry ${entryId}, team ${team}, week ${weekToCheck}`);
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