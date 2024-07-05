// backend/routes/pools.js
const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
  joinPool
} = require('../controllers/pools');

const Pool = require('../models/Pool');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Pool, 'participants'), getPools)
  .post(protect, authorize('user', 'admin'), createPool);

router
  .route('/:id')
  .get(getPool)
  .put(protect, authorize('user', 'admin'), updatePool)
  .delete(protect, authorize('user', 'admin'), deletePool);

router.route('/:id/join').post(protect, joinPool);

module.exports = router;