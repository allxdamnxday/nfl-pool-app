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
 * 
 * Math explanation:
 * 1. Set season start to September 1st of the given year: new Date(seasonYear, 8, 1)
 * 2. Adjust to the first Thursday after Sept 1st: (4 - seasonStart.getDay() + 7) % 7
 *    - 4 represents Thursday (0-indexed week starting with Sunday)
 *    - Add 7 and use modulo to ensure positive result
 * 3. Calculate time difference in milliseconds: date.getTime() - seasonStart.getTime()
 * 4. Convert milliseconds to days: timeDiff / (1000 * 3600 * 24)
 *    - 1000 ms/s * 3600 s/h * 24 h/day
 * 5. Calculate weeks: Math.floor(dayDiff / 7)
 * 6. Add 1 to start week numbering at 1 instead of 0
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

  const timeDiff = inputDate.getTime() - seasonStart.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  const weekNumber = Math.floor(dayDiff / 7) + 1;

  console.log(`Time difference: ${timeDiff}`);
  console.log(`Day difference: ${dayDiff}`);
  console.log(`Calculated week number: ${weekNumber}`);

  return weekNumber;
};

/**
 * Determines the current NFL season year.
 * @returns {number} The current NFL season year.
 */
const getCurrentSeasonYear = () => {
  const currentDate = new Date();
  return currentDate.getMonth() < 2 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
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
const getCurrentNFLWeek = async () => {
  const currentDate = new Date();
  const seasonYear = getCurrentSeasonYear();
  return calculateNFLWeek(currentDate, seasonYear);
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
  getCurrentNFLWeek
};