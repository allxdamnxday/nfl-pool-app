const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
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

router.get('/available', getAvailablePools);

router.get('/user', getUserPools);
router.get('/user/active', getUserActivePools);

router.post('/', authorize('admin'), createPool);

router.get('/:id', getPool);
router.put('/:id', authorize('admin'), updatePool);
router.delete('/:id', authorize('admin'), deletePool);
router.get('/:id/stats', getPoolStats);
router.get('/:id/entries', getPoolEntries);
router.put('/:id/status', authorize('admin'), updatePoolStatus);

module.exports = router;