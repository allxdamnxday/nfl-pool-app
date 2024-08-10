const asyncHandler = require('../middleware/async');
const seasonService = require('../services/seasonService');
const rundownApiService = require('../services/rundownApiService');

/**
 * @module GamesController
 * @description Controller for managing game-related operations in the NFL application.
 * This module provides endpoints for retrieving, updating, and initializing game data.
 */

/**
 * Get games for the current NFL week.
 * @function getCurrentWeekGames
 * @async
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - Sends a JSON response with the current week's games.
 * @throws {Error} Throws an error if the season service fails to retrieve games.
 * 
 * @description This function retrieves all games for the current NFL week.
 * It uses the seasonService to determine the current week and fetch the corresponding games.
 * The response includes a success flag, the count of games, and an array of game objects.
 * 
 * @example
 * // Response format
 * {
 *   success: true,
 *   count: 16,
 *   data: [
 *     {
 *       event_id: "1234567",
 *       away_team: "New York Jets",
 *       home_team: "New England Patriots",
 *       // ... other game properties
 *     },
 *     // ... more game objects
 *   ]
 * }
 */
exports.getCurrentWeekGames = asyncHandler(async (req, res, next) => {
  const games = await seasonService.getCurrentWeekGames();
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

/**
 * Get games for a specific week in a season.
 * @function getGamesForWeek
 * @async
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - Sends a JSON response with the games for the specified week and season.
 * @throws {Error} Throws an error if the season service fails to retrieve games.
 * 
 * @description This function retrieves all games for a specific week in a given NFL season.
 * It expects the season year and week number as parameters in the request URL.
 * The function uses the seasonService to fetch the games based on these parameters.
 * 
 * @example
 * // Request URL: GET /api/v1/games/2023/3
 * // Response format
 * {
 *   success: true,
 *   count: 16,
 *   data: [
 *     {
 *       event_id: "1234567",
 *       away_team: "Green Bay Packers",
 *       home_team: "Chicago Bears",
 *       // ... other game properties
 *     },
 *     // ... more game objects
 *   ]
 * }
 */
exports.getGamesForWeek = asyncHandler(async (req, res, next) => {
  const { seasonYear, week } = req.params;
  const games = await seasonService.getGamesByWeek(parseInt(week), parseInt(seasonYear));
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

/**
 * Update game data for the current date.
 * @function updateGameData
 * @async
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - Sends a JSON response confirming the update.
 * @throws {Error} Throws an error if the season service fails to update game data.
 * 
 * @description This function triggers an update of game data for the current date.
 * It uses the seasonService to fetch the latest game information from the Rundown API
 * and update the corresponding records in the database.
 * This is typically used to refresh scores, stats, and other game-related information.
 * 
 * @example
 * // Response format
 * {
 *   success: true,
 *   message: "Game data updated successfully"
 * }
 */
exports.updateGameData = asyncHandler(async (req, res, next) => {
  await seasonService.updateGameData();
  res.status(200).json({ success: true, message: 'Game data updated successfully' });
});

/**
 * Initialize season data for a specific year.
 * @function initializeSeasonData
 * @async
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - Sends a JSON response with the initialization results.
 * @throws {Error} Throws an error if the season service fails to initialize data.
 * 
 * @description This function initializes or updates the entire season data for a given year.
 * It expects the year as a parameter in the request body.
 * The function uses the seasonService to fetch the full NFL schedule for the specified year
 * and populate the database with this information.
 * It's typically used at the start of a new NFL season or to refresh all data for a season.
 * 
 * @example
 * // Request body: { "year": 2023 }
 * // Response format
 * {
 *   success: true,
 *   message: "Season data initialized successfully",
 *   data: {
 *     upsertedCount: 272,
 *     modifiedCount: 0
 *   }
 * }
 */
exports.initializeSeasonData = asyncHandler(async (req, res, next) => {
  const { year } = req.body;
  const result = await seasonService.initializeSeasonData(parseInt(year));
  res.status(200).json({ 
    success: true, 
    message: 'Season data initialized successfully',
    data: {
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    }
  });
});

/**
 * Get the current NFL week.
 * @function getCurrentNFLWeek
 * @async
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - Sends a JSON response with the current NFL week.
 * @throws {Error} Throws an error if the season service fails to determine the current week.
 * 
 * @description This function retrieves the current NFL week number.
 * It uses the seasonService to calculate the current week based on the current date
 * and the NFL season schedule.
 * 
 * @example
 * // Response format
 * {
 *   success: true,
 *   data: { currentWeek: 7 }
 * }
 */
exports.getCurrentNFLWeek = asyncHandler(async (req, res, next) => {
  const currentWeek = await seasonService.getCurrentNFLWeek();
  res.status(200).json({
    success: true,
    data: { currentWeek }
  });
});

/**
 * Get the current NFL season year.
 * @function getCurrentSeasonYear
 * @async
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - Sends a JSON response with the current NFL season year.
 * @throws {Error} Throws an error if the season service fails to determine the current season year.
 * 
 * @description This function retrieves the current NFL season year.
 * It uses the seasonService to determine the current season year based on the current date.
 * The NFL season typically spans two calendar years, with the season year being the year in which the season started.
 * 
 * @example
 * // Response format
 * {
 *   success: true,
 *   data: { currentSeasonYear: 2023 }
 * }
 */
exports.getCurrentSeasonYear = asyncHandler(async (req, res, next) => {
  const currentSeasonYear = await seasonService.getCurrentSeasonYear();
  res.status(200).json({
    success: true,
    data: { currentSeasonYear }
  });
});