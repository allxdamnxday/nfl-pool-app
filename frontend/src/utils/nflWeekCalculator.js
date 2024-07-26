// frontend/src/utils/nflWeekCalculator.js

import moment from 'moment';

export function getCurrentNFLWeek() {
  const currentDate = moment();
  const currentYear = currentDate.year();
  
  // NFL season typically starts on the Thursday after Labor Day
  const seasonStart = moment(currentYear + '-09-01').day(4);
  
  // If the current date is before the season start, return week 1
  if (currentDate.isBefore(seasonStart)) {
    return { week: 1, season: currentYear };
  }
  
  // Calculate the number of days since the season start
  const daysSinceStart = currentDate.diff(seasonStart, 'days');
  
  // Calculate the current week (Tuesday is the start of a new week)
  let currentWeek = Math.floor(daysSinceStart / 7) + 1;
  
  // Adjust for Tuesday being the start of a new week
  if (currentDate.day() >= 2) { // 2 represents Tuesday
    currentWeek += 1;
  }
  
  // Cap at week 18 (17 game season + 1)
  currentWeek = Math.min(currentWeek, 18);
  
  return { week: currentWeek, season: currentYear };
}