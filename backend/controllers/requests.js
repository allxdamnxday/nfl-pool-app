/**
 * @module RequestController
 * @description Handles operations related to entry requests for pools, including creation, payment confirmation, approval, rejection, and retrieval of requests.
 */

const RequestService = require('../services/requestService');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @function createRequest
 * @description Create a new entry request for a pool
 * @route POST /api/v1/requests
 * @access Private
 * 
 * @param {Object} req.body
 * @param {string} req.body.poolId - ID of the pool to join
 * @param {number} req.body.numberOfEntries - Number of entries requested (1-3)
 * 
 * @returns {Object} 201 - Created request
 * @throws {ErrorResponse} 400 - Exceeds maximum entries per pool
 */
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { poolId, numberOfEntries } = req.body;
  
  // Check if user already has 3 requests/entries for this pool
  const existingCount = await RequestService.getUserRequestAndEntryCount(req.user.id, poolId);
  if (existingCount + numberOfEntries > 3) {
    return next(new ErrorResponse('You can have a maximum of 3 entries per pool', 400));
  }

  const request = await RequestService.createRequest(req.user.id, poolId, numberOfEntries);
  res.status(201).json({ success: true, data: request });
});

/**
 * @function confirmPayment
 * @description Confirm payment for an entry request
 * @route PUT /api/v1/requests/:id/confirm-payment
 * @access Private
 * 
 * @param {string} req.params.id - Request ID
 * @param {Object} req.body
 * @param {string} req.body.transactionId - Payment transaction ID
 * @param {string} req.body.paymentType - Type of payment
 * 
 * @returns {Object} 200 - Updated request
 * @throws {ErrorResponse} 404 - Request not found
 */
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { transactionId, paymentType } = req.body;

  const request = await RequestService.confirmPayment(id, req.user.id, transactionId, paymentType);
  res.status(200).json({ success: true, data: request });
});

/**
 * @function approveRequest
 * @description Approve an entry request
 * @route PUT /api/v1/requests/:id/approve
 * @access Private (Admin only)
 * 
 * @param {string} req.params.id - Request ID
 * 
 * @returns {Object} 200 - Approved request and created entries
 * @throws {ErrorResponse} 404 - Request not found
 */
exports.approveRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { request, entries } = await RequestService.approveRequest(id);
  res.status(200).json({ success: true, data: { request, entries } });
});

/**
 * @function rejectRequest
 * @description Reject an entry request
 * @route PUT /api/v1/requests/:id/reject
 * @access Private (Admin only)
 * 
 * @param {string} req.params.id - Request ID
 * 
 * @returns {Object} 200 - Rejected request
 * @throws {ErrorResponse} 404 - Request not found
 */
exports.rejectRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const request = await RequestService.rejectRequest(id);
  res.status(200).json({ success: true, data: request });
});

/**
 * @function getRequests
 * @description Get all requests (Admin only)
 * @route GET /api/v1/requests
 * @access Private (Admin only)
 * 
 * @returns {Object} 200 - Array of all requests with count
 */
exports.getRequests = asyncHandler(async (req, res, next) => {
  const requests = await RequestService.getAllRequests();
  res.status(200).json({ 
    success: true, 
    count: requests.length, 
    data: requests 
  });
});

/**
 * @function getPoolRequests
 * @description Get all requests for a specific pool
 * @route GET /api/v1/pools/:poolId/requests
 * @access Private (Admin only)
 * 
 * @param {string} req.params.poolId - Pool ID
 * 
 * @returns {Object} 200 - Array of requests for the specified pool
 */
exports.getPoolRequests = asyncHandler(async (req, res, next) => {
  const { poolId } = req.params;
  const requests = await RequestService.getPoolRequests(poolId);
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

/**
 * @function getUserRequests
 * @description Get all requests for the current user
 * @route GET /api/v1/requests/me
 * @access Private
 * 
 * @returns {Object} 200 - Array of requests for the current user
 */
exports.getUserRequests = asyncHandler(async (req, res, next) => {
  const requests = await RequestService.getUserRequests(req.user.id);
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

exports.getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware:
 * - asyncHandler: Wraps async functions to handle errors
 * 
 * Error Handling:
 * - Uses ErrorResponse utility for consistent error formatting
 * - Specific error handling for various scenarios (e.g., request not found, exceeding entry limit)
 * 
 * Additional Notes:
 * - Some routes are restricted to admin access only
 * - The createRequest function checks for the maximum number of entries per user per pool
 * - The confirmPayment function should be called after successful payment processing
 * - Approval of a request automatically creates the corresponding entries
 * 
 * @example
 * // Create a new request
 * POST /api/v1/requests
 * {
 *   "poolId": "60d5ecb74d6bb830b8e70bfe",
 *   "numberOfEntries": 2
 * }
 * 
 * // Confirm payment for a request
 * PUT /api/v1/requests/60d5ecb74d6bb830b8e70bfe/confirm-payment
 * {
 *   "transactionId": "txn_1234567890",
 *   "paymentType": "credit_card"
 * }
 */