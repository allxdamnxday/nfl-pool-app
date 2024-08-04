const mongoose = require('mongoose');
const Request = require('../models/Request');
const Pool = require('../models/Pool');
const Entry = require('../models/Entry');
const ErrorResponse = require('../utils/errorResponse');

class RequestService {
  async createRequest(userId, poolId, numberOfEntries) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }

    const existingCount = await this.getUserRequestAndEntryCount(userId, poolId);
    if (existingCount + numberOfEntries > 3) {
      throw new ErrorResponse('You can have a maximum of 3 entries per pool', 400);
    }

    const request = await Request.create({
      user: userId,
      pool: poolId,
      numberOfEntries,
      status: 'pending'
    });

    return request;
  }

  async confirmPayment(requestId, userId, paymentDetails) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }

    if (request.user.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to confirm payment for this request`, 403);
    }

    if (request.status !== 'pending') {
      throw new ErrorResponse(`Request ${requestId} is not in a pending state`, 400);
    }

    request.status = 'payment_pending';
    request.paymentMethod = paymentDetails.paymentMethod;
    request.paymentConfirmation = paymentDetails.transactionId;

    await request.save();

    return request;
  }

  async approveRequest(requestId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }

    if (request.status !== 'payment_pending') {
      throw new ErrorResponse(`Request ${requestId} is not ready for approval`, 400);
    }

    request.status = 'approved';
    await request.save();

    const entries = [];
    for (let i = 0; i < request.numberOfEntries; i++) {
      entries.push(await Entry.create({
        user: request.user,
        pool: request.pool,
        entryNumber: i + 1
      }));
    }

    return { request, entries };
  }

  async rejectRequest(requestId) {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }

    request.status = 'rejected';
    await request.save();

    return request;
  }

  async getUserRequestAndEntryCount(userId, poolId) {
    const requestCount = await Request.countDocuments({ user: userId, pool: poolId });
    const entryCount = await Entry.countDocuments({ user: userId, pool: poolId });
    return requestCount + entryCount;
  }

  async getAllRequests() {
    return await Request.find().populate('user', 'username').populate('pool', 'name');
  }

  async getPoolRequests(poolId) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }
    return await Request.find({ pool: poolId }).populate('user', 'username');
  }

  async getUserRequests(userId) {
    return await Request.find({ user: userId }).populate('pool', 'name');
  }
}

module.exports = new RequestService();