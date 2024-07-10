// backend/routes/picks.js
const express = require('express');
const {
  addPick,
  getPicksForPool,
  getPickForWeek,
  updatePick,
  deletePick
} = require('../controllers/picks');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

router.route('/')
  .get(protect, asyncHandler(getPicksForPool))
  .post(protect, authorize('user', 'admin'), asyncHandler(addPick));

router.route('/:week')
  .get(protect, asyncHandler(getPickForWeek));

router.route('/:id')
  .put(protect, authorize('user', 'admin'), asyncHandler(updatePick))
  .delete(protect, authorize('user', 'admin'), asyncHandler(deletePick));

module.exports = router;