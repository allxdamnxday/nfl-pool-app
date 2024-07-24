// backend/services/seasonService.js
const axios = require('axios');
const mongoose = require('mongoose');
const Game = require('../models/Game');
const Settings = require('../models/Settings');
const config = require('../config/rundownApi');

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

// Function to calculate NFL week number (as a fallback)
const calculateNFLWeek = (gameDate, seasonYear) => {
  const seasonStart = new Date(seasonYear, 8, 1); // September 1st
  seasonStart.setDate(seasonStart.getDate() + (9 - seasonStart.getDay()) % 7); // First Tuesday after first Monday

  const weekDiff = Math.floor((gameDate - seasonStart) / (7 * 24 * 60 * 60 * 1000));
  return weekDiff + 1;
};

// Updated transformGameData function with error handling
const transformGameData = (apiGame) => {
  if (!apiGame) {
    console.error('Received undefined or null apiGame');
    return null;
  }

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
      week: apiGame.week || null // Add this if available in the API response
    }
  };
};
  
  // Updated initializeSeasonData function with error handling
  const initializeSeasonData = async (seasonYear) => {
    try {
      console.log(`Fetching schedule for season ${seasonYear}`);
      const response = await rundownApi.get(`/sports/${config.SPORT_ID.NFL}/schedule`, {
        params: { season_year: seasonYear }
      });
      
      console.log('API Response:', JSON.stringify(response.data, null, 2));
  
      if (!response.data || !response.data.schedules) {
        throw new Error('Invalid API response structure');
      }
  
      const games = response.data.schedules
        .map(transformGameData)
        .filter(game => game !== null);
  
      if (games.length === 0) {
        throw new Error('No valid games found in the API response');
      }
  
      await Game.insertMany(games, { ordered: false });
      
      await updateLastSyncDate(new Date());
      await updateStoredSeasonYear(seasonYear);
      
      console.log(`Initialized ${games.length} games for season ${seasonYear}`);
    } catch (error) {
      console.error('Error initializing season data:', error);
      console.error('Error details:', error.response?.data);
      throw error;
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

const getGamesByWeek = async (seasonYear, weekNumber) => {
  try {
    const games = await Game.find({
      'schedule.season_year': seasonYear,
      'schedule.week': weekNumber
    }).sort('event_date');

    return games;
  } catch (error) {
    console.error(`Error fetching games for week ${weekNumber} of season ${seasonYear}:`, error);
    throw error;
  }
};

module.exports = {
  initializeSeasonData,
  updateGameData,
  getDetailedGameInfo,
  manageSeason,
  updateHistoricalData,
  getGamesByWeek,
  transformGameData,
  calculateNFLWeek
};