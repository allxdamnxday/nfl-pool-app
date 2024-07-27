// backend/routes/season.js

const express = require('express');
const seasonService = require('../services/seasonService');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/current-week-number', protect, asyncHandler(async (req, res) => {
  const currentWeek = await seasonService.getCurrentNFLWeek();
  res.json({ success: true, data: currentWeek });
}));

module.exports = router;