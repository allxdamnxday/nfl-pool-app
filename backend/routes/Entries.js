// routes/entries.js
const express = require('express');
const {
  getUserEntries,
  getEntry,
  createEntry,
  getEntriesForPool,
  updateEntry,
  deleteEntry
} = require('../controllers/entries');
const { protect, authorize } = require('../middleware/auth');
const checkGameStart = require('../middleware/checkGameStart');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getEntriesForPool)
  .post(protect, checkGameStart, createEntry);

router.route('/:id')
  .get(protect, getEntry)
  .put(protect, checkGameStart, updateEntry)
  .delete(protect, deleteEntry);

router.route('/user')
  .get(protect, getUserEntries);

module.exports = router;