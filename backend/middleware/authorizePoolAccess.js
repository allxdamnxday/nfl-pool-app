// /middleware/authorizePoolAccess.js

const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware to authorize access to pool statistics.
 * Ensures that the user is either an admin or has an entry in the specified pool.
 * @function authorizePoolAccess
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ErrorResponse} If user is not authorized to access the pool's stats
 */
const authorizePoolAccess = asyncHandler(async (req, res, next) => {
  const poolId = req.params.poolId;

  if (!mongoose.Types.ObjectId.isValid(poolId)) {
    return next(new ErrorResponse('Invalid pool ID', 400));
  }

  const pool = await Pool.findById(poolId);
  if (!pool) {
    return next(new ErrorResponse('Pool not found', 404));
  }

  // If user is admin, grant access
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if the user has at least one active entry in the pool
  const entry = await Entry.findOne({
    pool: poolId,
    user: req.user.id,
    status: 'active'
  });

  if (!entry) {
    return next(new ErrorResponse('Forbidden: You do not have access to this pool\'s statistics.', 403));
  }

  next();
});

module.exports = authorizePoolAccess;
