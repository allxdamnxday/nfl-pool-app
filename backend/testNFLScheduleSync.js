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

    // Use a date we know has NFL games
    const testDate = '2023-09-10'; // First Sunday of 2023 NFL season
    console.log(`Starting NFL Schedule sync for ${testDate}...`);
    await syncNFLSchedule(testDate, 10);
    console.log('NFL Schedule sync completed');

    const games = await Game.find({}).sort('event_date');
    console.log('NFL Games in database:');
    games.forEach(game => {
      const homeTeam = game.teams_normalized.find(team => team.is_home);
      const awayTeam = game.teams_normalized.find(team => team.is_away);
      console.log(`${awayTeam.name} at ${homeTeam.name}`);
      console.log(`  Date: ${new Date(game.event_date).toLocaleString()}`);
      console.log(`  Venue: ${game.venue.name}`);
      console.log(`  Broadcast: ${game.broadcast ? game.broadcast.network : 'N/A'}`);
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