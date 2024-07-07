// backend/controllers/games.js
const Game = require('../models/Game');

// @desc    Get all games
// @route   GET /api/v1/games
// @access  Private
exports.getGames = async (req, res, next) => {
  try {
    const games = await Game.find().sort({ date_event: 1 });

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single game
// @route   GET /api/v1/games/:id
// @access  Private
exports.getGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: `Game not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (err) {
    next(err);
  }
};