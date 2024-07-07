require('dotenv').config();
const mongoose = require('mongoose');
const { syncNFLSchedule } = require('./services/dataSyncService');
const Game = require('./models/Game');

const testNFLScheduleSync = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const fromDate = '2024-08-01'; // Using the date from your example
    console.log(`Starting NFL Schedule sync from ${fromDate}...`);
    await syncNFLSchedule(fromDate, 100);
    console.log('NFL Schedule sync completed');

    const games = await Game.find({}).sort('date_event');
    console.log('NFL Games in database:');
    games.forEach(game => {
      console.log(`${game.away_team} at ${game.home_team}`);
      console.log(`  Date: ${new Date(game.date_event).toLocaleString()}`);
      console.log(`  Location: ${game.event_location}`);
      console.log(`  Status: ${game.event_status_detail}`);
      console.log('---');
    });

    console.log(`Total games: ${games.length}`);

  } catch (error) {
    console.error('Error in testNFLScheduleSync:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testNFLScheduleSync();