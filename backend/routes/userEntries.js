// routes/userEntries.js
const express = require('express');
const { getUserEntriesWithPicks } = require('../controllers/entries');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/with-picks', protect, getUserEntriesWithPicks);

module.exports = router;