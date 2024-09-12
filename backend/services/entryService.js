/**
 * @module EntryService
 * @description Service module for managing entries in the NFL pool application. This service handles operations related to user entries, including retrieval, creation, and updating of entries and their associated picks.
 */
const Game = require('../models/Game');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const Pick = require('../models/Pick');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * Service class for managing entries
 * @class EntryService
 */
class EntryService {
  /**
   * Get all entries for a user
   * @async
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array<Object>>} Array of user entries with populated pool information
   * @throws {ErrorResponse} If there's an error retrieving the entries
   * 
   * @example
   * try {
   *   const userEntries = await entryService.getUserEntries('user123');
   *   console.log('User entries:', userEntries);
   *   // Output: User entries: [{ _id: '...', user: 'user123', pool: { _id: '...', name: 'NFL Pool 2023', currentWeek: 5 }, ... }]
   * } catch (error) {
   *   console.error('Error fetching user entries:', error.message);
   * }
   */
  async getUserEntries(userId) {
    try {
      return await Entry.find({ user: userId })
        .populate('pool', 'name currentWeek')
        .select('entryNumber status picks');
    } catch (error) {
      throw new ErrorResponse(`Error fetching entries for user ${userId}: ${error.message}`, 500);
    }
  }

  /**
   * Get user entries for a specific pool
   * @async
   * @param {string} userId - The ID of the user
   * @param {string} poolId - The ID of the pool
   * @returns {Promise<Array<Object>>} Array of user entries for the specified pool
   * @throws {ErrorResponse} If there's an error retrieving the entries
   * 
   * @example
   * try {
   *   const poolEntries = await entryService.getUserEntriesForPool('user123', 'pool456');
   *   console.log('User entries for pool:', poolEntries);
   *   // Output: User entries for pool: [{ _id: '...', user: 'user123', pool: 'pool456', ... }]
   * } catch (error) {
   *   console.error('Error fetching user entries for pool:', error.message);
   * }
   */
  async getUserEntriesForPool(userId, poolId) {
    try {
      return await Entry.find({ user: userId, pool: poolId });
    } catch (error) {
      throw new ErrorResponse(`Error fetching entries for user ${userId} in pool ${poolId}: ${error.message}`, 500);
    }
  }
  
  /**
   * Get a specific entry for a user
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} The entry object with populated pool and picks information
   * @throws {ErrorResponse} If entry is not found or user is not authorized
   * 
   * @example
   * try {
   *   const entry = await entryService.getEntry('entry789', 'user123');
   *   console.log('Entry:', entry);
   *   // Output: Entry: { _id: 'entry789', user: 'user123', pool: { ... }, picks: [ ... ], ... }
   * } catch (error) {
   *   console.error('Error fetching entry:', error.message);
   * }
   */
  async getEntry(entryId, userId) {
    const entry = await Entry.findById(entryId)
      .populate('pool')
      .populate({
        path: 'picks',
        populate: {
          path: 'game',
          select: 'away_team home_team event_date schedule.week teams_normalized'
        }
      });

    if (!entry) {
      throw new ErrorResponse(`Entry not found with id of ${entryId}`, 404);
    }
  
    if (entry.user.toString() !== userId.toString()) {
      throw new ErrorResponse(`User is not authorized to view this entry`, 403);
    }
  
    // Process picks to include full team names
    const processedPicks = await Promise.all(entry.picks.map(async (pick) => {
      const pickDoc = new Pick(pick);
      const fullTeamName = await pickDoc.getSelectedTeamFullName();
      return {
        ...pick.toObject(),
        fullTeamName
      };
    }));

    const processedEntry = {
      ...entry.toObject(),
      picks: processedPicks
    };
  
    return processedEntry;
  }

  /**
   * Get all entries for a specific pool
   * @async
   * @param {string} poolId - The ID of the pool
   * @returns {Promise<Array<Object>>} Array of entries for the pool with populated user and picks information
   * @throws {ErrorResponse} If pool is not found
   * 
   * @example
   * try {
   *   const poolEntries = await entryService.getEntriesForPool('pool456');
   *   console.log('Pool entries:', poolEntries);
   *   // Output: Pool entries: [{ _id: '...', user: { _id: '...', username: 'John' }, pool: 'pool456', picks: [ ... ], ... }]
   * } catch (error) {
   *   console.error('Error fetching pool entries:', error.message);
   * }
   */
  async getEntriesForPool(poolId) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }

    return await Entry.find({ pool: poolId })
      .populate('user', 'username')
      .populate('picks');
  }

  /**
   * Add or update a pick for an entry
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {string} userId - The ID of the user
   * @param {string} team - The team picked (e.g., "Patriots", "49ers")
   * @param {number} week - The week number (1-18)
   * @returns {Promise<Object>} The updated or created pick
   * @throws {ErrorResponse} If entry is not found, user is not authorized, or pick is invalid
   * 
   * @example
   * try {
   *   const pick = await entryService.addOrUpdatePick('entry789', 'user123', 'Patriots', 5);
   *   console.log('Added/Updated pick:', pick);
   *   // Output: Added/Updated pick: { _id: '...', entry: 'entry789', team: 'Patriots', week: 5, ... }
   * } catch (error) {
   *   console.error('Error adding/updating pick:', error.message);
   * }
   */
  async addOrUpdatePick(entryId, userId, team, week) {
    const entry = await Entry.findById(entryId).populate('pool');
    if (!entry) {
      throw new ErrorResponse(`No entry found with id ${entryId}`, 404);
    }

    if (entry.user.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to update this entry`, 403);
    }

    // Check if the entry is eliminated
    if (entry.status === 'eliminated') {
      throw new ErrorResponse(`Cannot add or update pick for eliminated entry`, 400);
    }

    const { canUpdate, reason, newGame } = await entry.canUpdatePick(week, team);
    if (!canUpdate) {
      throw new ErrorResponse(reason, 400);
    }

    // Check if the team has already been picked for this entry
    const teamAlreadyPicked = await Pick.findOne({
      entry: entryId,
      team: team,
      week: { $ne: parseInt(week) }
    });

    if (teamAlreadyPicked) {
      throw new ErrorResponse(`You already have a ${team} pick this season for this entry, please choose another team`, 400);
    }

    // Update or create the pick
    const pick = await Pick.findOneAndUpdate(
      { entry: entryId, week: parseInt(week) },
      { team: team, game: newGame._id },
      { upsert: true, new: true }
    );

    return pick;
  }

  /**
   * Get a pick for a specific week
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {number} week - The week number (1-18)
   * @returns {Promise<Object|null>} The pick object or null if not found
   * @throws {ErrorResponse} If entry is not found
   * 
   * @example
   * try {
   *   const pick = await entryService.getPickForWeek('entry789', 5);
   *   console.log('Pick for week 5:', pick);
   *   // Output: Pick for week 5: { _id: '...', entry: 'entry789', team: 'Patriots', week: 5, ... }
   * } catch (error) {
   *   console.error('Error fetching pick:', error.message);
   * }
   */
  async getPickForWeek(entryId, week) {
    const entry = await Entry.findById(entryId).populate('picks');
    if (!entry) {
      throw new ErrorResponse(`No entry found with id ${entryId}`, 404);
    }
  
    const pick = entry.picks.find(p => p.week === parseInt(week));
    return pick || null;
  }

  /**
   * Get user entries with picks
   * @async
   * @param {string} userId - The ID of the user
   * @param {string} [populate] - Population option ('picks.game' to populate game information)
   * @returns {Promise<Array<Object>>} Array of user entries with populated picks and optional game information
   * @throws {ErrorResponse} If there's an error retrieving the entries
   * 
   * @example
   * try {
   *   const entriesWithPicks = await entryService.getUserEntriesWithPicks('user123', 'picks.game');
   *   console.log('User entries with picks:', entriesWithPicks);
   *   // Output: User entries with picks: [{ _id: '...', user: 'user123', pool: { ... }, picks: [{ game: { ... }, team: 'Patriots', week: 5 }, ...] }, ...]
   * } catch (error) {
   *   console.error('Error fetching user entries with picks:', error.message);
   * }
   */
  async getUserEntriesWithPicks(userId, populate) {
    try {
      logger.info(`Fetching entries with picks for user ${userId}`);
      let query = Entry.find({ user: userId }).populate('pool');
      
      if (populate === 'picks.game') {
        query = query.populate({
          path: 'picks',
          populate: {
            path: 'game',
            select: 'away_team home_team event_date schedule.week teams_normalized'
          }
        });
      } else {
        query = query.populate('picks');
      }

      const entries = await query.exec();

      // Process entries to include full team names
      const processedEntries = await Promise.all(entries.map(async (entry) => {
        const processedPicks = await Promise.all(entry.picks.map(async (pick) => {
          const pickDoc = new Pick(pick);
          const fullTeamName = await pickDoc.getSelectedTeamFullName();
          return {
            ...pick.toObject(),
            fullTeamName
          };
        }));

        return {
          ...entry.toObject(),
          picks: processedPicks,
          _timestamp: Date.now()
        };
      }));

      logger.info(`Successfully fetched ${processedEntries.length} entries for user ${userId}`);
      return processedEntries;
    } catch (error) {
      logger.error(`Error fetching entries with picks for user ${userId}: ${error.message}`);
      throw new ErrorResponse(`Error fetching entries with picks: ${error.message}`, 500);
    }
  }

  /**
   * Eliminate an entry
   * @async
   * @param {string} entryId - The ID of the entry
   * @param {number} week - The week number when the entry was eliminated (1-18)
   * @returns {Promise<Object>} The updated entry
   * @throws {ErrorResponse} If entry is not found
   * 
   * @example
   * try {
   *   const eliminatedEntry = await entryService.eliminateEntry('entry789', 6);
   *   console.log('Eliminated entry:', eliminatedEntry);
   *   // Output: Eliminated entry: { _id: 'entry789', status: 'eliminated', eliminatedWeek: 6, ... }
   * } catch (error) {
   *   console.error('Error eliminating entry:', error.message);
   * }
   */
  async eliminateEntry(entryId, week) {
    const entry = await Entry.findById(entryId);
    if (!entry) {
      throw new ErrorResponse(`No entry found with id ${entryId}`, 404);
    }

    entry.status = 'eliminated';
    entry.eliminatedWeek = week;
    await entry.save();

    return entry;
  }
}

module.exports = new EntryService();