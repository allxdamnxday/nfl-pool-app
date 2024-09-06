// backend/routes/season.js

const express = require('express');
const seasonService = require('../services/seasonService');
const { runClosingService } = require('../services/closingService');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/current-week-number', protect, asyncHandler(async (req, res) => {
  const currentWeek = await seasonService.getCurrentNFLWeek();
  res.json({ success: true, data: currentWeek });
}));

// New route to run the closing service
router.post('/run-closing-service', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required' });
  }
  await runClosingService(date);
  res.status(200).json({ success: true, message: 'Closing service completed successfully' });
}));

module.exports = router;