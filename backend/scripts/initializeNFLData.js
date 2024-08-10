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
    const schedule = await rundownApi.fetchNFLSchedule(fromDate);
    const filteredSchedule = schedule.filter(game => new Date(game.event_date) <= toDate);

    for (const game of filteredSchedule) {
      const eventDate = new Date(game.event_date);
      const events = await rundownApi.fetchNFLEvents(eventDate);
      const matchingEvent = events.find(event => event.event_id === game.event_id);

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

  const currentDate = new Date();
  const currentYear = seasonService.getCurrentSeasonYear();
  const currentWeek = await seasonService.getCurrentNFLWeek();

  const fromDate = currentDate;
  const toDate = new Date(currentDate);
  toDate.setDate(toDate.getDate() + 28); // 4 weeks from now

  logger.info(`Fetching games from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

  await fetchAndSaveGames(fromDate, toDate);

  logger.info('NFL data initialization complete');
  mongoose.disconnect();
}

initializeNFLData();