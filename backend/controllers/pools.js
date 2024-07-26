// backend/controllers/pools.js

const Pool = require('../models/Pool');
const Entry = require('../models/Entry');
const Request = require('../models/Request');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.getPools = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id).populate('participants', 'username email');
  if (!pool) {
    return next(new ErrorResponse(`Pool not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: pool });
});

exports.createPool = asyncHandler(async (req, res, next) => {
  req.body.creator = req.user.id;
  const pool = await Pool.create(req.body);
  res.status(201).json({ success: true, data: pool });
});

exports.updatePool = asyncHandler(async (req, res, next) => {
  let pool = await Pool.findById(req.params.id);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }
  if (pool.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this pool`, 403));
  }
  pool = await Pool.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: pool });
});

exports.deletePool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }
  if (pool.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this pool`, 403));
  }
  await pool.remove();
  res.status(200).json({ success: true, data: {} });
});

exports.joinPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }
  if (pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is already in this pool`, 400));
  }
  pool.participants.push(req.user.id);
  await pool.save();
  res.status(200).json({ success: true, data: pool });
});

exports.leavePool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }
  if (!pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is not in this pool`, 400));
  }
  pool.participants = pool.participants.filter(participant => participant.toString() !== req.user.id);
  await pool.save();
  res.status(200).json({ success: true, data: pool });
});

exports.getPoolStats = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);
  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }
  const stats = {
    totalParticipants: pool.participants.length,
    eliminatedParticipants: pool.eliminatedUsers.length,
    currentWeek: pool.currentWeek
  };
  res.status(200).json({ success: true, data: stats });
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

exports.getAvailablePools = asyncHandler(async (req, res, next) => {
  // Find all open pools
  const openPools = await Pool.find({ status: 'open' });

  // For each pool, check the user's entries and requests
  const availablePools = await Promise.all(openPools.map(async (pool) => {
    // Count active entries
    const activeEntries = await Entry.countDocuments({ 
      pool: pool._id, 
      user: req.user.id,
      isActive: true
    });

    // Count pending requests
    const pendingRequests = await Request.countDocuments({ 
      pool: pool._id, 
      user: req.user.id, 
      status: 'pending'
    });

    // Count approved but not yet active entries
    const approvedEntries = await Entry.countDocuments({ 
      pool: pool._id, 
      user: req.user.id,
      isActive: false
    });

    const totalEntries = activeEntries + pendingRequests + approvedEntries;

    return {
      ...pool.toObject(),
      userEntries: totalEntries,
      canJoin: totalEntries < 3,
      activeEntries,
      pendingRequests,
      approvedEntries
    };
  }));

  // Include all pools, but mark which ones the user can join
  res.status(200).json({
    success: true,
    count: availablePools.length,
    data: availablePools
  });
});

// Update the status of a pool Admin Route
exports.updatePoolStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['open', 'active', 'completed'].includes(status)) {
    return next(new ErrorResponse('Invalid status. Must be open, active, or completed.', 400));
  }

  const pool = await Pool.findById(id);

  if (!pool) {
    return next(new ErrorResponse(`No pool found with id of ${id}`, 404));
  }

  pool.status = status;
  await pool.save();

  res.status(200).json({
    success: true,
    data: pool
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