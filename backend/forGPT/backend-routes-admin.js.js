// backend/routes/admin.js
const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAppStats,
  syncRundownData
} = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(asyncHandler(getUsers));

router.route('/users/:id')
  .get(asyncHandler(getUser))
  .put(asyncHandler(updateUser))
  .delete(asyncHandler(deleteUser));

router.get('/stats', asyncHandler(getAppStats));
router.post('/sync-rundown', asyncHandler(syncRundownData));

module.exports = router;