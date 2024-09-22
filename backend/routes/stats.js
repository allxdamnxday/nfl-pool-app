// /routes/stats.js

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const checkStatsWeekAccess = require('../middleware/checkStatsWeekAccess');

console.log('Stats Routes Loaded');

/**
 * @route   GET /api/v1/stats/test
 * @desc    Test route to verify stats routes are working
 * @access  Public
 */
router.get('/test', (req, res) => {
  console.log('Test Route Accessed');
  res.json({ message: 'Stats route is working' });
});

/**
 * @route   GET /api/v1/stats/:poolId/total-entries
 * @desc    Get total entries stats for a pool
 * @access  Public (for testing purposes)
 */
router.get('/:poolId/total-entries', statsController.getTotalEntriesStats);

/**
 * @route   GET /api/v1/stats/:poolId/detailed-entries
 * @desc    Get detailed entry list for a pool with pagination
 * @access  Public (for testing purposes)
 */
router.get('/:poolId/detailed-entries', checkStatsWeekAccess, statsController.getDetailedEntryList);

/**
 * @route   GET /api/v1/stats/:poolId/kill-ratio-per-week
 * @desc    Get kill ratio per week for a pool
 * @access  Public (for testing purposes)
 */
router.get('/:poolId/kill-ratio-per-week', (req, res, next) => {
  console.log(`Accessing /:poolId/kill-ratio-per-week with poolId: ${req.params.poolId}`);
  next();
}, statsController.getKillRatioPerWeek);

/**
 * @route   GET /api/v1/stats/:poolId/overall-kill-ratio
 * @desc    Get overall kill ratio for a pool
 * @access  Public (for testing purposes)
 */
router.get('/:poolId/overall-kill-ratio', (req, res, next) => {
  console.log(`Accessing /:poolId/overall-kill-ratio with poolId: ${req.params.poolId}`);
  next();
}, statsController.getOverallKillRatio);

/**
 * @route   GET /api/v1/stats/:poolId/team-stats
 * @desc    Get team stats for a pool
 * @access  Public (for testing purposes)
 */
router.get('/:poolId/team-stats', (req, res, next) => {
  console.log(`Accessing /:poolId/team-stats with poolId: ${req.params.poolId}`);
  next();
}, statsController.getTeamStats);

module.exports = router;
