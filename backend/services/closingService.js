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

// Helper function to safely update fields
function safeUpdate(oldValue, newValue) {
  return newValue !== undefined ? newValue : oldValue;
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

  // Preserve existing fields that might not be in the new data
  const preservedFields = {
    schedule: {
      ...game.schedule,
      league_name: safeUpdate(game.schedule.league_name, gameData.schedule.league_name),
      conference_competition: safeUpdate(game.schedule.conference_competition, gameData.schedule.conference_competition),
      season_type: safeUpdate(game.schedule.season_type, gameData.schedule.season_type),
      season_year: safeUpdate(game.schedule.season_year, gameData.schedule.season_year),
      event_name: safeUpdate(game.schedule.event_name, gameData.schedule.event_name),
      attendance: safeUpdate(game.schedule.attendance, gameData.schedule.attendance),
      week: safeUpdate(game.schedule.week, gameData.schedule.week),
    },
    // Add any other fields here that need to be preserved
  };

  // Update basic game information
  game.event_uuid = safeUpdate(game.event_uuid, gameData.event_uuid);
  game.sport_id = safeUpdate(game.sport_id, gameData.sport_id);
  game.event_date = safeUpdate(game.event_date, new Date(gameData.event_date));
  game.rotation_number_away = safeUpdate(game.rotation_number_away, gameData.rotation_number_away);
  game.rotation_number_home = safeUpdate(game.rotation_number_home, gameData.rotation_number_home);
  game.away_team = safeUpdate(game.away_team, gameData.teams_normalized[0].name);
  game.home_team = safeUpdate(game.home_team, gameData.teams_normalized[1].name);

  // Update score
  game.score = safeUpdate(game.score, gameData.score);

  // Update teams_normalized
  if (gameData.teams_normalized) {
    game.teams_normalized = gameData.teams_normalized.map(team => ({
      ...team,
      logo_url: `/logos/${team.abbreviation}.png` // Assuming you have this naming convention
    }));
  }

  // Merge preserved fields with new data
  game.schedule = {
    ...preservedFields.schedule,
    // Add any new fields from gameData.schedule here
  };

  // Update odds
  if (gameData.lines) {
    const firstSportsbook = Object.values(gameData.lines)[0];
    game.odds = {
      moneyline: safeUpdate(game.odds.moneyline, firstSportsbook.moneyline),
      spread: safeUpdate(game.odds.spread, firstSportsbook.spread),
      total: safeUpdate(game.odds.total, firstSportsbook.total)
    };

    // Update total
    game.total = safeUpdate(game.total, firstSportsbook.total.total_over);

    // Determine favored team
    if (firstSportsbook.moneyline.moneyline_home < firstSportsbook.moneyline.moneyline_away) {
      game.favored_team = game.home_team;
    } else if (firstSportsbook.moneyline.moneyline_away < firstSportsbook.moneyline.moneyline_home) {
      game.favored_team = game.away_team;
    } else {
      game.favored_team = "Even";
    }
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
      const picks = await Pick.find({ game: game._id }).populate('entry');

      for (const pick of picks) {
        if (pick.result === 'pending') {
          const isCorrect = pick.team === winningTeam;
          
          // Update both result and isWin fields
          pick.result = isCorrect ? 'win' : 'loss';
          pick.isWin = isCorrect;

          // Use save() instead of updateOne to trigger any middleware
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
      }

      console.log(`Updated picks for game ${game.event_id}`);
    } else {
      // If the game is not final, ensure all picks for this game have isWin set to null
      await Pick.updateMany({ game: game._id }, { $set: { isWin: null } });
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