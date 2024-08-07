// backend/services/seasonService.js
const Game = require('../models/Game');
const Settings = require('../models/Settings');
const rundownApi = require('./rundownApiService');
const config = require('../config/rundownApi'); // Ensure this line is added to import the config
const formatDateISO8601 = (date) => {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
};

// Helper function to update last sync date in database
const updateLastSyncDate = async (date) => {
  await Settings.findOneAndUpdate(
    { key: 'lastSyncDate' },
    { key: 'lastSyncDate', value: date },
    { upsert: true }
  );
};

const getStoredSeasonYear = async () => {
  const setting = await Settings.findOne({ key: 'currentSeasonYear' });
  return setting ? setting.value : null;
};

const updateStoredSeasonYear = async (year) => {
  await Settings.findOneAndUpdate(
    { key: 'currentSeasonYear' },
    { key: 'currentSeasonYear', value: year },
    { upsert: true }
  );
};

// Function to calculate NFL week number (as a fallback)
const calculateNFLWeek = (date, seasonYear) => {
  const seasonStart = new Date(seasonYear, 8, 1); // September 1st
  seasonStart.setDate(seasonStart.getDate() + (4 - seasonStart.getDay() + 7) % 7); // First Thursday after September 1st

  const timeDiff = date.getTime() - seasonStart.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  return Math.floor(dayDiff / 7) + 1;
};

// Updated transformGameData function with week calculation
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
  
// Updated initializeSeasonData function with error handling
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

// Updated updateGameData function with error handling
const updateGameData = async (date = new Date()) => {
  try {
    const formattedDate = formatDateISO8601(date);
    const events = await rundownApi.fetchNFLEvents(formattedDate);
    
    const updatePromises = events.map(event => 
      Game.findOneAndUpdate(
        { event_id: event.event_id },
        transformGameData(event),
        { upsert: true, new: true }
      )
    );

    await Promise.all(updatePromises);
    await updateLastSyncDate(date);
    
    console.log(`Updated games for ${formattedDate}`);
  } catch (error) {
    console.error('Error updating game data:', error);
    throw error;
  }
};

// Get detailed game information
const getDetailedGameInfo = async (eventId) => {
  try {
    const eventData = await rundownApi.fetchEventDetails(eventId);
    const detailedGame = transformGameData(eventData);
    return await Game.findOneAndUpdate(
      { event_id: eventId },
      detailedGame,
      { new: true }
    );
  } catch (error) {
    console.error(`Error fetching detailed info for game ${eventId}:`, error);
    throw error;
  }
};

// Manage season status and updates
const manageSeason = async () => {
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

// Update historical data for a date range
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

const getGamesByWeek = async (seasonYear, weekNumber) => {
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