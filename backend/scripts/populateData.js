// backend/scripts/populateData.js
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const NFLTeam = require('../models/NFLTeam');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false // Add this line to address the deprecation warning
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const options = {
  method: 'GET',
  url: 'https://therundown-therundown-v1.p.rapidapi.com/sports/2/teams',
  headers: {
    'x-rapidapi-key': 'dec8ce7a33msh4c86f3386aad9cap1d0d10jsn8979f452d75e',
    'x-rapidapi-host': 'therundown-therundown-v1.p.rapidapi.com'
  }
};

async function removeNullTeamIds() {
  try {
    const result1 = await NFLTeam.deleteMany({ team_id: null });
    const result2 = await NFLTeam.deleteMany({ teamId: null });
    console.log(`Removed ${result1.deletedCount + result2.deletedCount} documents with null team_id or teamId`);
  } catch (error) {
    console.error('Error removing null team_id documents:', error);
  }
}

async function renameTeamIdField() {
  try {
    const result = await NFLTeam.updateMany(
      { teamId: { $exists: true } },
      { $rename: { "teamId": "team_id" } }
    );
    console.log(`Renamed teamId to team_id for ${result.modifiedCount} documents`);
  } catch (error) {
    console.error('Error renaming teamId field:', error);
  }
}

async function cleanupDatabase() {
  try {
    await NFLTeam.collection.dropIndex('teamId_1');
    console.log('Dropped teamId_1 index');
  } catch (error) {
    console.log('No teamId_1 index to drop, or error dropping index:', error.message);
  }

  try {
    const result = await NFLTeam.deleteMany({});
    console.log(`Removed ${result.deletedCount} existing documents`);
  } catch (error) {
    console.error('Error removing existing documents:', error);
  }
}

async function populateData() {
  try {
    const response = await axios.request(options);
    const nflTeams = response.data.teams;

    console.log(`Total teams in API response: ${nflTeams.length}`);

    const teamsToInsert = nflTeams.map(team => ({
      team_id: team.team_id,
      name: team.name,
      mascot: team.mascot,
      abbreviation: team.abbreviation,
      record: team.record,
      conference: team.conference ? {
        conference_id: team.conference.conference_id,
        sport_id: team.conference.sport_id,
        name: team.conference.name
      } : null,
      division: team.division ? {
        division_id: team.division.division_id,
        conference_id: team.division.conference_id,
        sport_id: team.division.sport_id,
        name: team.division.name
      } : null,
      logoUrl: `/img/nfl_logos/${team.abbreviation}.png`,
    }));

    const result = await NFLTeam.insertMany(teamsToInsert, { ordered: false });
    console.log(`Successfully inserted ${result.length} teams`);

    // Check for any teams that weren't inserted
    const insertedTeamIds = result.map(team => team.team_id);
    const notInsertedTeams = nflTeams.filter(team => !insertedTeamIds.includes(team.team_id));

    if (notInsertedTeams.length > 0) {
      console.log(`The following teams were not inserted:`);
      notInsertedTeams.forEach(team => {
        console.log(`- ${team.name} (ID: ${team.team_id})`);
      });
    }

    // Verify the total number of teams in the database
    const totalTeamsInDB = await NFLTeam.countDocuments();
    console.log(`Total teams in database: ${totalTeamsInDB}`);

  } catch (error) {
    console.error('Error populating data:', error);
    if (error.writeErrors) {
      error.writeErrors.forEach(writeError => {
        console.error('Write Error:', writeError.errmsg);
      });
    }
  }
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false // Add this line to address the deprecation warning
})
.then(() => {
  console.log('MongoDB connected');
  return cleanupDatabase();
})
.then(() => populateData())
.then(() => {
  console.log('Data population completed');
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});