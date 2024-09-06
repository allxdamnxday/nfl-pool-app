const axios = require('axios');
const Game = require('../models/Game'); // Adjust the path as needed
const Pick = require('../models/Pick');
const Entry = require('../models/Entry');

const RAPID_API_KEY = '1701031eb1mshc800e3940304359p1bd6ccjsn44c6f4718739';

// Function to fetch data from TheRundown API
async function fetchDataFromRundown(date) {
  const options = {
    method: 'GET',
    url: `https://therundown-therundown-v1.p.rapidapi.com/sports/2/closing/${date}`,
    params: {
      offset: '0',
      include: 'scores&include=all_periods'
    },
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': 'therundown-therundown-v1.p.rapidapi.com'
    }
  };

  console.log('Request headers:', JSON.stringify(options.headers, null, 2));

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from TheRundown:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to update a single game
async function updateGameFromRundownData(gameData) {
  const event_id = gameData.event_id;

  // Find the existing game document
  let game = await Game.findOne({ event_id });

  if (!game) {
    console.log(`Game with event_id ${event_id} not found`);
    return null;
  }

  // Update game fields (as in the previous response)
  game.event_uuid = gameData.event_uuid;
  game.sport_id = gameData.sport_id;
  game.event_date = new Date(gameData.event_date);
  game.rotation_number_away = gameData.rotation_number_away;
  game.rotation_number_home = gameData.rotation_number_home;
  game.away_team = gameData.teams_normalized[0].name;
  game.home_team = gameData.teams_normalized[1].name;
  game.score = gameData.score;
  game.teams_normalized = gameData.teams_normalized.map(team => ({
    ...team,
    logo_url: `/logos/${team.abbreviation}.png`
  }));
  game.schedule = gameData.schedule;

  // Update odds (using first sportsbook as an example)
  const firstSportsbook = Object.values(gameData.lines)[0];
  game.odds = {
    moneyline: firstSportsbook.moneyline,
    spread: firstSportsbook.spread,
    total: firstSportsbook.total
  };
  game.total = firstSportsbook.total.total_over;

  // Determine favored team
  if (firstSportsbook.moneyline.moneyline_home < firstSportsbook.moneyline.moneyline_away) {
    game.favored_team = game.home_team;
  } else if (firstSportsbook.moneyline.moneyline_away < firstSportsbook.moneyline.moneyline_home) {
    game.favored_team = game.away_team;
  } else {
    game.favored_team = "Even";
  }

  // Save the updated game
  await game.save();

  return game;
}

// Function to update all games from the API response
async function updateGamesFromRundownResponse(responseData) {
  const updatedGames = [];

  for (const gameData of responseData.events) {
    const updatedGame = await updateGameFromRundownData(gameData);
    if (updatedGame) {
      updatedGames.push(updatedGame);
    }
  }

  return updatedGames;
}

// Function to update related models (e.g., picks, entries)
async function updateRelatedModels(updatedGames) {
  for (const game of updatedGames) {
    if (game.score.event_status === 'STATUS_FINAL') {
      // Determine the winning team
      let winningTeam;
      if (game.score.score_away > game.score.score_home) {
        winningTeam = game.away_team;
      } else if (game.score.score_home > game.score.score_away) {
        winningTeam = game.home_team;
      } else {
        console.log(`Game ${game.event_id} ended in a tie. Picks for this game will remain pending.`);
        continue; // Skip to next game if it's a tie
      }

      // Update picks for this game
      const picks = await Pick.find({ game: game._id, result: 'pending' }).populate('entry');

      for (const pick of picks) {
        const isCorrect = pick.team === winningTeam;
        pick.result = isCorrect ? 'win' : 'loss';
        await pick.save();

        // If the pick is incorrect, update the entry status
        if (!isCorrect) {
          const entry = pick.entry;
          entry.status = 'eliminated';
          entry.eliminatedWeek = game.schedule.week;
          await entry.save();

          console.log(`Entry ${entry._id} eliminated in week ${game.schedule.week}`);
        }
      }

      console.log(`Updated picks for game ${game.event_id}`);
    }
  }
}

// Main function to sync games with TheRundown
async function syncGamesWithRundown(date) {
  try {
    // Fetch data from TheRundown API
    const rundownResponse = await fetchDataFromRundown(date);

    // Update games in our database
    const updatedGames = await updateGamesFromRundownResponse(rundownResponse);

    console.log(`Updated ${updatedGames.length} games for date ${date}`);

    return updatedGames;
  } catch (error) {
    console.error('Error syncing games with TheRundown:', error);
    throw error;
  }
}

// New function to run the closing service
async function runClosingService(date) {
  try {
    // Sync games with TheRundown
    const updatedGames = await syncGamesWithRundown(date);

    // Update related models
    await updateRelatedModels(updatedGames);

    console.log('Closing service completed successfully');
  } catch (error) {
    console.error('Error running closing service:', error);
  }
}

module.exports = { runClosingService };