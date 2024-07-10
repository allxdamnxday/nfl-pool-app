// backend/routes/games.js
const express = require('express');
const {
  getGames,
  getGame,
  fetchGames,
  getGamesByTeam,
  filterGames,
  updateGameStatus,
  getWeekGames
} = require('../controllers/games');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getGames);
router.route('/fetch').post(protect, fetchGames);
router.route('/filter').get(protect, filterGames);
router.route('/team/:teamId').get(protect, getGamesByTeam);
router.route('/week/:seasonYear/:weekNumber').get(protect, getWeekGames);
router.route('/:id').get(protect, getGame);
router.route('/:id/status').put(protect, updateGameStatus);

module.exports = router;