// backend/scripts/populateData.js
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const NFLTeam = require('../models/NFLTeam');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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

async function populateData() {
  try {
    const response = await axios.request(options);
    const nflTeams = response.data.teams;

    for (const team of nflTeams) {
      const conferenceName = team.conference && team.conference.name;
      const divisionName = team.division && team.division.name;

      const conference = conferenceName.includes('American') ? 'AFC' : 'NFC';
      const division = divisionName ? divisionName.split(' ')[1] : '';

      await NFLTeam.findOneAndUpdate(
        { teamId: team.team_id },
        {
          teamId: team.team_id,
          name: team.name,
          abbreviation: team.abbreviation,
          mascot: team.mascot,
          record: team.record || '',
          conference: conference || '',
          division: division || ''
        },
        { upsert: true, new: true }
      );
    }
    console.log('NFL teams populated');
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    mongoose.disconnect();
  }
}

populateData();
