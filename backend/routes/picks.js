const express = require('express');
const { 
  getPicksForPool,
  getPickForWeek,
  updatePick,
  deletePick
} = require('../controllers/picks');
const { protect } = require('../middleware/auth');
const checkGameStart = require('../middleware/checkGameStart');

const router = express.Router({ mergeParams: true });

// Get all picks for a pool
router.route('/pool/:poolId')
  .get(protect, getPicksForPool);

// Get pick for a specific week
router.route('/:entryId/:entryNumber/:week')
  .get(protect, getPickForWeek);

// Update or delete a pick
router.route('/:entryId/:entryNumber/:week')
  .put(protect, checkGameStart, updatePick)
  .delete(protect, deletePick);

module.exports = router;