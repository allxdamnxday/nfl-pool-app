const Pool = require('../models/Pool');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new pool
// @route   POST /api/v1/pools
// @access  Private
exports.createPool = asyncHandler(async (req, res, next) => {
  req.body.creator = req.user.id;

  const pool = await Pool.create(req.body);

  res.status(201).json({
    success: true,
    data: pool
  });
});

// @desc    Get all pools
// @route   GET /api/v1/pools
// @access  Public
exports.getPools = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single pool
// @route   GET /api/v1/pools/:id
// @access  Public
exports.getPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id).populate({
    path: 'participants',
    select: 'username email'
  });

  if (!pool) {
    return next(new ErrorResponse(`Pool not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Update pool
// @route   PUT /api/v1/pools/:id
// @access  Private
exports.updatePool = asyncHandler(async (req, res, next) => {
  let pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }

  // Make sure user is pool owner
  if (pool.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this pool`, 403));
  }

  pool = await Pool.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Delete pool
// @route   DELETE /api/v1/pools/:id
// @access  Private
exports.deletePool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }

  // Make sure user is pool owner
  if (pool.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this pool`, 403));
  }

  await pool.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join a pool
// @route   POST /api/v1/pools/:id/join
// @access  Private
exports.joinPool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }

  // Check if the user is already in the pool
  if (pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is already in this pool`, 400));
  }

  pool.participants.push(req.user.id);
  await pool.save();

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Leave a pool
// @route   POST /api/v1/pools/:id/leave
// @access  Private
exports.leavePool = asyncHandler(async (req, res, next) => {
  const pool = await Pool.findById(req.params.id);

  if (!pool) {
    return next(new ErrorResponse(`No pool with the id of ${req.params.id}`, 404));
  }

  // Check if the user is in the pool
  if (!pool.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is not in this pool`, 400));
  }

  // Remove user from participants array
  pool.participants = pool.participants.filter(participant => participant.toString() !== req.user.id);
  await pool.save();

  res.status(200).json({
    success: true,
    data: pool
  });
});

// @desc    Get user's active pools
// @route   GET /api/v1/pools/user/:userId/active
// @access  Private
exports.getUserActivePools = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  // Ensure the requesting user is fetching their own pools or is an admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this route`, 403));
  }

  console.log(`Fetching active pools for user: ${userId}`);

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
                  { $eq: ['$isActive', true] } // Ensure the entry is active
                ]
              }
            }
          }
        ],
        as: 'userEntry'
      }
    },
    {
      $addFields: {
        userStatus: {
          $cond: {
            if: { $gt: [{ $size: '$userEntry' }, 0] },
            then: 'active',
            else: 'inactive'
          }
        }
      }
    },
    {
      $match: {
        userStatus: 'active'
      }
    }
  ]);

  console.log(`Active pools found: ${userPools.length}`, userPools);

  res.status(200).json({
    success: true,
    count: userPools.length,
    data: userPools
  });
});

// @desc    Get user's active pools
// @route   GET /api/v1/pools/user/:userId/active
// @access  Private
exports.getUserPools = asyncHandler(async (req, res, next) => {
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
                  { $eq: ['$user', mongoose.Types.ObjectId(userId)] }
                ]
              }
            }
          }
        ],
        as: 'userEntry'
      }
    },
    {
      $addFields: {
        userStatus: {
          $cond: {
            if: { $gt: [{ $size: '$userEntry' }, 0] },
            then: 'active',
            else: 'inactive'
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: userPools.length,
    data: userPools
  });
});