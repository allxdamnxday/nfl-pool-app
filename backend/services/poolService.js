/**
 * @module PoolService
 * @description Service for managing pools in the NFL pool application
 */

const Pool = require('../models/Pool');
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const BaseService = require('./baseService');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

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
   * @param {number} poolData.entryFee - The entry fee for the pool
   * @param {number} poolData.numberOfWeeks - The number of weeks the pool will run (1-18)
   * @returns {Promise<Object>} The created pool object
   * @throws {ErrorResponse} If there's an error creating the pool
   * 
   * @example
   * try {
   *   const newPool = await poolService.createPool('user123', {
   *     name: 'My NFL Pool',
   *     entryFee: 50,
   *     numberOfWeeks: 17
   *   });
   *   console.log('New pool created:', newPool);
   * } catch (error) {
   *   console.error('Error creating pool:', error.message);
   * }
   */
  async createPool(userId, poolData) {
    logger.info(`Creating new pool for user ${userId}`);
    try {
      poolData.creator = userId;
      return await this.create(poolData);
    } catch (error) {
      logger.error(`Error creating pool for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error creating pool: ${error.message}`, 400);
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
      const pool = await this.getById(poolId);
      
      if (pool.creator.toString() !== userId) {
        throw new ErrorResponse(`User ${userId} is not authorized to delete this pool`, 403);
      }
      
      return await this.delete(poolId);
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
      const userPools = await Pool.find({ participants: userId });
      
      return Promise.all(userPools.map(async (pool) => {
        const activeEntries = await Entry.countDocuments({ 
          pool: pool._id, 
          user: userId,
          isActive: true
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
   * Get all pools for a specific user with their active entries
   * @async
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array<Object>>} Array of pools with active entries for the user
   * @throws {ErrorResponse} If there's an error fetching the pools and entries
   */
  async getUserPoolsWithEntries(userId) {
    logger.info(`Fetching pools with entries for user ${userId}`);
    try {
      const pools = await Pool.find({ participants: userId });
      const entries = await Entry.find({ user: userId, isActive: true });
      
      const poolsWithEntries = pools.map(pool => ({
        ...pool.toObject(),
        activeEntries: entries.filter(entry => entry.pool.toString() === pool._id.toString()).length,
        userEntryId: entries.find(entry => entry.pool.toString() === pool._id.toString())?._id
      }));

      return poolsWithEntries;
    } catch (error) {
      logger.error(`Error fetching pools with entries for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching user pools with entries: ${error.message}`, 500);
    }
  }

  /**
   * Get all active pools for a specific user
   * @async
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array<Object>>} Array of active pools for the user
   * @throws {ErrorResponse} If there's an error fetching the active pools
   */
  async getUserActivePools(userId) {
    logger.info(`Fetching active pools for user ${userId}`);
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
      return userPools;
    } catch (error) {
      logger.error(`Error fetching active pools for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching user active pools: ${error.message}`, 500);
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