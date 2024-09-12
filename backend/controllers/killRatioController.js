const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const killRatioService = require('../services/killRatioService');

exports.calculateWeeklyKillRatio = asyncHandler(async (req, res) => {
  const { poolId, week } = req.params;
  const killRatio = await killRatioService.calculateWeeklyKillRatio(poolId, parseInt(week));
  res.status(200).json({
    status: 'success',
    data: { killRatio }
  });
});

exports.getKillRatioSheet = asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const killRatioSheet = await killRatioService.getKillRatioSheet(poolId);
  res.status(200).json({
    status: 'success',
    data: { killRatioSheet }
  });
});

exports.getWeeklyKillRatio = asyncHandler(async (req, res) => {
  const { poolId, week } = req.params;
  const { includeFullTeamNames } = req.query;
  const killRatio = await killRatioService.getWeeklyKillRatio(poolId, parseInt(week), includeFullTeamNames === 'true');
  res.status(200).json({
    status: 'success',
    data: { killRatio }
  });
});

exports.updateKillRatioForPick = asyncHandler(async (req, res) => {
  const { pickId } = req.params;
  const updatedKillRatio = await killRatioService.updateKillRatioForPick(pickId);
  res.status(200).json({
    status: 'success',
    data: { killRatio: updatedKillRatio }
  });
});