// controllers/requests.js
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create request to join pool
// @route   POST /api/v1/requests
// @access  Private
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { poolId, numberOfEntries } = req.body;
  console.log(`Creating request for pool ${poolId} with ${numberOfEntries} entries`);

  if (numberOfEntries < 1 || numberOfEntries > 3) {
    return next(new ErrorResponse('Number of entries must be between 1 and 3', 400));
  }

  // Check existing requests and entries
  const existingRequests = await Request.find({ pool: poolId, user: req.user.id });
  const existingEntries = await Entry.find({ pool: poolId, user: req.user.id });

  console.log('Existing requests:', existingRequests);
  console.log('Existing entries:', existingEntries);

  const totalExisting = existingRequests.length + existingEntries.length;
  const totalRequested = totalExisting + numberOfEntries;

  if (totalRequested > 3) {
    return next(new ErrorResponse(`You can only have a maximum of 3 entries. You already have ${totalExisting} entries or pending requests.`, 400));
  }

  const request = await Request.create({
    pool: poolId,
    user: req.user.id,
    numberOfEntries,
    status: 'pending'
  });

  console.log('Created request:', request);

  res.status(201).json({
    success: true,
    data: {
      ...request._doc,
      numberOfEntries
    }
  });
});

// @desc    Approve request to join pool
// @route   PUT /api/v1/requests/:id/approve
// @access  Private/Admin
exports.approveRequest = asyncHandler(async (req, res, next) => {
  console.log('approveRequest called with id:', req.params.id);

  const request = await Request.findById(req.params.id);
  if (!request) {
    return next(new ErrorResponse(`No request found with id of ${req.params.id}`, 404));
  }

  console.log('Request found:', request);

  request.status = 'approved';
  await request.save();

  // Update pool status to active if not already
  const pool = await Pool.findById(request.pool);
  if (!pool) {
    return next(new ErrorResponse(`No pool found with id of ${request.pool}`, 404));
  }

  if (pool.status !== 'active') {
    pool.status = 'active';
  }

  // Add user to participants array if not already present
  if (!pool.participants.includes(request.user)) {
    pool.participants.push(request.user);
  }

  await pool.save();

  console.log('Pool status updated to active and user added to participants:', pool);

  // Create Entries for the user
  const entries = [];
  for (let i = 0; i < request.numberOfEntries; i++) {
    try {
      console.log(`Creating entry ${i + 1} for user ${request.user} in pool ${request.pool}`);
      const entry = await Entry.create({
        user: request.user,
        pool: request.pool,
        isActive: true
      });
      entries.push(entry);
      console.log(`Entry ${i + 1} created:`, entry);
    } catch (error) {
      console.error(`Failed to create entry ${i + 1}:`, error);
    }
  }

  console.log('Entries created:', entries);

  res.status(200).json({
    success: true,
    data: { request, entries }
  });
});

// @desc    Get all requests
// @route   GET /api/v1/requests
// @access  Private/Admin
exports.getRequests = asyncHandler(async (req, res, next) => {
  console.log('Getting all requests');
  const pendingRequests = await Request.find({ status: { $ne: 'approved' } }).populate('user', 'username').populate('pool', 'name');
  const approvedRequests = await Request.find({ status: 'approved' }).populate('user', 'username').populate('pool', 'name');
  console.log('Retrieved pending requests:', pendingRequests);
  console.log('Retrieved approved requests:', approvedRequests);

  res.status(200).json({
    success: true,
    data: {
      pending: pendingRequests,
      approved: approvedRequests
    }
  });
});

// @desc    Get requests for a specific pool
// @route   GET /api/v1/requests/:poolId
// @access  Private/Admin
exports.getPoolRequests = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const requests = await Request.find({ pool: poolId }).populate('user', 'username');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Get user's own requests
// @route   GET /api/v1/requests/user
// @access  Private
exports.getUserRequests = asyncHandler(async (req, res, next) => {
  const requests = await Request.find({ user: req.user.id }).populate('pool', 'name');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});