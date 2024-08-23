const moment = require('moment-timezone');

const VISIBILITY_TIME = '10:00'; // 10:00 AM
const TIMEZONE = 'America/Los_Angeles'; // PDT/PST

const isPicksVisible = (weekNumber, currentDate = moment().tz(TIMEZONE)) => {
  const nflSeason = currentDate.year();
  const weekStart = moment.tz(`${nflSeason}-09-01`, TIMEZONE).startOf('week').add(1, 'week');
  const visibilityDate = weekStart.add(weekNumber - 1, 'weeks').day('sunday').format('YYYY-MM-DD');
  const visibilityDateTime = moment.tz(`${visibilityDate} ${VISIBILITY_TIME}`, TIMEZONE);

  return currentDate.isAfter(visibilityDateTime);
};

const getVisibleWeeks = (currentDate = moment().tz(TIMEZONE)) => {
  let weekNumber = 1;
  const visibleWeeks = [];

  while (weekNumber <= 18) { // Assuming an 18-week NFL season
    if (isPicksVisible(weekNumber, currentDate)) {
      visibleWeeks.push(weekNumber);
    } else {
      break; // No need to check further weeks
    }
    weekNumber++;
  }

  return visibleWeeks;
};

module.exports = {
  isPicksVisible,
  getVisibleWeeks,
};