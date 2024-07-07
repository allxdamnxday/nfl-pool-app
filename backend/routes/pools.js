// backend/routes/pools.js
const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
  joinPool,
  leavePool,
  getPoolStats
} = require('../controllers/pools');

const Pool = require('../models/Pool');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

router
  .route('/')
  .get(advancedResults(Pool, 'participants'), asyncHandler(getPools))
  .post(protect, authorize('user', 'admin'), asyncHandler(createPool));

router
  .route('/:id')
  .get(asyncHandler(getPool))
  .put(protect, authorize('user', 'admin'), asyncHandler(updatePool))
  .delete(protect, authorize('user', 'admin'), asyncHandler(deletePool));

router.route('/:id/join').post(protect, asyncHandler(joinPool));
router.route('/:id/leave').post(protect, asyncHandler(leavePool));
router.route('/:id/stats').get(protect, asyncHandler(getPoolStats));

module.exports = router;