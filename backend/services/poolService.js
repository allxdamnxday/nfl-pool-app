/**
 * @module PoolService
 * @description Service for managing pools in the NFL pool application
 */
const mongoose = require('mongoose');
const Pool = require('../models/Pool');
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const BaseService = require('./baseService');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');
const User = require('../models/User'); // Added this line at the top of the file

/**
 * Service class for managing pools
 * @class PoolService
 * @extends BaseService
 */
class PoolService extends BaseService {
  /**
   * Create a PoolService instance
   */
  constructor() {
    super(Pool);
  }

  /**
   * Get available pools for a user
   * @async
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array<Object>>} Array of available pools with user-specific information
   * @throws {ErrorResponse} If there's an error fetching the pools
   * 
   * @example
   * try {
   *   const availablePools = await poolService.getAvailablePools('user123');
   *   console.log('Available pools:', availablePools);
   * } catch (error) {
   *   console.error('Error fetching available pools:', error.message);
   * }
   */
  async getAvailablePools(userId) {
    logger.info(`Fetching available pools for user ${userId}`);
    try {
      const pools = await Pool.find({ status: 'open' });
      
      return Promise.all(pools.map(async (pool) => {
        const requests = await Request.find({ user: userId, pool: pool._id });
        const entries = await Entry.find({ user: userId, pool: pool._id });
        
        return {
          ...pool.toObject(),
          userRequests: requests.length,
          userEntries: entries.length,
          canJoin: requests.length + entries.length < 3
        };
      }));
    } catch (error) {
      logger.error(`Error fetching available pools for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching available pools: ${error.message}`, 500);
    }
  }

  /**
   * Create a new pool
   * @async
   * @param {string} userId - The ID of the user creating the pool
   * @param {Object} poolData - The data for the new pool
   * @param {string} poolData.name - The name of the pool
   * @param {number} poolData.season - The season year of the pool
   * @param {number} poolData.maxParticipants - The maximum number of participants allowed
   * @param {number} poolData.entryFee - The entry fee for the pool
   * @param {number} poolData.prizeAmount - The prize amount for the pool
   * @param {string} poolData.description - The description of the pool
   * @param {Date} poolData.startDate - The start date of the pool
   * @param {Date} poolData.endDate - The end date of the pool
   * @param {number} poolData.maxEntries - The maximum number of entries allowed per user
   * @param {number} poolData.prizePot - The total prize pot for the pool
   * @param {number} poolData.numberOfWeeks - The number of weeks for the pool
   * @returns {Promise<Object>} The created pool object
   * @throws {ErrorResponse} If there's an error creating the pool
   * 
   * @example
   * try {
   *   const newPool = await poolService.createPool('user123', {
   *     name: 'NFL 2023 Survivor Pool',
   *     season: 2023,
   *     maxParticipants: 100,
   *     entryFee: 50,
   *     prizeAmount: 4500,
   *     description: 'Join our exciting NFL 2023 Survivor Pool!',
   *     startDate: new Date('2023-09-07'),
   *     endDate: new Date('2024-01-07'),
   *     maxEntries: 3,
   *     prizePot: 5000,
   *     numberOfWeeks: 17
   *   });
   *   console.log('New pool created:', newPool);
   * } catch (error) {
   *   console.error('Error creating pool:', error.message);
   * }
   */
  async createPool(userId, poolData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ErrorResponse('User not found', 404);
      }

      // Ensure all required fields are present
      const requiredFields = ['name', 'season', 'maxParticipants', 'entryFee', 'prizeAmount', 'description', 'startDate', 'endDate', 'maxEntries', 'prizePot', 'numberOfWeeks'];
      const missingFields = requiredFields.filter(field => !poolData[field]);

      if (missingFields.length > 0) {
        throw new ErrorResponse(`Please add ${missingFields.join(', ')}`, 400);
      }

      // Validate the data
      if (poolData.season < 2020) {
        throw new ErrorResponse('Season year must be 2020 or later', 400);
      }
      if (poolData.maxParticipants < 2 || poolData.maxParticipants > 10000) {
        throw new ErrorResponse('Pool must have between 2 and 10000 participants', 400);
      }
      if (poolData.entryFee < 0) {
        throw new ErrorResponse('Entry fee cannot be negative', 400);
      }
      if (poolData.prizeAmount < 0) {
        throw new ErrorResponse('Prize amount cannot be negative', 400);
      }
      if (poolData.maxEntries < 1 || poolData.maxEntries > 30000) {
        throw new ErrorResponse('Max entries must be between 1 and 30000', 400);
      }
      if (poolData.prizePot < 0) {
        throw new ErrorResponse('Prize pot cannot be negative', 400);
      }
      if (poolData.numberOfWeeks < 1 || poolData.numberOfWeeks > 18) {
        throw new ErrorResponse('Number of weeks must be between 1 and 18', 400);
      }

      // If all validations pass, create the pool
      const pool = await Pool.create({
        ...poolData,
        creator: userId,
        status: 'open',
        currentWeek: 1
      });

      return pool;
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      // If it's a mongoose validation error, throw a more specific error message
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new ErrorResponse(messages.join('. '), 400);
      }
      // For any other errors, log and throw a generic error message
      logger.error(`Error creating pool: ${error.message}`);
      throw new ErrorResponse(`Error creating pool: ${error.message}`, 500);
    }
  }

  /**
   * Update a pool
   * @async
   * @param {string} poolId - The ID of the pool to update
   * @param {string} userId - The ID of the user updating the pool
   * @param {Object} updateData - The data to update the pool with
   * @returns {Promise<Object>} The updated pool object
   * @throws {ErrorResponse} If user is not authorized to update the pool or if there's an error updating
   * 
   * @example
   * try {
   *   const updatedPool = await poolService.updatePool('pool123', 'user123', {
   *     name: 'Updated NFL Pool Name'
   *   });
   *   console.log('Updated pool:', updatedPool);
   * } catch (error) {
   *   console.error('Error updating pool:', error.message);
   * }
   */
  async updatePool(poolId, userId, updateData) {
    logger.info(`Updating pool ${poolId} for user ${userId}`);
    try {
      const pool = await this.getById(poolId);
      
      if (pool.creator.toString() !== userId) {
        throw new ErrorResponse(`User ${userId} is not authorized to update this pool`, 403);
      }
      
      return await this.update(poolId, updateData);
    } catch (error) {
      logger.error(`Error updating pool ${poolId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a pool
   * @async
   * @param {string} poolId - The ID of the pool to delete
   * @param {string} userId - The ID of the user deleting the pool
   * @returns {Promise<Object>} The deleted pool object
   * @throws {ErrorResponse} If user is not authorized to delete the pool or if there's an error deleting
   * 
   * @example
   * try {
   *   const deletedPool = await poolService.deletePool('pool123', 'user123');
   *   console.log('Deleted pool:', deletedPool);
   * } catch (error) {
   *   console.error('Error deleting pool:', error.message);
   * }
   */
  async deletePool(poolId, userId) {
    logger.info(`Deleting pool ${poolId} for user ${userId}`);
    try {
      const pool = await Pool.findById(poolId);

      if (!pool) {
        throw new ErrorResponse(`Pool not found with id of ${poolId}`, 404);
      }

      if (pool.creator.toString() !== userId.toString()) {
        throw new ErrorResponse(`User ${userId} is not authorized to delete this pool`, 403);
      }
      
      await pool.remove();
      return { success: true };
    } catch (error) {
      logger.error(`Error deleting pool ${poolId} for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get statistics for a pool
   * @async
   * @param {string} poolId - The ID of the pool
   * @returns {Promise<Object>} Object containing pool statistics
   * @throws {ErrorResponse} If there's an error fetching pool statistics
   * 
   * @example
   * try {
   *   const poolStats = await poolService.getPoolStats('pool123');
   *   console.log('Pool statistics:', poolStats);
   * } catch (error) {
   *   console.error('Error fetching pool stats:', error.message);
   * }
   */
  async getPoolStats(poolId) {
    logger.info(`Fetching stats for pool ${poolId}`);
    try {
      const pool = await this.getById(poolId);
      const stats = {
        totalParticipants: pool.participants.length,
        eliminatedParticipants: pool.eliminatedUsers.length,
        currentWeek: pool.currentWeek
      };
      return stats;
    } catch (error) {
      logger.error(`Error fetching stats for pool ${poolId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching pool statistics: ${error.message}`, 500);
    }
  }

 /**
   * Update the status of a pool
   * @async
   * @param {string} poolId - The ID of the pool
   * @param {string} status - The new status ('open', 'active', or 'completed')
   * @returns {Promise<Object>} The updated pool object
   * @throws {ErrorResponse} If the status is invalid or if there's an error updating the status
   * 
   * @example
   * try {
   *   const updatedPool = await poolService.updatePoolStatus('pool123', 'active');
   *   console.log('Updated pool status:', updatedPool.status);
   * } catch (error) {
   *   console.error('Error updating pool status:', error.message);
   * }
   */
 async updatePoolStatus(poolId, status) {
  logger.info(`Updating status of pool ${poolId} to ${status}`);
  try {
    if (!['open', 'active', 'completed'].includes(status)) {
      throw new ErrorResponse('Invalid status. Must be open, active, or completed.', 400);
    }
    return await this.update(poolId, { status });
  } catch (error) {
    logger.error(`Error updating status of pool ${poolId}: ${error.message}`);
    throw error;
  }
}

  /**
   * Get all pools for a specific user
   * @async
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array<Object>>} Array of pools with active entry count for the user
   * @throws {ErrorResponse} If there's an error fetching the pools
   */
  async getUserPools(userId) {
    logger.info(`Fetching pools for user ${userId}`);
    try {
      const userPools = await Pool.find({ creator: userId });
      
      return Promise.all(userPools.map(async (pool) => {
        const activeEntries = await Entry.countDocuments({ 
          pool: pool._id, 
          user: userId,
          status: 'active'
        });
        return {
          ...pool.toObject(),
          activeEntries
        };
      }));
    } catch (error) {
      logger.error(`Error fetching pools for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching user pools: ${error.message}`, 500);
    }
  }

  /**
   * Get all pools with entries for a specific user
   * @async
   * @function getUserPoolsWithEntries
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array<PoolWithEntries>>} Array of pools with entries for the user
   * @throws {ErrorResponse} If there's an error fetching the pools with entries
   * 
   * @description This method retrieves all pools that the user has entries in, regardless of the pool's status.
   * It includes detailed information about each pool and the user's entries in that pool.
   * 
   * @example
   * // Example usage
   * const userId = '5f9d7a3b9d3e2a1b8c7d6e5f';
   * const poolsWithEntries = await poolService.getUserPoolsWithEntries(userId);
   * 
   * @swagger
   * components:
   *   schemas:
   *     PoolWithEntries:
   *       type: object
   *       properties:
   *         _id:
   *           type: string
   *           description: The unique identifier of the pool
   *         name:
   *           type: string
   *           description: The name of the pool
   *         season:
   *           type: number
   *           description: The season year of the pool
   *         currentWeek:
   *           type: number
   *           description: The current week of the pool
   *         status:
   *           type: string
   *           enum: [open, active, completed]
   *           description: The current status of the pool
   *         entryFee:
   *           type: number
   *           description: The entry fee for the pool
   *         prizeAmount:
   *           type: number
   *           description: The total prize amount for the pool
   *         activeEntries:
   *           type: number
   *           description: The number of active entries the user has in this pool
   *         entries:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Entry'
   *           description: Array of user's entries in this pool
   *     Entry:
   *       type: object
   *       properties:
   *         _id:
   *           type: string
   *           description: The unique identifier of the entry
   *         status:
   *           type: string
   *           enum: [active, eliminated]
   *           description: The current status of the entry
   *         eliminatedWeek:
   *           type: number
   *           nullable: true
   *           description: The week number when the entry was eliminated (null if still active)
   *         entryNumber:
   *           type: number
   *           description: The entry number for this user in this pool
   */
  async getUserPoolsWithEntries(userId) {
    logger.info(`Fetching pools with entries for user ${userId}`);
    try {
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
            as: 'userEntries'
          }
        },
        {
          $match: {
            $expr: { $gt: [{ $size: '$userEntries' }, 0] }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            season: 1,
            currentWeek: 1,
            status: 1,
            entryFee: 1,
            prizeAmount: 1,
            activeEntries: {
              $size: {
                $filter: {
                  input: '$userEntries',
                  as: 'entry',
                  cond: { $eq: ['$$entry.status', 'active'] }
                }
              }
            },
            entries: '$userEntries'
          }
        }
      ]);
      return userPools;
    } catch (error) {
      logger.error(`Error fetching pools with entries for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching user pools with entries: ${error.message}`, 500);
    }
  }

  /**
   * Get all entries for a specific pool
   * @async
   * @param {string} poolId - The ID of the pool
   * @returns {Promise<Array<Object>>} Array of entries for the pool
   * @throws {ErrorResponse} If there's an error fetching the entries
   */
  async getPoolEntries(poolId) {
    logger.info(`Fetching entries for pool ${poolId}`);
    try {
      const entries = await Entry.find({ pool: poolId });
      return entries;
    } catch (error) {
      logger.error(`Error fetching entries for pool ${poolId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching pool entries: ${error.message}`, 500);
    }
  }
}

module.exports = new PoolService();