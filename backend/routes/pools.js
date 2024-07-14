// backend/routes/pools.js
const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
  joinPool,
  leavePool,
  getPoolStats
} = require('../controllers/pools');

const Pool = require('../models/Pool');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

/**
 * @route GET /pools
 * @desc Get all pools
 * @access Public
 */
router
  .route('/')
  .get(advancedResults(Pool, 'participants'), asyncHandler(getPools))
  /**
   * @route POST /pools
   * @desc Create a new pool
   * @access Private
   */
  .post(protect, authorize('user', 'admin'), asyncHandler(createPool));

/**
 * @route GET /pools/:id
 * @desc Get a single pool by ID
 * @access Public
 */
router
  .route('/:id')
  .get(asyncHandler(getPool))
  /**
   * @route PUT /pools/:id
   * @desc Update a pool by ID
   * @access Private
   */
  .put(protect, authorize('user', 'admin'), asyncHandler(updatePool))
  /**
   * @route DELETE /pools/:id
   * @desc Delete a pool by ID
   * @access Private
   */
  .delete(protect, authorize('user', 'admin'), asyncHandler(deletePool));

/**
 * @route POST /pools/:id/join
 * @desc Join a pool
 * @access Private
 */
router.route('/:id/join').post(protect, asyncHandler(joinPool));

/**
 * @route POST /pools/:id/leave
 * @desc Leave a pool
 * @access Private
 */
router.route('/:id/leave').post(protect, asyncHandler(leavePool));

/**
 * @route GET /pools/:id/stats
 * @desc Get statistics for a pool
 * @access Private
 */
router.route('/:id/stats').get(protect, asyncHandler(getPoolStats));

module.exports = router;