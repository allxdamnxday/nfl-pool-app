// backend/routes/games.js

const express = require('express');
const gameControllers = require('../controllers/games');
const { protect } = require('../middleware/auth');

console.log('Imported game controllers:', Object.keys(gameControllers));

const router = express.Router();

router.route('/current-week').get(protect, gameControllers.getCurrentWeekGames);
router.route('/week').get(protect, gameControllers.getGamesForWeek);
router.route('/:id/status').put(protect, gameControllers.updateGameStatus);
router.route('/update-data').put(protect, gameControllers.updateGameData);
router.route('/initialize-season').post(protect, gameControllers.initializeSeasonData);

module.exports = router;