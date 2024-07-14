const Game = require('../models/Game'); // Adjust the path to your Game model

const checkGameStart = async (req, res, next) => {
  const { gameId } = req.body; // Assuming gameId is sent in the request body

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const currentTime = new Date();
    if (currentTime >= new Date(game.startTime)) {
      return res.status(400).json({ message: 'Cannot make a pick after the game has started' });
    }

    next();
  } catch (error) {
    console.error('Error checking game start time:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = checkGameStart;