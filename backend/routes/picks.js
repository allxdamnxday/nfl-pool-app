// routes/picks.js
const express = require('express');
const { addPick, getPicksForPool, getPickForWeek, updatePick } = require('../controllers/picks');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @route GET /picks
 * @desc Get all picks for a pool
 * @access Private
 */
router.route('/')
  .get(protect, getPicksForPool)
  /**
   * @route POST /picks
   * @desc Add a new pick
   * @access Private
   */
  .post(protect, addPick);

/**
 * @route GET /picks/:week
 * @desc Get pick for a specific week
 * @access Private
 */
router.route('/:week')
  .get(protect, getPickForWeek);

/**
 * @route PUT /picks/:id
 * @desc Update a pick
 * @access Private
 */
router.route('/:id')
  .put(protect, updatePick);

module.exports = router;