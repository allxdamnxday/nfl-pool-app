const Pool = require('../models/Pool');
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
  const userId = req.params.userId;
  console.log('Requested userId:', userId);
  console.log('Authenticated user:', req.user);
  
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(req.user.id)) {
    return next(new ErrorResponse(`Invalid user ID`, 400));
  }
  
  if (req.user.id.toString() !== userId) {
    return next(new ErrorResponse(`Not authorized to access this route`, 403));
  }
  
  const userPools = await Pool.find({ participants: userId });
  res.status(200).json({ success: true, count: userPools.length, data: userPools });
});

exports.getAvailablePools = asyncHandler(async (req, res, next) => {
  const availablePools = await Pool.find({
    status: 'active',
    participants: { $ne: req.user.id },
    $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] }
  });
  res.status(200).json({ success: true, count: availablePools.length, data: availablePools });
});