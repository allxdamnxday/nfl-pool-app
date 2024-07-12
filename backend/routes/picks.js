// routes/picks.js
const express = require('express');
const { addPick, getPicksForPool, getPickForWeek, updatePick } = require('../controllers/picks');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getPicksForPool)
  .post(protect, addPick);

router.route('/:week')
  .get(protect, getPickForWeek);

router.route('/:id')
  .put(protect, updatePick);

module.exports = router;