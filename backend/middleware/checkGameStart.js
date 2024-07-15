// middleware/checkGameStart.js
const Game = require('../models/Game');
const ErrorResponse = require('../utils/errorResponse');

const checkGameStart = async (req, res, next) => {
  const { gameId } = req.body;

  // If no gameId is provided, skip the check
  if (!gameId) {
    return next();
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return next(new ErrorResponse('Game not found', 404));
    }

    const currentTime = new Date();
    const gameStartTime = new Date(game.event_date);
    if (currentTime >= gameStartTime) {
      return next(new ErrorResponse('Cannot make a pick after the game has started', 400));
    }

    next();
  } catch (error) {
    console.error('Error checking game start time:', error);
    return next(new ErrorResponse('Server error', 500));
  }
};

module.exports = checkGameStart;