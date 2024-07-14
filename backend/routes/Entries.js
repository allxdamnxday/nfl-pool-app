const express = require('express');
const { addEntry, getEntriesForPool } = require('../controllers/entries');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @route POST /entries
 * @desc Add a new entry
 * @access Private
 */
router.route('/')
  .post(protect, addEntry)
  /**
   * @route GET /entries
   * @desc Get all entries for a pool
   * @access Private
   */
  .get(protect, getEntriesForPool);

module.exports = router;