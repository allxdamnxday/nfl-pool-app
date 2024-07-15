// controllers/requests.js
const Request = require('../models/Request');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create request to join pool
// @route   POST /api/v1/requests
// @access  Private
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { poolId } = req.body;

  const request = await Request.create({
    pool: poolId,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    data: request
  });
});

// @desc    Approve request to join pool
// @route   PUT /api/v1/requests/:id/approve
// @access  Private/Admin
exports.approveRequest = asyncHandler(async (req, res, next) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse(`No request found with id of ${req.params.id}`, 404));
  }

  request.status = 'approved';
  await request.save();

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Get all requests
// @route   GET /api/v1/requests
// @access  Private/Admin
exports.getRequests = asyncHandler(async (req, res, next) => {
  const requests = await Request.find().populate('user', 'username').populate('pool', 'name');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});
