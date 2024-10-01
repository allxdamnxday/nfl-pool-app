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
    const statsAccessDeadline = moment().tz('America/Los_Angeles').day(0).hour(10).minute(0).second(0);

    // If current date is before Sunday 10 AM, adjust the deadline to previous week
    if (currentDate.isBefore(statsAccessDeadline)) {
      statsAccessDeadline.subtract(1, 'week');
    }

    logger.info(`Current date: ${currentDate.format()}`);
    logger.info(`Current week: ${currentWeek}, Requested week: ${requestedWeek}`);
    logger.info(`Stats access deadline: ${statsAccessDeadline.format()}`);

    // Allow access if the requested week is less than the current week
    // OR if it's the current week and we're past Sunday 10 AM
    if (requestedWeek < currentWeek || (requestedWeek === currentWeek && currentDate.isSameOrAfter(statsAccessDeadline))) {
      logger.info(`Access granted: Requested week ${requestedWeek} is accessible`);
      return next();
    }

    logger.info(`Access denied: Stats for week ${requestedWeek} are not yet available`);
    return next(new ErrorResponse(`Stats for week ${requestedWeek} are not available until Sunday at 10 AM PST. The current accessible week is ${currentWeek - 1}.`, 403));

  } catch (error) {
    logger.error(`Error in checkStatsWeekAccess: ${error.message}`);
    next(error);
  }
};

module.exports = checkStatsWeekAccess;