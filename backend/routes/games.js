// backend/routes/games.js

const express = require('express');
const gameControllers = require('../controllers/games');
const { getGamesForWeek } = require('../controllers/games');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const Game = require('../models/Game');

const router = express.Router();

console.log('Imported game controllers:', Object.keys(gameControllers));

router.route('/current-week').get(protect, gameControllers.getCurrentWeekGames);
router.get('/week/:seasonYear/:week', protect, getGamesForWeek);
router.route('/:id/status').put(protect, gameControllers.updateGameStatus);
router.route('/update-data').put(protect, gameControllers.updateGameData);
router.route('/initialize-season').post(protect, gameControllers.initializeSeasonData);

module.exports = router;