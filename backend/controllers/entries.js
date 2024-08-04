// controllers/entries.js
const EntryService = require('../services/entryService');
const asyncHandler = require('../middleware/async');

exports.getUserEntries = asyncHandler(async (req, res, next) => {
  const entries = await EntryService.getUserEntries(req.user.id);
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.getEntry = asyncHandler(async (req, res, next) => {
  const entry = await EntryService.getEntry(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: entry });
});

exports.getEntriesForPool = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const entries = await EntryService.getEntriesForPool(poolId);
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.addOrUpdatePick = asyncHandler(async (req, res, next) => {
  const { entryId, entryNumber } = req.params;
  const { team, week } = req.body;
  const pick = await EntryService.addOrUpdatePick(entryId, entryNumber, req.user.id, team, week);
  res.status(200).json({ success: true, data: pick });
});

exports.getPickForWeek = asyncHandler(async (req, res, next) => {
  const { entryId, entryNumber, week } = req.params;
  const pick = await EntryService.getPickForWeek(entryId, entryNumber, week);
  res.status(200).json({ success: true, data: pick });
});

exports.getUserEntriesWithPicks = asyncHandler(async (req, res, next) => {
  const { populate } = req.query;
  const entries = await EntryService.getUserEntriesWithPicks(req.user.id, populate);
  res.status(200).json({ success: true, count: entries.length, data: entries });
});