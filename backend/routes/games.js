// backend/routes/games.js

const express = require('express');
const {
  getCurrentWeekGames,
  getGamesForWeek,
  updateGameStatus,
  updateGameData,
  initializeSeasonData
} = require('../controllers/games');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/current-week').get(protect, getCurrentWeekGames);
router.route('/week').get(protect, getGamesForWeek);
router.route('/:id/status').put(protect, updateGameStatus);
router.route('/update-data').put(protect, updateGameData);
router.route('/initialize-season').post(protect, initializeSeasonData);

module.exports = router;