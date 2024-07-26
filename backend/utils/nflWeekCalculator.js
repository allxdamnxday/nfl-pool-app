const moment = require('moment');

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