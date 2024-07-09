// seasonService.js
const axios = require('axios');
const mongoose = require('mongoose');
const Game = require('../models/Game'); // Adjust the path as necessary|
const Settings = require('../models/Settings');
const config = require('../config/rundownApi'); // Adjust the path as necessary

// Initialize axios instance for RundownAPI
const rundownApi = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'x-rapidapi-key': config.RAPID_API_KEY,
    'x-rapidapi-host': config.RAPID_API_HOST
  }
});

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

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

// Transform API game data to our Game model structure
const transformGameData = (apiGame) => ({
  event_id: apiGame.event_id,
  event_uuid: apiGame.event_uuid,
  sport_id: apiGame.sport_id,
  event_date: new Date(apiGame.event_date),
  rotation_number_away: apiGame.rotation_number_away,
  rotation_number_home: apiGame.rotation_number_home,
  score: apiGame.score,
  teams_normalized: apiGame.teams_normalized,
  schedule: apiGame.schedule
});

// Initialize season data
const initializeSeasonData = async (seasonYear) => {
  try {
    const response = await rundownApi.get(`/sports/${config.SPORT_ID.NFL}/schedule`, {
      params: { season_year: seasonYear }
    });
    
    const games = response.data.schedules.map(transformGameData);
    await Game.insertMany(games, { ordered: false });
    
    await updateLastSyncDate(new Date());
    await updateStoredSeasonYear(seasonYear);
    
    console.log(`Initialized ${games.length} games for season ${seasonYear}`);
  } catch (error) {
    console.error('Error initializing season data:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Update game data for a specific date
const updateGameData = async (date = new Date()) => {
  try {
    const response = await rundownApi.get(`/sports/${config.SPORT_ID.NFL}/events/${formatDate(date)}`);
    
    const updatePromises = response.data.events.map(event => 
      Game.findOneAndUpdate(
        { event_id: event.event_id },
        transformGameData(event),
        { upsert: true, new: true }
      )
    );

    await Promise.all(updatePromises);
    await updateLastSyncDate(date);
    
    console.log(`Updated games for ${formatDate(date)}`);
  } catch (error) {
    console.error('Error updating game data:', error);
    throw error;
  }
};

// Get detailed game information
const getDetailedGameInfo = async (eventId) => {
  try {
    const response = await rundownApi.get(`/events/${eventId}`);
    const detailedGame = transformGameData(response.data);
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
    // This part depends on how you're handling task scheduling (e.g., cron jobs)
    console.log('In season: Daily updates should be scheduled');
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

module.exports = {
  initializeSeasonData,
  updateGameData,
  getDetailedGameInfo,
  manageSeason,
  updateHistoricalData
};