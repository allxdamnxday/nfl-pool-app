const express = require('express');
const killRatioController = require('../controllers/killRatioController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/pool/:poolId/sheet', killRatioController.getKillRatioSheet);
router.get('/pool/:poolId/week/:week', killRatioController.getWeeklyKillRatio);

// Admin only routes
router.use(authorize('admin'));
router.post('/pool/:poolId/week/:week/calculate', authorize('admin'), killRatioController.calculateWeeklyKillRatio);
router.patch('/pick/:pickId/update', killRatioController.updateKillRatioForPick);

module.exports = router;