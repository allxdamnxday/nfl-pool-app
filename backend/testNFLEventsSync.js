require('dotenv').config();
const mongoose = require('mongoose');
const { syncNFLEvents } = require('./services/dataSyncService');
const Game = require('./models/Game');

const testNFLEventsSync = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('Starting NFL Events sync...');
    await syncNFLEvents();
    console.log('NFL Events sync completed');

    const games = await Game.find({}).sort('date_event');
    console.log('NFL Games in database:');
    games.forEach(game => {
      console.log(`${game.away_team} at ${game.home_team}`);
      console.log(`  Date: ${game.date_event}`);
      console.log(`  Location: ${game.event_location}`);
      console.log(`  Broadcast: ${game.broadcast}`);
      console.log('---');
    });

    console.log(`Total games: ${games.length}`);

  } catch (error) {
    console.error('Error in testNFLEventsSync:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testNFLEventsSync();
