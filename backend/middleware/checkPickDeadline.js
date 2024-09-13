/**
 * @module CheckPickDeadlineMiddleware
 * @description Middleware to verify if the pick submission deadline has passed for a given week.
 */

const moment = require('moment-timezone');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');
const logger = require('../utils/logger'); // Assuming logger is defined somewhere

/**
 * Checks if the pick submission deadline has passed for the given week.
 * @function checkPickDeadline
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ErrorResponse} If the submission deadline has passed
 */
const checkPickDeadline = async (req, res, next) => {
  logger.info(`checkPickDeadline middleware called for ${req.method} request, week: ${req.params.week}`);
  try {
    const week = parseInt(req.params.week);

    // Get the current NFL week
    const { week: currentWeek } = await seasonService.getCurrentNFLWeek();

    const currentDate = moment().tz('America/Los_Angeles');
    let submissionDeadline = moment().tz('America/Los_Angeles').day(0).hour(10).minute(0).second(0);

    // If current date is past Sunday 10 AM, set deadline to next Sunday
    if (currentDate.isAfter(submissionDeadline)) {
      submissionDeadline.add(1, 'week');
    }

    // Check if the requested week is past or if it's the current week and the deadline has passed
    if (week < currentWeek || (week === currentWeek && currentDate.isAfter(submissionDeadline))) {
      return next(new ErrorResponse(`Submission deadline has passed for week ${week}`, 400));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkPickDeadline;

/**
 * @example
 * // Using checkPickDeadline middleware in a route
 * router.post('/picks', checkPickDeadline, (req, res) => {
 *   // Handle pick submission
 * });
 */

/**
 * Additional Notes:
 * - This middleware should be used before processing pick submissions.
 * - It checks if the submission deadline (Sunday 10 AM Pacific Time) has passed for the given week.
 * - The deadline is set to Sunday 10 AM Pacific Time for the current week.
 * - If it's already past Sunday 10 AM, it uses the current week's deadline.
 * - If it's before Sunday 10 AM, it uses the previous week's deadline.
 * - It prevents changes to picks for any past weeks and the current week after the deadline.
 * - It allows submissions for future weeks without deadline restrictions.
 * - It uses the seasonService to get the current NFL week for comparison.
 * - Moment-timezone is used to handle timezone-specific date and time calculations.
 */