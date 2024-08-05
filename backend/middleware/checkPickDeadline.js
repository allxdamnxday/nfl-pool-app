/**
 * @module CheckPickDeadlineMiddleware
 * @description Middleware to verify if the pick submission deadline has passed for a given week.
 */

const moment = require('moment-timezone');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');

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
  try {
    const { week } = req.body;

    // Get the current NFL week
    const { week: currentWeek } = await seasonService.getCurrentNFLWeek();

    // Only check the deadline for the current week or past weeks
    if (week <= currentWeek) {
      const currentDate = moment().tz('America/Los_Angeles');
      const submissionDeadline = moment().tz('America/Los_Angeles').day(0).hour(13).minute(0).second(0);
      
      // If it's after Sunday 1 PM, use next week's deadline
      if (currentDate.day() === 0 && currentDate.hour() >= 13) {
        submissionDeadline.add(1, 'week');
      }

      if (currentDate.isAfter(submissionDeadline)) {
        return next(new ErrorResponse(`Submission deadline has passed for week ${week}`, 400));
      }
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
 * - It checks if the submission deadline (Sunday 1 PM Pacific Time) has passed for the given week.
 * - The deadline is set to Sunday 1 PM Pacific Time for the current week.
 * - If it's already past Sunday 1 PM, it uses the next week's deadline.
 * - It uses the seasonService to get the current NFL week for comparison.
 * - The middleware allows submissions for future weeks without deadline restrictions.
 * - Moment-timezone is used to handle timezone-specific date and time calculations.
 */