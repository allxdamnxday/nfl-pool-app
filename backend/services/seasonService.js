/**
 * @module SeasonService
 */

const Game = require('../models/Game');
const Settings = require('../models/Settings');
const rundownApi = require('./rundownApiService');
const config = require('../config/rundownApi');

/**
 * Formats a date to ISO 8601 string
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date string
 */
const formatDateISO8601 = (date) => {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
};

/**
 * Updates the last sync date in the database
 * @async
 * @param {Date} date - The date to set as the last sync date
 * @returns {Promise<void>}
 */
const updateLastSyncDate = async (date) => {
  await Settings.findOneAndUpdate(
    { key: 'lastSyncDate' },
    { key: 'lastSyncDate', value: date },
    { upsert: true }
  );
};

/**
 * Retrieves the stored season year from the database
 * @async
 * @returns {Promise<number|null>} The stored season year or null if not found
 */
const getStoredSeasonYear = async () => {
  const setting = await Settings.findOne({ key: 'currentSeasonYear' });
  return setting ? setting.value : null;
};

/**
 * Updates the stored season year in the database
 * @async
 * @param {number} year - The year to store
 * @returns {Promise<void>}
 */
const updateStoredSeasonYear = async (year) => {
  await Settings.findOneAndUpdate(
    { key: 'currentSeasonYear' },
    { key: 'currentSeasonYear', value: year },
    { upsert: true }
  );
};

/**
 * Calculates the NFL week number
 * @param {Date} date - The date to calculate the week for
 * @param {number} seasonYear - The year of the NFL season
 * @returns {number} The calculated NFL week number
 */
const calculateNFLWeek = (date, seasonYear) => {
  const seasonStart = new Date(seasonYear, 8, 1); // September 1st
  seasonStart.setDate(seasonStart.getDate() + (4 - seasonStart.getDay() + 7) % 7); // First Thursday after September 1st

  const timeDiff = date.getTime() - seasonStart.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  return Math.floor(dayDiff / 7) + 1;
};

/**
 * Transforms game data from API format to our database format
 * @param {Object} apiGame - The game data from the API
 * @returns {Object|null} The transformed game data or null if invalid
 */
const transformGameData = (apiGame) => {
  if (!apiGame) {
    console.error('Received undefined or null apiGame');
    return null;
  }

  const eventDate = new Date(apiGame.date_event);
  const calculatedWeek = calculateNFLWeek(eventDate, apiGame.season_year);

  return {
    event_id: apiGame.event_id,
    event_uuid: apiGame.event_uuid,
    sport_id: apiGame.sport_id,
    event_date: new Date(apiGame.date_event),
    season_type: apiGame.season_type,
    season_year: apiGame.season_year,
    away_team_id: apiGame.away_team_id,
    home_team_id: apiGame.home_team_id,
    away_team: apiGame.away_team,
    home_team: apiGame.home_team,
    neutral_site: apiGame.neutral_site,
    conference_competition: apiGame.conference_competition,
    away_score: apiGame.away_score,
    home_score: apiGame.home_score,
    league_name: apiGame.league_name,
    event_name: apiGame.event_name,
    broadcast: apiGame.broadcast,
    event_location: apiGame.event_location,
    attendance: apiGame.attendance,
    updated_at: new Date(apiGame.updated_at),
    schedule: {
      season_type: apiGame.season_type,
      season_year: apiGame.season_year,
      week: apiGame.week || calculatedWeek
    }
  };
};

/**
 * Initializes season data by fetching and storing games
 * @async
 * @param {number} seasonYear - The year of the season to initialize
 * @returns {Promise<void>}
 * @throws {Error} If there's an error fetching or storing the data
 */
const initializeSeasonData = async (seasonYear) => {
  try {
    console.log(`Fetching schedule for season ${seasonYear}`);
    const schedules = await rundownApi.fetchNFLSchedule(new Date(seasonYear, 0, 1)); // Pass a valid date
    
    console.log('API Response:', JSON.stringify(schedules, null, 2));

    if (!schedules) {
      throw new Error('Invalid API response structure');
    }

    const games = schedules
      .map(transformGameData)
      .filter(game => game !== null);

    if (games.length === 0) {
      throw new Error('No valid games found in the API response');
    }

    const bulkOps = games.map(game => ({
      updateOne: {
        filter: { event_id: game.event_id },
        update: { $set: game },
        upsert: true
      }
    }));

    const result = await Game.bulkWrite(bulkOps);
    
    await updateLastSyncDate(new Date());
    await updateStoredSeasonYear(seasonYear);
    
    console.log(`Initialized ${result.upsertedCount} new games and updated ${result.modifiedCount} existing games for season ${seasonYear}`);
    return result;
  } catch (error) {
    console.error('Error initializing season data:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

/**
 * Updates game data for a specific season
 * @async
 * @param {number} seasonYear - The year of the season to update
 * @returns {Promise<void>}
 * @throws {Error} If there's an error updating the data
 */
const updateGameData = async (seasonYear) => {
  try {
    const formattedDate = formatDateISO8601(new Date());
    const events = await rundownApi.fetchNFLEvents(formattedDate);
    
    const updatePromises = events.map(event => 
      Game.findOneAndUpdate(
        { event_id: event.event_id },
        transformGameData(event),
        { upsert: true, new: true }
      )
    );

    await Promise.all(updatePromises);
    await updateLastSyncDate(new Date());
    
    console.log(`Updated games for ${formattedDate}`);
  } catch (error) {
    console.error('Error updating game data:', error);
    throw error;
  }
};

/**
 * Retrieves detailed game information
 * @async
 * @param {string} gameId - The ID of the game to retrieve
 * @returns {Promise<Object>} The detailed game information
 * @throws {Error} If there's an error fetching the game details
 */
const getDetailedGameInfo = async (gameId) => {
  try {
    const eventData = await rundownApi.fetchEventDetails(gameId);
    const detailedGame = transformGameData(eventData);
    return await Game.findOneAndUpdate(
      { event_id: gameId },
      detailedGame,
      { new: true }
    );
  } catch (error) {
    console.error(`Error fetching detailed info for game ${gameId}:`, error);
    throw error;
  }
};

/**
 * Manages the season data, including initialization and updates
 * @async
 * @param {number} [seasonYear] - The year of the season to manage (optional)
 * @returns {Promise<void>}
 * @throws {Error} If there's an error managing the season data
 */
const manageSeason = async (seasonYear) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const seasonStartDate = new Date(currentYear, 8, 1); // September 1st
  const seasonEndDate = new Date(currentYear + 1, 1, 15); // February 15th

  if (currentDate >= seasonStartDate && currentDate <= seasonEndDate) {
    // We're in season, ensure daily updates are scheduled
    console.log('In season: Daily updates should be scheduled');
    await updateWeekNumbers(currentYear);
  } else {
    // We're off-season, reduce update frequency
    console.log('Off season: Weekly updates should be scheduled');
  }

  // Check if we need to initialize data for a new season
  const storedSeasonYear = await getStoredSeasonYear();
  if (currentDate >= seasonStartDate && storedSeasonYear < currentYear) {
    await initializeSeasonData(currentYear);
  }
};

/**
 * Updates historical data for a specific date range
 * @async
 * @param {Date} startDate - The start date of the range to update
 * @param {Date} endDate - The end date of the range to update
 * @returns {Promise<void>}
 * @throws {Error} If there's an error updating the historical data
 */
const updateHistoricalData = async (startDate, endDate) => {
  try {
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      await updateGameData(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Updated historical data from ${formatDate(startDate)} to ${formatDate(endDate)}`);
  } catch (error) {
    console.error('Error updating historical data:', error);
    throw error;
  }
};

/**
 * Retrieves games for a specific week and season
 * @async
 * @param {number} weekNumber - The week number to retrieve games for
 * @param {number} seasonYear - The year of the season
 * @returns {Promise<Array>} An array of games for the specified week
 * @throws {Error} If there's an error fetching the games
 */
const getGamesByWeek = async (weekNumber, seasonYear) => {
  try {
    const games = await Game.find({
      'schedule.season_year': seasonYear
    }).sort('event_date');

    return games.filter(game => {
      const gameWeek = game.schedule.week || calculateNFLWeek(new Date(game.event_date), seasonYear);
      return gameWeek === weekNumber;
    });
  } catch (error) {
    console.error(`Error fetching games for week ${weekNumber} of season ${seasonYear}:`, error);
    throw error;
  }
};

/**
 * Retrieves games for the current week
 * @async
 * @returns {Promise<Array>} An array of games for the current week
 * @throws {Error} If there's an error fetching the games
 */
const getCurrentWeekGames = async () => {
  try {
    const currentDate = new Date();
    console.log('Current date:', currentDate);

    // If we're in January or February, it's still the previous year's season
    const seasonYear = currentDate.getMonth() < 2 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    console.log('Season year:', seasonYear);

    const games = await Game.find({
      'schedule.season_year': seasonYear,
      event_date: { $gte: currentDate }
    }).sort('event_date');

    console.log('Games found:', games.length);

    if (games.length === 0) {
      console.log('No games found for the current season year and date');
      return [];
    }

    const currentWeekNumber = calculateNFLWeek(currentDate, seasonYear);
    console.log('Calculated week number:', currentWeekNumber);

    // If it's before the season starts or the calculated week is negative, use Week 1
    const weekToUse = currentWeekNumber <= 0 ? 1 : currentWeekNumber;
    console.log('Week to use:', weekToUse);

    const filteredGames = games.filter(game => {
      const gameWeek = game.schedule.week || calculateNFLWeek(new Date(game.event_date), seasonYear);
      return gameWeek === weekToUse;
    });

    console.log('Filtered games:', filteredGames.length);

    return filteredGames;
  } catch (error) {
    console.error('Error fetching current week games:', error);
    throw error;
  }
};

/**
 * Updates week numbers for games in a specific season
 * @async
 * @param {number} seasonYear - The year of the season to update
 * @returns {Promise<void>}
 * @throws {Error} If there's an error updating the week numbers
 */
const updateWeekNumbers = async (seasonYear) => {
  const games = await Game.find({
    'schedule.season_year': seasonYear,
    'schedule.week': null
  });

  for (const game of games) {
    const weekNumber = calculateNFLWeek(new Date(game.event_date), seasonYear);
    game.schedule.week = weekNumber;
    await game.save();
  }

  console.log(`Updated week numbers for ${games.length} games`);
};

/**
 * Retrieves the current NFL week and season year
 * @async
 * @returns {Promise<Object>} An object containing the current week and season year
 * @throws {Error} If there's an error calculating the current week
 */
const getCurrentNFLWeek = async () => {
  const currentDate = new Date();
  const seasonStartDate = new Date(currentDate.getFullYear(), 8, 1); // September 1st
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  
  let week = Math.floor((currentDate - seasonStartDate) / msPerWeek) + 1;
  
  // Ensure week is between 1 and 18
  week = Math.max(1, Math.min(week, 18));

  return {
    week,
    seasonYear: currentDate.getFullYear()
  };
};

module.exports = {
  initializeSeasonData,
  updateGameData,
  getDetailedGameInfo,
  manageSeason,
  updateHistoricalData,
  getGamesByWeek,
  transformGameData,
  calculateNFLWeek,
  formatDateISO8601,
  getCurrentWeekGames,
  updateWeekNumbers,
  getCurrentNFLWeek
};