const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { fetchNFLEventsForSeason } = require('../services/seasonService');
const Game = require('../models/Game');
const moment = require('moment-timezone');
const logger = require('../utils/logger');

async function connectToDatabase() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
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

async function fetchSeasonEvents() {
  await connectToDatabase();

  const startDate = '2024-09-05'; // NFL season typically starts on a Thursday in early September
  const events = await fetchNFLEventsForSeason(startDate);
  
  logger.info(`Total events fetched: ${events.length}`);
  
  for (const event of events) {
    try {
      const gameData = {
        event_id: event.event_id,
        event_uuid: event.event_uuid,
        sport_id: event.sport_id,
        event_date: event.event_date,
        rotation_number_away: event.rotation_number_away,
        rotation_number_home: event.rotation_number_home,
        away_team_id: event.teams_normalized.find(t => t.is_away).team_id,
        home_team_id: event.teams_normalized.find(t => t.is_home).team_id,
        away_team: event.teams_normalized.find(t => t.is_away).name,
        home_team: event.teams_normalized.find(t => t.is_home).name,
        total: event.lines?.total?.total_over,
        score: event.score,
        teams_normalized: event.teams_normalized,
        schedule: event.schedule,
        odds: event.lines,
        favored_team: event.favored_team
      };

      await Game.findOneAndUpdate(
        { event_id: event.event_id },
        gameData,
        { upsert: true, new: true }
      );
      logger.info(`Updated/Inserted game: ${event.event_id}`);
    } catch (error) {
      logger.error(`Error updating game ${event.event_id}:`, error);
    }
  }

  logger.info('Finished updating database');
  mongoose.connection.close();
}

fetchSeasonEvents().catch(error => {
  logger.error('Script error:', error);
  mongoose.connection.close();
});