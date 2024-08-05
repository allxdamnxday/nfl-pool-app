/**
 * @module nflWeekCalculator
 */

const moment = require('moment');

/**
 * Calculates the NFL week based on the game date and season year.
 * @function calculateNFLWeek
 * @param {string|Date} gameDate - The date of the game
 * @param {number} seasonYear - The year of the NFL season
 * @returns {string|number} The NFL week number, 'Preseason', or 'Postseason'
 */
function calculateNFLWeek(gameDate, seasonYear) {
  const seasonStart = moment(seasonYear + '-09-01').day(4);
  
  if (moment(gameDate).isBefore(seasonStart)) {
    return 'Preseason';
  }
  
  const daysSinceStart = moment(gameDate).diff(seasonStart, 'days');
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  
  if (weekNumber > 18) {
    return 'Postseason';
  }
  
  return weekNumber;
}

module.exports = calculateNFLWeek;