const ErrorResponse = require('../utils/errorResponse');
const Pick = require('../models/Pick');
const Entry = require('../models/Entry');
const KillRatio = require('../models/KillRatio');
const Pool = require('../models/Pool'); // Assuming you have a Pool model
const NFLTeam = require('../models/Team'); // Assuming you have an NFLTeam model

class KillRatioService {
  async calculateWeeklyKillRatio(poolId, week) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      throw new ErrorResponse(`No pool found with id ${poolId}`, 404);
    }

    const entries = await Entry.find({ pool: poolId });
    const picks = await Pick.find({
      entry: { $in: entries.map(e => e._id) },
      week: parseInt(week)
    });

    const teamStats = {};
    let totalEliminations = 0;
    const totalEntries = entries.length;

    for (const pick of picks) {
      const teamName = pick.team; // Using the team name directly
      if (!teamStats[teamName]) {
        teamStats[teamName] = { picks: 0, eliminations: 0 };
      }
      teamStats[teamName].picks++;
      if (pick.result === 'loss') {
        teamStats[teamName].eliminations++;
        totalEliminations++;
      }
    }

    // Fetch all NFL teams once
    const nflTeams = await NFLTeam.find({});
    const teamNameToFullName = nflTeams.reduce((acc, team) => {
      acc[team.name] = `${team.name} ${team.mascot}`;
      return acc;
    }, {});

    const teams = Object.entries(teamStats).map(([teamName, stats]) => ({
      teamName,
      teamFullName: teamNameToFullName[teamName] || teamName,
      picks: stats.picks,
      eliminations: stats.eliminations,
      killRatio: stats.eliminations / totalEntries
    }));

    const overallKillRatio = totalEliminations / totalEntries;

    const killRatio = await KillRatio.findOneAndUpdate(
      { pool: poolId, week: parseInt(week) },
      {
        teams,
        totalEntries,
        totalEliminations,
        overallKillRatio
      },
      { upsert: true, new: true }
    );

    return killRatio;
  }

  async getKillRatioSheet(poolId) {
    const killRatios = await KillRatio.find({ pool: poolId }).sort('week');
    return killRatios;
  }

  async getWeeklyKillRatio(poolId, week, includeFullTeamNames = false) {
    const killRatio = await KillRatio.findOne({ pool: poolId, week: parseInt(week) });
    if (!killRatio) {
      throw new ErrorResponse(`No kill ratio found for pool ${poolId} in week ${week}`, 404);
    }
  
    if (includeFullTeamNames) {
      return killRatio;
    } else {
      const simplifiedKillRatio = {
        ...killRatio.toObject(),
        teams: killRatio.teams.map(team => ({
          ...team,
          teamName: team.teamName // Use only the short team name
        }))
      };
      return simplifiedKillRatio;
    }
  }

  async updateKillRatioForPick(pickId) {
    const pick = await Pick.findById(pickId).populate('entry');
    if (!pick) {
      throw new ErrorResponse(`No pick found with id ${pickId}`, 404);
    }

    // Recalculate kill ratio for the pool in this week
    return this.calculateWeeklyKillRatio(pick.entry.pool, pick.week);
  }
}

module.exports = new KillRatioService();