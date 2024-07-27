// routes/picks.js
const express = require('express');
const { 
  addOrUpdatePick, 
  getPicksForEntry,  // This should be the correct function name
  getPickForWeek 
} = require('../controllers/entries');  // Make sure this path is correct
const { protect } = require('../middleware/auth');
const checkGameStart = require('../middleware/checkGameStart');

const router = express.Router({ mergeParams: true });

// Get all picks for an entry
router.route('/')
  .get(protect, getPicksForEntry)
  .post(protect, checkGameStart, addOrUpdatePick);

// Get pick for a specific week
router.route('/:week')
  .get(protect, getPickForWeek);

module.exports = router;