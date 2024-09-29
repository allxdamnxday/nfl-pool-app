const moment = require('moment-timezone');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');
const logger = require('../utils/logger');

/**
 * Checks if the requested week for stats is accessible.
 * @function checkStatsWeekAccess
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ErrorResponse} If the requested week is not yet accessible
 */
const checkStatsWeekAccess = async (req, res, next) => {
  logger.info(`checkStatsWeekAccess middleware called for ${req.method} request, week: ${req.query.week}`);
  try {
    const requestedWeek = parseInt(req.query.week);

    // Get the current NFL week
    const { week: currentWeek } = await seasonService.getCurrentNFLWeek();

    const currentDate = moment().tz('America/Los_Angeles');
    logger.info(`Current date: ${currentDate.format()}`);

    const currentWeekStart = moment().tz('America/Los_Angeles').day(2).hour(0).minute(0).second(0);
    if (currentDate.isBefore(currentWeekStart)) {
      currentWeekStart.subtract(1, 'week');
    }
    logger.info(`Current week start: ${currentWeekStart.format()}`);

    const statsAccessDeadline = currentWeekStart.clone().add(5, 'days').hour(10); // Sunday 10:00 AM
    logger.info(`Stats access deadline: ${statsAccessDeadline.format()}`);

    const accessibleWeek = currentDate.isSameOrAfter(statsAccessDeadline) ? currentWeek : currentWeek - 1;
    logger.info(`Accessible week: ${accessibleWeek}, Current week: ${currentWeek}`);

    // Check if the requested week is in the future or not yet accessible
    if (requestedWeek > accessibleWeek) {
      logger.info(`Access denied: Requested week ${requestedWeek} is greater than accessible week ${accessibleWeek}`);
      return next(new ErrorResponse(`Stats for week ${requestedWeek} are not available until Sunday at 10 AM PST. The current accessible week is ${accessibleWeek}.`, 403));
    }

    logger.info(`Access granted: Requested week ${requestedWeek} is accessible`);
    next();
  } catch (error) {
    logger.error(`Error in checkStatsWeekAccess: ${error.message}`);
    next(error);
  }
};

module.exports = checkStatsWeekAccess;