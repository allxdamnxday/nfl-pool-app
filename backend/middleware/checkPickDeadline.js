// middleware/checkPickDeadline.js
const moment = require('moment-timezone');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');

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