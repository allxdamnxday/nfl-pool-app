const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const ErrorResponse = require('../utils/errorResponse');

class EntryService {
  async getUserEntries(userId) {
    return await Entry.find({ user: userId }).populate('pool', 'name currentWeek');
  }

  async getEntry(entryId, userId) {
    const entry = await Entry.findById(entryId).populate('pool').populate('picks');
    if (!entry) {
      throw new ErrorResponse(`Entry not found with id of ${entryId}`, 404);
    }

    if (entry.user.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to view this entry`, 403);
    }

    return entry;
  }

  async getEntriesForPool(poolId) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }

    return await Entry.find({ pool: poolId })
      .populate('user', 'username')
      .populate('picks');
  }

  async addOrUpdatePick(entryId, userId, team, week) {
    const entry = await Entry.findById(entryId).populate('pool');
    if (!entry) {
      throw new ErrorResponse(`No entry found with id ${entryId}`, 404);
    }

    if (entry.user.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to update this entry`, 403);
    }

    if (week < 1 || week > entry.pool.numberOfWeeks) {
      throw new ErrorResponse(`Invalid week number`, 400);
    }

    let pickIndex = entry.picks.findIndex(p => p.week === parseInt(week));
    
    const teamAlreadyPicked = entry.picks.some(p => p.team === team && p.week !== parseInt(week));
    if (teamAlreadyPicked) {
      throw new ErrorResponse(`You already have a ${team} pick this season, please choose another team`, 400);
    }

    if (pickIndex !== -1) {
      entry.picks[pickIndex].team = team;
    } else {
      entry.picks.push({ team, week: parseInt(week) });
    }

    await entry.save();

    return entry.picks.find(p => p.week === parseInt(week));
  }

  async getPickForWeek(entryId, week) {
    const entry = await Entry.findById(entryId);
    if (!entry) {
      throw new ErrorResponse(`No entry found with id ${entryId}`, 404);
    }

    const pick = entry.picks.find(p => p.week === parseInt(week));
    return pick || null;
  }

  async getUserEntriesWithPicks(userId, populate) {
    let query = Entry.find({ user: userId }).populate('pool');
    
    if (populate === 'picks.game') {
      query = query.populate({
        path: 'picks',
        populate: {
          path: 'game',
          select: 'away_team home_team event_date schedule.week'
        }
      });
    }

    return await query.exec();
  }
}

module.exports = new EntryService();