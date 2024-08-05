/**
 * @module PickService
 * @description Service module for managing user picks in the NFL pool application. This service handles the creation, retrieval, updating, and deletion of picks for pool entries.
 */

const Pick = require('../models/Pick');
const Entry = require('../models/Entry');
const Game = require('../models/Game');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * Service class for managing picks
 * @class PickService
 */
class PickService {
  /**
   * Add or update a pick for an entry
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {number} entryNumber - The entry number (1, 2, or 3)
   * @param {string} userId - The ID of the user making the pick
   * @param {string} team - The team picked (e.g., "Patriots", "49ers")
   * @param {number} week - The NFL week number (1-18)
   * @returns {Promise<Object>} The created or updated pick object
   * @throws {ErrorResponse} If entry is not found, user is not authorized, pick is invalid, or game has already started
   * 
   * @example
   * try {
   *   const pick = await pickService.addOrUpdatePick('entry123', 1, 'user456', 'Patriots', 5);
   *   console.log('Pick added/updated:', pick);
   *   // Output: Pick added/updated: { _id: '...', entry: 'entry123', entryNumber: 1, team: 'Patriots', week: 5 }
   * } catch (error) {
   *   console.error('Error adding/updating pick:', error.message);
   * }
   */
  async addOrUpdatePick(entryId, entryNumber, userId, team, week) {
    logger.info(`Attempting to add/update pick for entry ${entryId}, user ${userId}, team ${team}, week ${week}`);
    
    const entry = await Entry.findById(entryId).populate('pool');
    if (!entry) {
      logger.error(`No entry found with id ${entryId}`);
      throw new ErrorResponse(`No entry found with id ${entryId}`, 404);
    }

    if (entry.user.toString() !== userId) {
      logger.warn(`User ${userId} attempted to update entry ${entryId} without authorization`);
      throw new ErrorResponse(`User ${userId} is not authorized to update this entry`, 403);
    }

    if (week < 1 || week > entry.pool.numberOfWeeks) {
      logger.warn(`Invalid week number ${week} for entry ${entryId}`);
      throw new ErrorResponse(`Invalid week number`, 400);
    }

    const teamAlreadyPicked = await Pick.findOne({
      entry: entryId,
      team: team,
      week: { $ne: parseInt(week) }
    });

    if (teamAlreadyPicked) {
      logger.warn(`User attempted to pick ${team} again for entry ${entryId}`);
      throw new ErrorResponse(`You already have a ${team} pick this season for this entry, please choose another team`, 400);
    }

    const game = await Game.findOne({ week, $or: [{ homeTeam: team }, { awayTeam: team }] });
    if (!game) {
      logger.error(`No game found for team ${team} in week ${week}`);
      throw new ErrorResponse(`No game found for team ${team} in week ${week}`, 404);
    }

    if (new Date() >= game.startTime) {
      logger.warn(`Attempted to update pick after game start for entry ${entryId}, week ${week}`);
      throw new ErrorResponse(`Cannot update pick after game has started`, 400);
    }

    const pick = await Pick.findOneAndUpdate(
      { entry: entryId, entryNumber, week: parseInt(week) },
      { team: team },
      { upsert: true, new: true }
    );

    logger.info(`Successfully added/updated pick for entry ${entryId}, week ${week}`);
    return pick;
  }

  /**
   * Get picks for a specific week
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {number} entryNumber - The entry number (1, 2, or 3)
   * @param {number} week - The NFL week number (1-18)
   * @returns {Promise<Array<Object>>} Array of pick objects for the specified week
   * @throws {ErrorResponse} If there's an error retrieving the picks
   * 
   * @example
   * try {
   *   const weekPicks = await pickService.getPicksForWeek('entry123', 1, 5);
   *   console.log('Picks for week 5:', weekPicks);
   *   // Output: Picks for week 5: [{ _id: '...', entry: 'entry123', entryNumber: 1, team: 'Patriots', week: 5 }]
   * } catch (error) {
   *   console.error('Error fetching picks for week:', error.message);
   * }
   */
  async getPicksForWeek(entryId, entryNumber, week) {
    logger.info(`Fetching picks for entry ${entryId}, number ${entryNumber}, week ${week}`);
    try {
      const picks = await Pick.find({ entry: entryId, entryNumber, week: parseInt(week) });
      return picks;
    } catch (error) {
      logger.error(`Error fetching picks for entry ${entryId}, week ${week}: ${error.message}`);
      throw new ErrorResponse(`Error fetching picks: ${error.message}`, 500);
    }
  }

  /**
   * Get all picks for an entry
   * @async
   * @param {string} entryId - The ID of the entry
   * @returns {Promise<Array<Object>>} Array of all pick objects for the entry
   * @throws {ErrorResponse} If there's an error retrieving the picks
   * 
   * @example
   * try {
   *   const allPicks = await pickService.getPicksForEntry('entry123');
   *   console.log('All picks for entry:', allPicks);
   *   // Output: All picks for entry: [{ _id: '...', entry: 'entry123', entryNumber: 1, team: 'Patriots', week: 5 }, ...]
   * } catch (error) {
   *   console.error('Error fetching all picks for entry:', error.message);
   * }
   */
  async getPicksForEntry(entryId) {
    logger.info(`Fetching all picks for entry ${entryId}`);
    try {
      const picks = await Pick.find({ entry: entryId });
      return picks;
    } catch (error) {
      logger.error(`Error fetching all picks for entry ${entryId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching picks: ${error.message}`, 500);
    }
  }

  /**
   * Update a pick
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {number} entryNumber - The entry number (1, 2, or 3)
   * @param {number} week - The NFL week number (1-18)
   * @param {string} userId - The ID of the user making the update
   * @param {Object} updateData - The data to update the pick with
   * @param {string} [updateData.team] - The new team to pick
   * @param {string} [updateData.result] - The result of the pick ('win', 'loss', or 'pending')
   * @returns {Promise<Object>} The updated pick object
   * @throws {ErrorResponse} If entry is not found, user is not authorized, or pick is not found
   * 
   * @example
   * try {
   *   const updatedPick = await pickService.updatePick('entry123', 1, 5, 'user456', { team: '49ers' });
   *   console.log('Updated pick:', updatedPick);
   *   // Output: Updated pick: { _id: '...', entry: 'entry123', entryNumber: 1, team: '49ers', week: 5 }
   * } catch (error) {
   *   console.error('Error updating pick:', error.message);
   * }
   */
  async updatePick(entryId, entryNumber, week, userId, updateData) {
    logger.info(`Attempting to update pick for entry ${entryId}, user ${userId}, week ${week}`);
    
    const entry = await Entry.findById(entryId);
    if (!entry) {
      logger.error(`No entry found with id ${entryId}`);
      throw new ErrorResponse(`No entry with the id of ${entryId}`, 404);
    }

    if (entry.user.toString() !== userId) {
      logger.warn(`User ${userId} attempted to update pick for entry ${entryId} without authorization`);
      throw new ErrorResponse(`User not authorized to update this pick`, 401);
    }

    const pick = await Pick.findOneAndUpdate(
      { entry: entryId, entryNumber, week: parseInt(week) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!pick) {
      logger.error(`No pick found for entry ${entryId}, number ${entryNumber}, week ${week}`);
      throw new ErrorResponse(`No pick found for entry ${entryId}, number ${entryNumber}, week ${week}`, 404);
    }

    logger.info(`Successfully updated pick for entry ${entryId}, week ${week}`);
    return pick;
  }

  /**
   * Delete a pick
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {number} entryNumber - The entry number (1, 2, or 3)
   * @param {number} week - The NFL week number (1-18)
   * @param {string} userId - The ID of the user requesting the deletion
   * @throws {ErrorResponse} If entry is not found, user is not authorized, or pick is not found
   * 
   * @example
   * try {
   *   await pickService.deletePick('entry123', 1, 5, 'user456');
   *   console.log('Pick deleted successfully');
   * } catch (error) {
   *   console.error('Error deleting pick:', error.message);
   * }
   */
  async deletePick(entryId, entryNumber, week, userId) {
    logger.info(`Attempting to delete pick for entry ${entryId}, user ${userId}, week ${week}`);
    
    const entry = await Entry.findById(entryId);
    if (!entry) {
      logger.error(`No entry found with id ${entryId}`);
      throw new ErrorResponse(`No entry with the id of ${entryId}`, 404);
    }

    if (entry.user.toString() !== userId) {
      logger.warn(`User ${userId} attempted to delete pick for entry ${entryId} without authorization`);
      throw new ErrorResponse(`User not authorized to delete this pick`, 401);
    }

    const pick = await Pick.findOneAndDelete({ entry: entryId, entryNumber, week: parseInt(week) });
    if (!pick) {
      logger.error(`No pick found for entry ${entryId}, number ${entryNumber}, week ${week}`);
      throw new ErrorResponse(`No pick found for entry ${entryId}, number ${entryNumber}, week ${week}`, 404);
    }

    logger.info(`Successfully deleted pick for entry ${entryId}, week ${week}`);
  }
}

module.exports = new PickService();