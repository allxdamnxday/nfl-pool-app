require('dotenv').config();
const mongoose = require('mongoose');
const { syncNFLTeams } = require('./services/dataSyncService');
const NFLTeam = require('./models/NFLTeam');

const testNFLTeamSync = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Sync NFL Teams
    await syncNFLTeams();

    // Fetch and log all NFL teams from the database
    const teams = await NFLTeam.find({});
    console.log('NFL Teams in database:');
    teams.forEach(team => {
      console.log(`${team.name} ${team.mascot} (${team.abbreviation})`);
    });

    console.log(`Total teams: ${teams.length}`);

  } catch (error) {
    console.error('Error in testNFLTeamSync:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

testNFLTeamSync();