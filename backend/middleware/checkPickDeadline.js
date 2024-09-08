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
    const week = parseInt(req.params.week); // Changed from req.body to req.params

    // Get the current NFL week
    const { week: currentWeek } = await seasonService.getCurrentNFLWeek();

    const currentDate = moment().tz('America/Los_Angeles');
    const submissionDeadline = moment().tz('America/Los_Angeles').day(0).hour(10).minute(0).second(0);

    // If it's after Sunday 10 AM and the current day is Sunday, use this week's deadline
    if (currentDate.day() === 0 && currentDate.hour() >= 10) {
      // Do nothing, keep the deadline as is
    } else {
      // Otherwise, use last week's deadline
      submissionDeadline.subtract(1, 'week');
    }

    // Check if the requested week is current or past, and if the deadline has passed
    if (week <= currentWeek && currentDate.isAfter(submissionDeadline)) {
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