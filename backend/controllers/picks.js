const asyncHandler = require('../middleware/async');
const pickService = require('../services/pickService');

exports.getPicksForPool = asyncHandler(async (req, res, next) => {
  const picks = await pickService.getPicksForPool(req.params.poolId);
  res.status(200).json({
    success: true,
    count: picks.length,
    data: picks
  });
});

exports.getPickForWeek = asyncHandler(async (req, res, next) => {
  const { entryId, entryNumber, week } = req.params;
  const pick = await pickService.getPickForWeek(entryId, entryNumber, week);
  
  res.status(200).json({
    success: true,
    data: pick,
    message: pick ? 'Pick found' : 'No pick made for this week yet'
  });
});

exports.addOrUpdatePick = asyncHandler(async (req, res, next) => {
  const pick = await pickService.addOrUpdatePick(
    req.params.entryId,
    parseInt(req.params.entryNumber),
    req.user.id,
    req.body.team,
    parseInt(req.params.week),
    req.game // This is the game object added by the checkGameStart middleware
  );
  res.status(200).json({
    success: true,
    data: pick
  });
});

exports.deletePick = asyncHandler(async (req, res, next) => {
  await pickService.deletePick(req.params.entryId, req.params.entryNumber, req.params.week, req.user.id);
  res.status(200).json({
    success: true,
    data: {}
  });
});