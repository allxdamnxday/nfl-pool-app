// backend/controllers/pools.js

const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const poolService = require('../services/poolService');

exports.getPools = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getPool = asyncHandler(async (req, res, next) => {
  const pool = await poolService.getById(req.params.id);
  res.status(200).json({ success: true, data: pool });
});

exports.createPool = asyncHandler(async (req, res, next) => {
  const pool = await poolService.createPool(req.user.id, req.body);
  res.status(201).json({ success: true, data: pool });
});

exports.updatePool = asyncHandler(async (req, res, next) => {
  const pool = await poolService.updatePool(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, data: pool });
});

exports.deletePool = asyncHandler(async (req, res, next) => {
  await poolService.deletePool(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: {} });
});

exports.getPoolStats = asyncHandler(async (req, res, next) => {
  const stats = await poolService.getPoolStats(req.params.id);
  res.status(200).json({ success: true, data: stats });
});

exports.getAvailablePools = asyncHandler(async (req, res, next) => {
  const pools = await poolService.getAvailablePools(req.user.id);
  res.status(200).json({ success: true, count: pools.length, data: pools });
});

exports.updatePoolStatus = asyncHandler(async (req, res, next) => {
  const pool = await poolService.updatePoolStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: pool });
});

exports.getUserActivePools = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this route`, 403));
  }
  const userPools = await Pool.aggregate([
    {
      $lookup: {
        from: 'entries',
        let: { poolId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$pool', '$$poolId'] },
                  { $eq: ['$user', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isActive', true] }
                ]
              }
            }
          }
        ],
        as: 'userEntry'
      }
    },
    {
      $match: {
        $expr: { $gt: [{ $size: '$userEntry' }, 0] }
      }
    }
  ]);
  res.status(200).json({ success: true, count: userPools.length, data: userPools });
});

exports.getUserPools = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  console.log('Fetching pools for user:', userId);

  const userPools = await Pool.find({ participants: userId });
  
  // Calculate active entries for each pool
  const poolsWithEntries = await Promise.all(userPools.map(async (pool) => {
    const activeEntries = await Entry.countDocuments({ 
      pool: pool._id, 
      user: userId,
      isActive: true
    });
    return {
      ...pool.toObject(),
      activeEntries
    };
  }));

  res.status(200).json({ 
    success: true, 
    count: poolsWithEntries.length, 
    data: poolsWithEntries 
  });
});

exports.getUserPoolsWithEntries = asyncHandler(async (req, res, next) => {
  const pools = await Pool.find({ participants: req.user.id });
  const entries = await Entry.find({ user: req.user.id, isActive: true });
  
  const poolsWithEntries = pools.map(pool => ({
    ...pool.toObject(),
    activeEntries: entries.filter(entry => entry.pool.toString() === pool._id.toString()).length,
    userEntryId: entries.find(entry => entry.pool.toString() === pool._id.toString())?._id
  }));

  res.status(200).json({
    success: true,
    data: poolsWithEntries
  });
});

exports.getPoolEntries = asyncHandler(async (req, res, next) => {
  const entries = await Entry.find({ pool: req.params.id });
  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries
  });
});