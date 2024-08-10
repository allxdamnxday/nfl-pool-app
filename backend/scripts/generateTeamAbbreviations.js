const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Game = require('../models/Game');

console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function getUniqueTeamAbbreviations() {
  try {
    const games = await Game.find({}, 'teams_normalized.abbreviation');
    console.log(`Found ${games.length} games`); // Add this line for debugging

    if (!games || games.length === 0) {
      console.log('No games found in the database.');
      return [];
    }

    const abbreviations = new Set();

    games.forEach(game => {
      if (game.teams_normalized && Array.isArray(game.teams_normalized)) {
        game.teams_normalized.forEach(team => {
          if (team && team.abbreviation) {
            abbreviations.add(team.abbreviation);
          }
        });
      }
    });

    return Array.from(abbreviations).sort();
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

async function writeAbbreviationsToFile(abbreviations) {
  const content = abbreviations.map(abbr => `'${abbr}': '${abbr.toLowerCase()}.png',`).join('\n');
  const fileContent = `const teamLogoMap = {\n${content}\n};\n\nmodule.exports = teamLogoMap;`;
  
  const filePath = path.join(__dirname, '..', 'utils', 'teamLogoMap.js');
  await fs.writeFile(filePath, fileContent);
  console.log(`Team abbreviations written to ${filePath}`);
}

async function main() {
  try {
    const abbreviations = await getUniqueTeamAbbreviations();
    console.log(`Found ${abbreviations.length} unique team abbreviations`); // Add this line for debugging
    if (abbreviations.length > 0) {
      await writeAbbreviationsToFile(abbreviations);
    } else {
      console.log('No abbreviations found to write to file.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);