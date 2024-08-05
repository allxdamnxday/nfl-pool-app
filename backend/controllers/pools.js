/**
 * @module PoolController
 * @description Handles operations related to pools, including creation, retrieval, updating, and deletion of pools, as well as various pool-related statistics and user-specific pool data.
 */

const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const poolService = require('../services/poolService');
const Pool = require('../models/Pool');
const Entry = require('../models/Entry');

/**
 * @function getPools
 * @description Get all pools
 * @route GET /api/v1/pools
 * @access Public
 * 
 * @returns {Object} 200 - Array of pools with pagination
 */
exports.getPools = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @function getPool
 * @description Get a single pool by ID
 * @route GET /api/v1/pools/:id
 * @access Public
 * 
 * @param {string} req.params.id - Pool ID
 * 
 * @returns {Object} 200 - Pool details
 * @throws {ErrorResponse} 404 - Pool not found
 */
exports.getPool = asyncHandler(async (req, res, next) => {
  const pool = await poolService.getById(req.params.id);
  res.status(200).json({ success: true, data: pool });
});

/**
 * @function createPool
 * @description Create a new pool
 * @route POST /api/v1/pools
 * @access Private
 * 
 * @param {Object} req.body - Pool details
 * @param {string} req.user.id - User ID creating the pool
 * 
 * @returns {Object} 201 - Created pool
 */
exports.createPool = asyncHandler(async (req, res, next) => {
  const pool = await poolService.createPool(req.user.id, req.body);
  res.status(201).json({ success: true, data: pool });
});

/**
 * @function updatePool
 * @description Update a pool
 * @route PUT /api/v1/pools/:id
 * @access Private
 * 
 * @param {string} req.params.id - Pool ID
 * @param {string} req.user.id - User ID updating the pool
 * @param {Object} req.body - Updated pool details
 * 
 * @returns {Object} 200 - Updated pool
 * @throws {ErrorResponse} 404 - Pool not found
 * @throws {ErrorResponse} 403 - User not authorized to update pool
 */
exports.updatePool = asyncHandler(async (req, res, next) => {
  const pool = await poolService.updatePool(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: pool });
});

/**
 * @function deletePool
 * @description Delete a pool
 * @route DELETE /api/v1/pools/:id
 * @access Private
 * 
 * @param {string} req.params.id - Pool ID
 * @param {string} req.user.id - User ID deleting the pool
 * 
 * @returns {Object} 200 - No content
 * @throws {ErrorResponse} 404 - Pool not found
 * @throws {ErrorResponse} 403 - User not authorized to delete pool
 */
exports.deletePool = asyncHandler(async (req, res, next) => {
  await poolService.deletePool(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: {} });
});

/**
 * @function getPoolStats
 * @description Get statistics for a specific pool
 * @route GET /api/v1/pools/:id/stats
 * @access Private
 * 
 * @param {string} req.params.id - Pool ID
 * 
 * @returns {Object} 200 - Pool statistics
 * @throws {ErrorResponse} 404 - Pool not found
 */
exports.getPoolStats = asyncHandler(async (req, res, next) => {
  const stats = await poolService.getPoolStats(req.params.id);
  res.status(200).json({ success: true, data: stats });
});

/**
 * @function getAvailablePools
 * @description Get all available pools for a user to join
 * @route GET /api/v1/pools/available
 * @access Private
 * 
 * @param {string} req.user.id - User ID
 * 
 * @returns {Object} 200 - Array of available pools
 */
exports.getAvailablePools = asyncHandler(async (req, res, next) => {
  const pools = await poolService.getAvailablePools(req.user.id);
  res.status(200).json({ success: true, count: pools.length, data: pools });
});

/**
 * @function updatePoolStatus
 * @description Update the status of a pool
 * @route PUT /api/v1/pools/:id/status
 * @access Private (Admin only)
 * 
 * @param {string} req.params.id - Pool ID
 * @param {string} req.body.status - New status for the pool
 * 
 * @returns {Object} 200 - Updated pool
 * @throws {ErrorResponse} 404 - Pool not found
 */
exports.updatePoolStatus = asyncHandler(async (req, res, next) => {
  const pool = await poolService.updatePoolStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: pool });
});

/**
 * @function getUserActivePools
 * @description Get all active pools for a specific user
 * @route GET /api/v1/pools/user/:userId/active
 * @access Private
 * 
 * @param {string} req.params.userId - User ID
 * 
 * @returns {Object} 200 - Array of active pools for the user
 * @throws {ErrorResponse} 403 - User not authorized to access this data
 */
exports.getUserActivePools = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this route`, 403));
  }
  const userPools = await poolService.getUserActivePools(userId);
  res.status(200).json({ success: true, count: userPools.length, data: userPools });
});

/**
 * @function getUserPools
 * @description Get all pools for the current user
 * @route GET /api/v1/pools/user
 * @access Private
 * 
 * @returns {Object} 200 - Array of pools for the user with active entry count
 */
exports.getUserPools = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const poolsWithEntries = await poolService.getUserPools(userId);

  res.status(200).json({ 
    success: true, 
    count: poolsWithEntries.length, 
    data: poolsWithEntries 
  });
});

/**
 * @function getUserPoolsWithEntries
 * @description Get all pools for the current user with their active entries
 * @route GET /api/v1/pools/user/entries
 * @access Private
 * 
 * @returns {Object} 200 - Array of pools with active entries for the user
 */
exports.getUserPoolsWithEntries = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const poolsWithEntries = await poolService.getUserPoolsWithEntries(userId);

  res.status(200).json({
    success: true,
    data: poolsWithEntries
  });
});

/**
 * @function getPoolEntries
 * @description Get all entries for a specific pool
 * @route GET /api/v1/pools/:id/entries
 * @access Private
 * 
 * @param {string} req.params.id - Pool ID
 * 
 * @returns {Object} 200 - Array of entries for the pool
 */
exports.getPoolEntries = asyncHandler(async (req, res, next) => {
  const entries = await Entry.find({ pool: req.params.id });
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
 * - Uses ErrorResponse utility for consistent error formatting
 * - Specific error handling for various scenarios (e.g., pool not found, unauthorized access)
 * 
 * Additional Notes:
 * - Some routes are restricted to admin access only
 * - The controller uses poolService for business logic implementation
 * - User authorization is checked for certain operations (e.g., updating, deleting pools)
 * - The controller provides various ways to retrieve pool data, including user-specific queries
 * 
 * @example
 * // Create a new pool
 * POST /api/v1/pools
 * {
 *   "name": "NFL 2023 Season Pool",
 *   "description": "Elimination pool for the 2023 NFL season",
 *   "entryFee": 50,
 *   "maxEntries": 100
 * }
 * 
 * // Get user's pools with active entries
 * GET /api/v1/pools/user/entries
 */