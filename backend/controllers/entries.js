/**
 * @module EntryController
 * @description Handles operations related to entries in pools, including retrieval of user entries, adding or updating picks, and fetching entry-related data.
 */

const EntryService = require('../services/entryService');
const asyncHandler = require('../middleware/async');

/**
 * @function getUserEntries
 * @description Get all entries for the current user
 * @route GET /api/v1/entries
 * @access Private
 * 
 * @param {string} req.user.id - User ID (from auth middleware)
 * 
 * @returns {Object} 200 - Array of user entries
 */
exports.getUserEntries = asyncHandler(async (req, res, next) => {
  const entries = await EntryService.getUserEntries(req.user.id);
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

/**
 * @function getEntry
 * @description Get a single entry by ID
 * @route GET /api/v1/entries/:id
 * @access Private
 * 
 * @param {string} req.params.id - Entry ID
 * @param {string} req.user.id - User ID (from auth middleware)
 * 
 * @returns {Object} 200 - Entry details
 * @throws {ErrorResponse} 404 - Entry not found
 * @throws {ErrorResponse} 403 - User not authorized to access this entry
 */
exports.getEntry = asyncHandler(async (req, res, next) => {
  const entry = await EntryService.getEntry(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: entry });
});

/**
 * @function getEntriesForPool
 * @description Get all entries for a specific pool
 * @route GET /api/v1/pools/:poolId/entries
 * @access Private
 * 
 * @param {string} req.params.poolId - Pool ID
 * 
 * @returns {Object} 200 - Array of entries for the specified pool
 */
exports.getEntriesForPool = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const entries = await EntryService.getEntriesForPool(poolId);
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

/**
 * @function addOrUpdatePick
 * @description Add or update a pick for a specific entry
 * @route PUT /api/v1/entries/:entryId/:entryNumber/pick
 * @access Private
 * 
 * @param {string} req.params.entryId - Entry ID
 * @param {string} req.params.entryNumber - Entry number (1, 2, or 3)
 * @param {string} req.user.id - User ID (from auth middleware)
 * @param {Object} req.body - Pick details
 * @param {string} req.body.team - Team picked
 * @param {number} req.body.week - Week number
 * 
 * @returns {Object} 200 - Updated pick
 * @throws {ErrorResponse} 404 - Entry not found
 * @throws {ErrorResponse} 403 - User not authorized to update this entry
 */
exports.addOrUpdatePick = asyncHandler(async (req, res, next) => {
  const { entryId, entryNumber } = req.params;
  const { team, week } = req.body;
  const pick = await EntryService.addOrUpdatePick(entryId, entryNumber, req.user.id, team, week);
  res.status(200).json({ success: true, data: pick });
});

/**
 * @function getPickForWeek
 * @description Get the pick for a specific entry and week
 * @route GET /api/v1/entries/:entryId/:entryNumber/pick/:week
 * @access Private
 * 
 * @param {string} req.params.entryId - Entry ID
 * @param {string} req.params.entryNumber - Entry number (1, 2, or 3)
 * @param {number} req.params.week - Week number
 * 
 * @returns {Object} 200 - Pick details
 * @throws {ErrorResponse} 404 - Pick not found
 */
exports.getPickForWeek = asyncHandler(async (req, res, next) => {
  const { entryId, entryNumber, week } = req.params;
  const pick = await EntryService.getPickForWeek(entryId, entryNumber, week);
  res.status(200).json({ success: true, data: pick });
});

/**
 * @function getUserEntriesWithPicks
 * @description Get all entries for the current user with their picks
 * @route GET /api/v1/entries/with-picks
 * @access Private
 * 
 * @param {string} req.user.id - User ID (from auth middleware)
 * @param {string} [req.query.populate] - Populate picks.game data
 * 
 * @returns {Object} 200 - Array of user entries with picks
 */
exports.getUserEntriesWithPicks = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const populate = req.query.populate === 'true' ? 'picks.game' : undefined;

  const entries = await EntryService.getUserEntriesWithPicks(userId, populate);

  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries
  });
});

/**
 * Middleware:
 * - asyncHandler: Wraps async functions to handle errors
 * 
 * Error Handling:
 * - Uses ErrorResponse utility for consistent error formatting (implied by the use of asyncHandler)
 * - Specific error handling for various scenarios (e.g., entry not found, unauthorized access) is handled in the EntryService
 * 
 * Additional Notes:
 * - All routes are private and require authentication
 * - The controller uses EntryService for business logic implementation
 * - User authorization is checked for certain operations (e.g., accessing or updating entries)
 * - The controller provides various ways to retrieve entry data, including user-specific queries and pool-specific queries
 * 
 * @example
 * // Get all entries for the current user
 * GET /api/v1/entries
 * 
 * // Add or update a pick for an entry
 * PUT /api/v1/entries/5f9f1b9b9b9b9b9b9b9b9b9b/1/pick
 * {
 *   "team": "Green Bay",
 *   "week": 3
 * }
 * 
 * // Get all entries for the current user with their picks
 * GET /api/v1/entries/user/with-picks?populate=true
 */