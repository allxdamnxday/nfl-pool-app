const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const NFLTeam = require('../models/NFLTeam');

console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const updateNFLTeamLogos = async () => {
  try {
    const teamLogos = {
      'Arizona Cardinals': '/img/nfl_logos/ARI.png',
      'Atlanta Falcons': '/img/nfl_logos/ATL.png',
      'Baltimore Ravens': '/img/nfl_logos/BAL.png',
      'Buffalo Bills': '/img/nfl_logos/BUF.png',
      'Carolina Panthers': '/img/nfl_logos/CAR.png',
      'Chicago Bears': '/img/nfl_logos/CHI.png',
      'Cincinnati Bengals': '/img/nfl_logos/CIN.png',
      'Cleveland Browns': '/img/nfl_logos/CLE.png',
      'Dallas Cowboys': '/img/nfl_logos/DAL.png',
      'Denver Broncos': '/img/nfl_logos/DEN.png',
      'Detroit Lions': '/img/nfl_logos/DET.png',
      'Green Bay Packers': '/img/nfl_logos/GB.png',
      'Houston Texans': '/img/nfl_logos/HOU.png',
      'Indianapolis Colts': '/img/nfl_logos/IND.png',
      'Jacksonville Jaguars': '/img/nfl_logos/JAX.png',
      'Kansas City Chiefs': '/img/nfl_logos/KC.png',
      'Los Angeles Chargers': '/img/nfl_logos/LAC.png',
      'Los Angeles Rams': '/img/nfl_logos/LAR.png',
      'Las Vegas Raiders': '/img/nfl_logos/LV.png',
      'Miami Dolphins': '/img/nfl_logos/MIA.png',
      'Minnesota Vikings': '/img/nfl_logos/MIN.png',
      'New England Patriots': '/img/nfl_logos/NE.png',
      'New Orleans Saints': '/img/nfl_logos/NO.png',
      'New York Giants': '/img/nfl_logos/NYG.png',
      'New York Jets': '/img/nfl_logos/NYJ.png',
      'Philadelphia Eagles': '/img/nfl_logos/PHI.png',
      'Pittsburgh Steelers': '/img/nfl_logos/PIT.png',
      'Seattle Seahawks': '/img/nfl_logos/SEA.png',
      'San Francisco 49ers': '/img/nfl_logos/SF.png',
      'Tampa Bay Buccaneers': '/img/nfl_logos/TB.png',
      'Tennessee Titans': '/img/nfl_logos/TEN.png',
      'Washington Commanders': '/img/nfl_logos/WAS.png'
    };

    for (const [teamName, logoPath] of Object.entries(teamLogos)) {
      const updatedTeam = await NFLTeam.findOneAndUpdate(
        { name: teamName },
        { $set: { logo: logoPath } },
        { new: true, upsert: false }
      );
      if (updatedTeam) {
        console.log(`Updated logo for ${teamName}: ${logoPath}`);
      } else {
        console.log(`Team not found: ${teamName}`);
      }
    }

    console.log('NFL team logos update completed');
  } catch (error) {
    console.error('Error updating NFL team logos:', error);
  } finally {
    await mongoose.connection.close();
  }
};

updateNFLTeamLogos();