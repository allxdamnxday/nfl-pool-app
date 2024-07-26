const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
  joinPool,
  leavePool,
  getPoolStats,
  getUserActivePools,
  getUserPools,
  getAvailablePools,
  updatePoolStatus,
  getPoolEntries
} = require('../controllers/pools');

const Pool = require('../models/Pool');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', advancedResults(Pool), getPools);

// Protected routes
router.use(protect);

// Place this route before the '/:id' route
router.get('/available', getAvailablePools);

router.get('/user/:userId/active', getUserActivePools);
router.get('/user', getUserPools);

router.post('/', authorize('admin'), createPool);

// Place the '/:id' routes at the end
router.get('/:id', getPool);
router.put('/:id', authorize('admin'), updatePool);
router.delete('/:id', authorize('admin'), deletePool);
router.post('/:id/join', joinPool);
router.post('/:id/leave', leavePool);
router.get('/:id/stats', getPoolStats);
router.put('/:id/status', protect, authorize('admin'), updatePoolStatus);
router.get('/:id/entries', protect, getPoolEntries);

module.exports = router;