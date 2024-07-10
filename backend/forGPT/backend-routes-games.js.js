// backend/routes/games.js
const express = require('express');
const { getGames, getGame, fetchGames } = require('../controllers/games');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

const router = express.Router();

router.route('/').get(protect, asyncHandler(getGames));
router.route('/:id').get(protect, asyncHandler(getGame));
router.route('/fetch').post(protect, asyncHandler(fetchGames));

module.exports = router;