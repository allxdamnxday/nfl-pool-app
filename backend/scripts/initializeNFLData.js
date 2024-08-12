const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const rundownApi = require('../services/rundownApiService');
const seasonService = require('../services/seasonService');
const Game = require('../models/Game');
const logger = require('../utils/logger');

async function connectToDatabase() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI); // Add this line for debugging
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function fetchAndSaveGames(fromDate, toDate) {
  try {
    // Fetch the entire schedule for the date range in one call
    const schedule = await rundownApi.fetchNFLSchedule(fromDate);
    const filteredSchedule = schedule.filter(game => {
      const gameDate = new Date(game.event_date);
      return gameDate >= fromDate && gameDate <= toDate;
    });

    // Fetch all event details for the date range in one call
    const allEvents = await rundownApi.fetchNFLEventsRange(fromDate, toDate);

    // Create a map of event_id to event details for quick lookup
    const eventMap = new Map(allEvents.map(event => [event.event_id, event]));

    for (const game of filteredSchedule) {
      const matchingEvent = eventMap.get(game.event_id);

      if (matchingEvent) {
        const transformedGame = seasonService.transformGameData(matchingEvent);
        if (transformedGame) {
          await Game.findOneAndUpdate(
            { event_id: transformedGame.event_id },
            transformedGame,
            { upsert: true, new: true }
          );
          logger.info(`Saved/updated game: ${transformedGame.event_id}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error fetching and saving games:', error);
  }
}

async function initializeNFLData() {
  await connectToDatabase();

  const fromDate = new Date('2024-09-19T00:00:00Z'); // Start from September 19, 2024
  const toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate() + 154); // 22 weeks from the start date

  logger.info(`Fetching games from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

  await fetchAndSaveGames(fromDate, toDate);

  logger.info('NFL data initialization complete');
  mongoose.disconnect();
}

initializeNFLData();