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

exports.updatePick = asyncHandler(async (req, res, next) => {
  const pick = await pickService.updatePick(
    req.params.entryId,
    req.params.entryNumber,
    req.params.week,
    req.user.id,
    req.body
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