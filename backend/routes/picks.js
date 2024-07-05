// backend/routes/picks.js
const express = require('express');
const {
  addPick,
  getPicksForPool,
  getPickForWeek,
  updatePick
} = require('../controllers/picks');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPicksForPool)
  .post(protect, authorize('user', 'admin'), addPick);

router.route('/:week')
  .get(protect, getPickForWeek);

router.route('/:id')
  .put(protect, authorize('user', 'admin'), updatePick);

module.exports = router;