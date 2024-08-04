const asyncHandler = require('../middleware/async');
const gameService = require('../services/gameService');

exports.getCurrentWeekGames = asyncHandler(async (req, res, next) => {
  const games = await gameService.getCurrentWeekGames();
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

exports.getGamesForWeek = asyncHandler(async (req, res, next) => {
  const games = await gameService.getGamesForWeek(req.params.seasonYear, req.params.week);
  res.status(200).json({
    success: true,
    count: games.length,
    data: games
  });
});

exports.updateGameStatus = asyncHandler(async (req, res, next) => {
  const game = await gameService.updateGameStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: game });
});

exports.updateGameData = asyncHandler(async (req, res, next) => {
  await gameService.updateGameData(req.body.date);
  res.status(200).json({ success: true, message: 'Game data updated successfully' });
});

exports.initializeSeasonData = asyncHandler(async (req, res, next) => {
  await gameService.initializeSeasonData(req.body.year);
  res.status(200).json({ success: true, message: 'Season data initialized successfully' });
});