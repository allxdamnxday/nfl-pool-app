const Pick = require('../models/Pick');
const Entry = require('../models/Entry');
const Game = require('../models/Game');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

class PickService {
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

  async getPicksForWeek(entryId, entryNumber, week) {
    logger.info(`Fetching picks for entry ${entryId}, number ${entryNumber}, week ${week}`);
    const picks = await Pick.find({ entry: entryId, entryNumber, week: parseInt(week) });
    return picks;
  }

  async getPicksForEntry(entryId) {
    logger.info(`Fetching all picks for entry ${entryId}`);
    const picks = await Pick.find({ entry: entryId });
    return picks;
  }

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