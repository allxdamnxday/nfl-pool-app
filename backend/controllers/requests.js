// controllers/requests.js
const RequestService = require('../services/requestService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.createRequest = asyncHandler(async (req, res, next) => {
  const { poolId, numberOfEntries } = req.body;
  
  // Check existing requests and entries
  const existingCount = await RequestService.getUserRequestAndEntryCount(req.user.id, poolId);
  if (existingCount + numberOfEntries > 3) {
    return next(new ErrorResponse('You can have a maximum of 3 entries per pool', 400));
  }

  const request = await RequestService.createRequest(req.user.id, poolId, numberOfEntries);
  res.status(201).json({ success: true, data: request });
});

exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const paymentDetails = req.body;
  const request = await RequestService.confirmPayment(id, req.user.id, paymentDetails);
  res.status(200).json({ success: true, data: request });
});

exports.approveRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { request, entries } = await RequestService.approveRequest(id);
  res.status(200).json({ success: true, data: { request, entries } });
});

exports.rejectRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const request = await RequestService.rejectRequest(id);
  res.status(200).json({ success: true, data: request });
});

exports.getRequests = asyncHandler(async (req, res, next) => {
  const requests = await RequestService.getAllRequests();
  res.status(200).json({ success: true, data: requests });
});

exports.getPoolRequests = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const requests = await RequestService.getPoolRequests(poolId);
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

exports.getUserRequests = asyncHandler(async (req, res, next) => {
  const requests = await RequestService.getUserRequests(req.user.id);
  res.status(200).json({ success: true, count: requests.length, data: requests });
});