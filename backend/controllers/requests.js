// controllers/requests.js
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');

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

// @desc    Confirm payment for a request
// @route   PUT /api/v1/requests/:id/confirm-payment
// @access  Private
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { paymentMethod, paymentAmount, paymentConfirmation } = req.body;

  const request = await Request.findById(id);

  if (!request) {
    return next(new ErrorResponse(`No request found with id of ${id}`, 404));
  }

  if (request.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to confirm payment for this request`, 401));
  }

  request.status = 'payment_pending';
  request.paymentMethod = paymentMethod;
  request.paymentAmount = paymentAmount;
  request.paymentConfirmation = paymentConfirmation;

  await request.save();

  res.status(200).json({
    success: true,
    data: request
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

  if (request.status !== 'payment_pending') {
    return next(new ErrorResponse(`Request ${req.params.id} is not ready for approval`, 400));
  }

  // Find the pool
  const pool = await Pool.findById(request.pool);
  if (!pool) {
    return next(new ErrorResponse(`No pool found with id of ${request.pool}`, 404));
  }

  // Check if there's enough space in the pool
  const currentEntries = await Entry.countDocuments({ pool: pool._id });
  if (currentEntries + request.numberOfEntries > pool.maxParticipants) {
    return next(new ErrorResponse(`Not enough space in the pool for ${request.numberOfEntries} new entries`, 400));
  }

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update request status
    request.status = 'approved';
    await request.save({ session });

    // Add user to participants array if not already present
    if (!pool.participants.includes(request.user)) {
      pool.participants.push(request.user);
      await pool.save({ session });
    }

    // Create Entries for the user
    const entries = [];
    for (let i = 0; i < request.numberOfEntries; i++) {
      console.log(`Creating entry ${i + 1} for user ${request.user} in pool ${request.pool}`);
      const entry = await Entry.create([{
        user: request.user,
        pool: request.pool,
        isActive: true
      }], { session });
      entries.push(entry[0]);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    console.log('Entries created:', entries);

    res.status(200).json({
      success: true,
      data: { request, entries }
    });
  } catch (error) {
    // If an error occurred, abort the transaction and roll back any changes
    await session.abortTransaction();
    session.endSession();
    console.error('Error in approveRequest:', error);
    return next(new ErrorResponse('Failed to approve request', 500));
  }
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