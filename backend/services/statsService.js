const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const User = require('../models/User');
const Pick = require('../models/Pick');
const Game = require('../models/Game');
const NFLTeam = require('../models/Team');

/**
 * Fetch detailed entry list for a specific pool and week.
 * @param {string} poolId - The ObjectId of the pool.
 * @param {number} week - The week number to fetch picks for.
 * @returns {Promise<Array>} An array of detailed entry information.
 */
const getDetailedEntryList = async (poolId, week) => {
  try {
    const poolObjectId = mongoose.Types.ObjectId(poolId);

    const entries = await Entry.aggregate([
      { $match: { pool: poolObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $lookup: {
          from: 'picks',
          let: { entryId: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ['$entry', '$$entryId'] },
                    { $eq: ['$week', week] }
                  ]
                } 
              } 
            }
          ],
          as: 'weekPick'
        }
      },
      { $unwind: { path: '$weekPick', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          status: 1,
          'userDetails.username': 1,
          'weekPick.team': 1,
          'weekPick.result': 1
        }
      }
    ]);

    const totalCount = entries.length;

    return {
      success: true,
      entries,
      totalCount
    };
  } catch (error) {
    console.error('Error in getDetailedEntryList:', error);
    return { success: false, message: 'Error fetching detailed entry list' };
  }
};

/**
 * Fetch kill ratio per week for a specific pool and week, including successful picks.
 * @param {string} poolId - The ObjectId of the pool.
 * @param {number} week - The week number.
 * @returns {Promise<Array>} An array containing kill ratio and success ratio data per team.
 */
const getKillRatioPerWeek = async (poolId, week) => {
  const poolObjectId = mongoose.Types.ObjectId(poolId);

  const killRatio = await Pick.aggregate([
    // Match picks for the specified week
    { $match: { week: week } },
    {
      // Join with entries to filter by pool
      $lookup: {
        from: 'entries',
        localField: 'entry',
        foreignField: '_id',
        as: 'entryDetails'
      }
    },
    { $unwind: "$entryDetails" },
    { $match: { 'entryDetails.pool': poolObjectId } },
    {
      // Join with games to get game details
      $lookup: {
        from: 'games',
        localField: 'game',
        foreignField: '_id',
        as: 'gameDetails'
      }
    },
    { $unwind: "$gameDetails" },
    {
      // Construct full team name using teams_normalized and mascot
      $addFields: {
        teamFullName: {
          $concat: [
            "$team",
            " ",
            {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$gameDetails.teams_normalized",
                        as: "team",
                        cond: { $eq: ["$$team.name", "$team"] }
                      }
                    },
                    as: "filteredTeam",
                    in: "$$filteredTeam.mascot"
                  }
                },
                0
              ]
            }
          ]
        }
      }
    },
    {
      // Facet to calculate total picks and team eliminations & successful picks
      $facet: {
        totalPicks: [
          { $count: "count" }
        ],
        teamStats: [
          {
            $group: {
              _id: "$teamFullName",
              eliminations: {
                $sum: {
                  $cond: [{ $eq: ["$result", "loss"] }, 1, 0]
                }
              },
              successfulPicks: {
                $sum: {
                  $cond: [{ $eq: ["$result", "win"] }, 1, 0]
                }
              }
            }
          }
        ]
      }
    },
    {
      // Add totalPicks as a separate field
      $addFields: {
        totalPicks: { $arrayElemAt: ["$totalPicks.count", 0] },
        teamStats: "$teamStats"
      }
    },
    {
      // Unwind teamStats to process each team separately
      $unwind: "$teamStats"
    },
    {
      // Project the desired fields with killRatio and successRatio calculations
      $project: {
        _id: 0,
        teamName: "$teamStats._id",
        eliminations: "$teamStats.eliminations",
        successfulPicks: "$teamStats.successfulPicks",
        killRatio: {
          $cond: [
            { $eq: ["$totalPicks", 0] },
            "0.00%",
            {
              $concat: [
                {
                  $toString: {
                    $round: [
                      { $multiply: [{ $divide: ["$teamStats.eliminations", "$totalPicks"] }, 100] },
                      2
                    ]
                  }
                },
                "%"
              ]
            }
          ]
        },
        successRatio: {
          $cond: [
            { $eq: ["$totalPicks", 0] },
            "0.00%",
            {
              $concat: [
                {
                  $toString: {
                    $round: [
                      { $multiply: [{ $divide: ["$teamStats.successfulPicks", "$totalPicks"] }, 100] },
                      2
                    ]
                  }
                },
                "%"
              ]
            }
          ]
        }
      }
    },
    {
      // Group all documents back into an array
      $group: {
        _id: null,
        killRatioData: {
          $push: {
            teamName: "$teamName",
            eliminations: "$eliminations",
            successfulPicks: "$successfulPicks",
            killRatio: "$killRatio",
            successRatio: "$successRatio"
          }
        }
      }
    },
    {
      // Replace root to return the killRatioData array
      $replaceRoot: { newRoot: { killRatioData: "$killRatioData" } }
    }
  ]);

  // Flatten the result array for consistency
  return killRatio[0]?.killRatioData || [];
};

/**
 * Fetch overall kill ratio for a specific pool and week.
 * @param {string} poolId - The ObjectId of the pool.
 * @param {number} week - The week number.
 * @returns {Promise<Object>} An object containing totalPicks, totalEliminations, and overallKillRatio.
 */
const getOverallKillRatio = async (poolId, week) => {
  const poolObjectId = mongoose.Types.ObjectId(poolId);

  const overall = await Pick.aggregate([
    // Match picks for the specified week
    { $match: { week: week } },
    {
      // Join with entries to filter by pool
      $lookup: {
        from: 'entries',
        localField: 'entry',
        foreignField: '_id',
        as: 'entryDetails'
      }
    },
    { $unwind: "$entryDetails" },
    { $match: { 'entryDetails.pool': poolObjectId } },
    {
      // Group to calculate total picks and eliminations
      $group: {
        _id: null,
        totalPicks: { $sum: 1 },
        totalEliminations: {
          $sum: {
            $cond: [{ $eq: ["$result", "loss"] }, 1, 0]
          }
        },
        successfulPicks: {
          $sum: {
            $cond: [{ $eq: ["$result", "win"] }, 1, 0]
          }
        }
      }
    },
    {
      // Project the overall kill ratio and success ratio
      $project: {
        _id: 0,
        totalPicks: 1,
        totalEliminations: 1,
        successfulPicks: 1,
        overallKillRatio: {
          $cond: [
            { $eq: ["$totalPicks", 0] },
            "0.00%",
            {
              $concat: [
                { $toString: { $round: [{ $multiply: [{ $divide: ["$totalEliminations", "$totalPicks"] }, 100] }, 2] } },
                "%"
              ]
            }
          ]
        },
        overallSuccessRatio: {
          $cond: [
            { $eq: ["$totalPicks", 0] },
            "0.00%",
            {
              $concat: [
                { $toString: { $round: [{ $multiply: [{ $divide: ["$successfulPicks", "$totalPicks"] }, 100] }, 2] } },
                "%"
              ]
            }
          ]
        }
      }
    }
  ]);

  return overall[0] || { totalPicks: 0, totalEliminations: 0, successfulPicks: 0, overallKillRatio: "0.00%", overallSuccessRatio: "0.00%" };
};

/**
 * Fetch team stats for a specific pool.
 * @param {string} poolId - The ObjectId of the pool.
 * @returns {Promise<Array>} An array containing team stats.
 */
const getTeamStats = async (poolId) => {
  const poolObjectId = mongoose.Types.ObjectId(poolId);

  const teamStats = await Pick.aggregate([
    { $match: { pool: poolObjectId } }, // Assuming 'pool' field exists in Pick or via Entry
    {
      // Join with entries to ensure correct pool filtering
      $lookup: {
        from: 'entries',
        localField: 'entry',
        foreignField: '_id',
        as: 'entryDetails'
      }
    },
    { $unwind: "$entryDetails" },
    { $match: { 'entryDetails.pool': poolObjectId } },
    {
      // Join with games to get game details
      $lookup: {
        from: 'games',
        localField: 'game',
        foreignField: '_id',
        as: 'gameDetails'
      }
    },
    { $unwind: "$gameDetails" },
    {
      // Construct full team name using teams_normalized and mascot
      $addFields: {
        teamFullName: {
          $concat: [
            "$team",
            " ",
            {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$gameDetails.teams_normalized",
                        as: "team",
                        cond: { $eq: ["$$team.name", "$team"] }
                      }
                    },
                    as: "filteredTeam",
                    in: "$$filteredTeam.mascot"
                  }
                },
                0
              ]
            }
          ]
        }
      }
    },
    {
      // Group by the full team name to calculate total picks and eliminations
      $group: {
        _id: "$teamFullName",
        totalPicks: { $sum: 1 },
        totalEliminations: {
          $sum: {
            $cond: [{ $eq: ["$result", "loss"] }, 1, 0]
          }
        },
        successfulPicks: {
          $sum: {
            $cond: [{ $eq: ["$result", "win"] }, 1, 0]
          }
        }
      }
    },
    {
      // Project the final kill ratio and success ratio for each team
      $project: {
        _id: 0,
        teamName: "$_id",
        totalPicks: 1,
        totalEliminations: 1,
        successfulPicks: 1,
        killRatio: {
          $cond: [
            { $eq: ["$totalPicks", 0] },
            "0.00%",
            {
              $concat: [
                { $toString: { $round: [{ $multiply: [{ $divide: ["$totalEliminations", "$totalPicks"] }, 100] }, 2] } },
                "%"
              ]
            }
          ]
        },
        successRatio: {
          $cond: [
            { $eq: ["$totalPicks", 0] },
            "0.00%",
            {
              $concat: [
                { $toString: { $round: [{ $multiply: [{ $divide: ["$successfulPicks", "$totalPicks"] }, 100] }, 2] } },
                "%"
              ]
            }
          ]
        }
      }
    }
  ]);

  return teamStats;
};

/**
 * Fetch total entries stats for a specific pool.
 * @param {string} poolId - The ObjectId of the pool.
 * @returns {Promise<Object>} An object containing total entries stats.
 */
const getTotalEntriesStats = async (poolId) => {
  const poolObjectId = mongoose.Types.ObjectId(poolId);

  const stats = await Entry.aggregate([
    { $match: { pool: poolObjectId } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        activeEntries: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0]
          }
        },
        eliminatedEntries: {
          $sum: {
            $cond: [{ $eq: ["$status", "eliminated"] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        activeEntries: 1,
        eliminatedEntries: 1,
        eliminationRate: {
          $cond: [
            { $eq: ["$totalEntries", 0] },
            "0.00%",
            {
              $concat: [
                { $toString: { $round: [{ $multiply: [{ $divide: ["$eliminatedEntries", "$totalEntries"] }, 100] }, 2] } },
                "%"
              ]
            }
          ]
        }
      }
    }
  ]);

  return stats[0] || { totalEntries: 0, activeEntries: 0, eliminatedEntries: 0, eliminationRate: "0.00%" };
};

module.exports = {
  getTotalEntriesStats,
  getDetailedEntryList,
  getKillRatioPerWeek,
  getOverallKillRatio,
  getTeamStats
};
