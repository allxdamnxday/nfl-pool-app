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
 * @throws {ErrorResponse} If the requested week is in the future
 */
const checkStatsWeekAccess = async (req, res, next) => {
  logger.info(`checkStatsWeekAccess middleware called for ${req.method} request, week: ${req.query.week}`);
  try {
    const requestedWeek = parseInt(req.query.week);

    // Get the current NFL week
    const { week: currentWeek } = await seasonService.getCurrentNFLWeek();

    const currentDate = moment().tz('America/Los_Angeles');
    let nextWeekDeadline = moment().tz('America/Los_Angeles').day(0).hour(10).minute(0).second(0);

    // If current date is past Sunday 10 AM, set deadline to next Sunday
    if (currentDate.isAfter(nextWeekDeadline)) {
      nextWeekDeadline.add(1, 'week');
    }

    // Check if the requested week is in the future
    if (requestedWeek > currentWeek || (requestedWeek === currentWeek + 1 && currentDate.isBefore(nextWeekDeadline))) {
      return next(new ErrorResponse(`Stats are only available for current and past weeks. The current week is ${currentWeek}.`, 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkStatsWeekAccess;