// backend/routes/games.js
const express = require('express');
const {
  getGames,
  getGame,
  getGameMarkets
} = require('../controllers/games');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getGames);

router.route('/:id')
  .get(protect, getGame);

router.route('/:id/markets')
  .get(protect, getGameMarkets);

module.exports = router;
