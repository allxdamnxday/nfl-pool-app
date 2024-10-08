/**
 * @module SeasonService
 * @description Provides functions for managing NFL season data, including game initialization,
 * updates, and retrieval. It also handles season-related settings and calculations.
 */

const Game = require('../models/Game');
const Settings = require('../models/Settings');
const rundownApi = require('./rundownApiService');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');
const { getLogoUrl } = require('../utils/logoHelper');
const moment = require('moment-timezone');

/**
 * Updates a setting in the database.
 * @param {string} key - The key of the setting.
 * @param {*} value - The value to be set.
 * @returns {Promise<void>}
 */
const updateSetting = async (key, value) => {
  await Settings.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true }
  );
};

/**
 * Retrieves a setting from the database.
 * @param {string} key - The key of the setting to retrieve.
 * @returns {Promise<*>} The value of the setting, or null if not found.
 */
const getSetting = async (key) => {
  const setting = await Settings.findOne({ key });
  return setting ? setting.value : null;
};

/**
 * Calculates the NFL week number for a given date and season year.
 * @param {Date} date - The date to calculate the week for.
 * @param {number} seasonYear - The year of the NFL season.
 * @returns {number} The calculated NFL week number.
 */
const calculateNFLWeek = (date, seasonYear) => {
  // Create dates in Eastern Time
  const options = { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' };
  const seasonStartET = new Date(seasonYear, 8, 1).toLocaleString('en-US', options);
  const seasonStart = new Date(seasonStartET);
  seasonStart.setDate(seasonStart.getDate() + (4 - seasonStart.getDay() + 7) % 7); // First Thursday

  const inputDateET = date.toLocaleString('en-US', options);
  const inputDate = new Date(inputDateET);

  console.log(`Season start: ${seasonStart.toISOString()}`);
  console.log(`Input date: ${inputDate.toISOString()}`);

  if (inputDate < seasonStart) {
    console.log('Date is before season start');
    return 0; // Before season starts
  }

  // Check if the input date is in the next year
  if (inputDate.getFullYear() > seasonYear) {
    // If it's after February, it's for the next season
    if (inputDate.getMonth() > 1) {
      console.log('Date is in the next season');
      return 0;
    }
    // Otherwise, it's still part of the current season (January-February)
    const nextYearStart = new Date(seasonYear + 1, 0, 1);
    const weeksInNextYear = Math.floor((inputDate - nextYearStart) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(18 + weeksInNextYear, 22); // Add weeks in next year, cap at 22 (18 regular + 4 postseason)
  }

  const timeDiff = inputDate.getTime() - seasonStart.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  const weekNumber = Math.floor(dayDiff / 7) + 1;

  console.log(`Time difference: ${timeDiff}`);
  console.log(`Day difference: ${dayDiff}`);
  console.log(`Calculated week number: ${weekNumber}`);

  return Math.min(weekNumber, 22); // Cap at 22 weeks (18 regular season + 4 postseason)
};

/**
 * Determines the current NFL season year.
 * @returns {number} The current NFL season year.
 */
const getCurrentSeasonYear = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // If it's January or February, it's still the previous year's season
  if (currentMonth < 2) {
    return currentYear - 1;
  }
  // If it's March through July, it's the offseason, so we'll consider it the upcoming season
  else if (currentMonth < 7) {
    return currentYear;
  }
  // If it's August through December, it's the current season year
  else {
    return currentYear;
  }
};

/**
 * Transforms API game data into the format used by our database.
 * @param {Object} apiGame - The game data from the API.
 * @returns {Object|null} The transformed game data, or null if invalid.
 */
const transformGameData = (apiGame) => {
  if (!apiGame) return null;

  const eventDate = new Date(apiGame.event_date);
  const calculatedWeek = calculateNFLWeek(eventDate, apiGame.schedule.season_year);

  const transformedGame = {
    event_id: apiGame.event_id,
    event_uuid: apiGame.event_uuid,
    sport_id: apiGame.sport_id,
    event_date: eventDate,
    rotation_number_away: apiGame.rotation_number_away,
    rotation_number_home: apiGame.rotation_number_home,
    away_team_id: apiGame.teams_normalized.find(t => t.is_away).team_id,
    home_team_id: apiGame.teams_normalized.find(t => t.is_home).team_id,
    away_team: apiGame.teams_normalized.find(t => t.is_away).name,
    home_team: apiGame.teams_normalized.find(t => t.is_home).name,
    total: apiGame.lines?.total?.total_over,
    score: {
      event_status: apiGame.score.event_status,
      winner_away: apiGame.score.winner_away,
      winner_home: apiGame.score.winner_home,
      score_away: apiGame.score.score_away,
      score_home: apiGame.score.score_home,
      score_away_by_period: apiGame.score.score_away_by_period,
      score_home_by_period: apiGame.score.score_home_by_period,
      venue_name: apiGame.score.venue_name,
      venue_location: apiGame.score.venue_location,
      game_clock: apiGame.score.game_clock,
      display_clock: apiGame.score.display_clock,
      game_period: apiGame.score.game_period,
      broadcast: apiGame.score.broadcast,
      event_status_detail: apiGame.score.event_status_detail,
      updated_at: new Date(apiGame.score.updated_at)
    },
    teams_normalized: apiGame.teams_normalized.map(team => ({
      ...team,
      logo_url: getLogoUrl(team.abbreviation)
    })),
    schedule: {
      league_name: apiGame.schedule.league_name,
      conference_competition: apiGame.schedule.conference_competition,
      season_type: apiGame.schedule.season_type,
      season_year: apiGame.schedule.season_year,
      week: calculatedWeek,
      event_name: apiGame.schedule.event_name,
      attendance: apiGame.schedule.attendance
    },
    odds: apiGame.lines,
    favored_team: apiGame.lines?.spread?.point_spread_away < 0 ? apiGame.teams_normalized.find(t => t.is_away).name : apiGame.teams_normalized.find(t => t.is_home).name
  };

  return transformedGame;
};

/**
 * Initializes or updates the season data for a given year.
 * @param {number} seasonYear - The year of the season to initialize.
 * @returns {Promise<Object>} The result of the bulk write operation.
 */
const initializeSeasonData = async (seasonYear) => {
  if (!Number.isInteger(seasonYear) || seasonYear < 2000 || seasonYear > 2100) {
    throw new ErrorResponse('Invalid season year', 400);
  }

  try {
    const schedules = await rundownApi.fetchNFLSchedule(new Date(seasonYear, 0, 1));
    const games = schedules.map(transformGameData).filter(game => game !== null);

    const bulkOps = games.map(game => ({
      updateOne: {
        filter: { event_id: game.event_id },
        update: { $set: game },
        upsert: true
      }
    }));

    const result = await Game.bulkWrite(bulkOps);
    
    await updateSetting('lastSyncDate', new Date());
    await updateSetting('currentSeasonYear', seasonYear);
    
    logger.info(`Initialized ${result.upsertedCount} new games and updated ${result.modifiedCount} existing games for season ${seasonYear}`);
    return result;
  } catch (error) {
    if (error.name === 'MongoError') {
      throw new ErrorResponse('Error initializing season data', 500);
    } else if (error.isAxiosError) {
      throw new ErrorResponse('Error fetching NFL schedule', 503);
    }
    throw error;
  }
};

/**
 * Updates game data with the latest information from the API.
 * @returns {Promise<void>}
 */
const updateGameData = async () => {
  try {
    const events = await rundownApi.fetchNFLEvents(new Date().toISOString());
    const games = events.map(transformGameData).filter(game => game !== null);

    const bulkOps = games.map(game => ({
      updateOne: {
        filter: { event_id: game.event_id },
        update: { $set: game },
        upsert: true
      }
    }));

    const result = await Game.bulkWrite(bulkOps);
    await updateSetting('lastSyncDate', new Date());
    
    logger.info(`Updated ${result.modifiedCount} games and inserted ${result.upsertedCount} new games`);
  } catch (error) {
    logger.error('Error updating game data:', error);
    throw new ErrorResponse('Error updating game data', 500);
  }
};

/**
 * Retrieves games for a specific week and season year.
 * @param {number} weekNumber - The week number to fetch games for.
 * @param {number} seasonYear - The year of the season.
 * @returns {Promise<Array>} An array of game documents.
 */
const getGamesByWeek = async (weekNumber, seasonYear) => {
  try {
    return await Game.find({
      'schedule.season_year': seasonYear,
      'schedule.week': weekNumber
    }).sort('event_date');
  } catch (error) {
    console.error(`Error fetching games for week ${weekNumber} of season ${seasonYear}:`, error);
    throw error;
  }
};

/**
 * Retrieves games for the current NFL week.
 * @returns {Promise<Array>} An array of game documents for the current week.
 */
const getCurrentWeekGames = async () => {
  const currentDate = new Date();
  const seasonYear = getCurrentSeasonYear();
  const currentWeek = calculateNFLWeek(currentDate, seasonYear);
  return getGamesByWeek(currentWeek, seasonYear);
};

// New utility function
const getCurrentNFLWeek = () => {
  const currentDate = new Date();
  let seasonYear = getCurrentSeasonYear();
  let week = calculateNFLWeek(currentDate, seasonYear);
  
  console.log(`Current date: ${currentDate.toISOString()}`);
  console.log(`Initial season year: ${seasonYear}`);
  console.log(`Calculated week: ${week}`);

  // If it's before the season start (week 0), use the current year
  if (week === 0) {
    // If it's after February, it's the upcoming season
    if (currentDate.getMonth() > 1) {
      seasonYear = currentDate.getFullYear();
      week = 1; // Assume week 1 for the upcoming season
    } else {
      // It's January or February, so it's still the previous season
      seasonYear = currentDate.getFullYear() - 1;
      week = 18; // Assume last week of regular season
    }
  }

  console.log(`Final season year: ${seasonYear}`);
  console.log(`Final week: ${week}`);

  return { week, seasonYear };
};

const fetchNFLEventsForSeason = async (startDate, numberOfWeeks = 18) => {
  const events = [];
  let currentDate = moment(startDate).startOf('day');
  const endDate = moment(currentDate).add(numberOfWeeks, 'weeks');

  while (currentDate.isBefore(endDate)) {
    const dayOfWeek = currentDate.day();
    
    // Check if it's Thursday (4), Sunday (0), or Monday (1)
    if (dayOfWeek === 4 || dayOfWeek === 0 || dayOfWeek === 1) {
      try {
        const formattedDate = currentDate.format('YYYY-MM-DD');
        logger.info(`Fetching NFL events for ${formattedDate}`);
        const dailyEvents = await rundownApi.fetchNFLEvents(formattedDate);
        
        // Filter events for the current date, ignoring time
        const filteredEvents = dailyEvents.filter(event => {
          const eventDate = moment(event.event_date).startOf('day');
          return eventDate.isSame(currentDate, 'day');
        });

        events.push(...filteredEvents);
      } catch (error) {
        logger.error(`Error fetching NFL events for ${currentDate.format('YYYY-MM-DD')}:`, error.message);
      }
    }

    // Move to the next day
    currentDate.add(1, 'days');
  }

  return events;
};

module.exports = {
  initializeSeasonData,
  updateGameData,
  getGamesByWeek,
  getCurrentWeekGames,
  getSetting,
  updateSetting,
  calculateNFLWeek,
  getCurrentSeasonYear,
  transformGameData,
  getCurrentNFLWeek,
  fetchNFLEventsForSeason
};