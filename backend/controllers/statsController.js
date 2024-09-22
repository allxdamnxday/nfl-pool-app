const statsService = require('../services/statsService');

/**
 * Controller to get total entries stats.
 */
const getTotalEntriesStats = async (req, res) => {
  console.log('getTotalEntriesStats controller hit');
  try {
    const { poolId } = req.params;
    console.log('Fetching stats for poolId:', poolId);
    const stats = await statsService.getTotalEntriesStats(poolId);
    console.log('Stats fetched:', stats);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in getTotalEntriesStats:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching total entries stats.' });
  }
};

/**
 * Controller to get detailed entry list.
 */
const getDetailedEntryList = async (req, res) => {
  try {
    const { poolId } = req.params;
    const { week, page = 1, limit = 50 } = req.query;

    if (!week) {
      return res.status(400).json({ success: false, message: 'Week query parameter is required.' });
    }

    const result = await statsService.getDetailedEntryList(poolId, parseInt(week), parseInt(page), parseInt(limit));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in getDetailedEntryList controller:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching detailed entry list.' });
  }
};

/**
 * Controller to get kill ratio per week.
 */
const getKillRatioPerWeek = async (req, res) => {
  try {
    const { poolId } = req.params;
    const { week } = req.query;

    if (!week) {
      return res.status(400).json({ success: false, message: 'Week query parameter is required.' });
    }

    const killRatio = await statsService.getKillRatioPerWeek(poolId, parseInt(week));
    res.status(200).json({ success: true, data: killRatio });
  } catch (error) {
    console.error('Error in getKillRatioPerWeek:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching kill ratio per week.' });
  }
};

/**
 * Controller to get overall kill ratio.
 */
const getOverallKillRatio = async (req, res) => {
  try {
    const { poolId } = req.params;
    const { week } = req.query;

    if (!week) {
      return res.status(400).json({ success: false, message: 'Week query parameter is required.' });
    }

    const overallKillRatio = await statsService.getOverallKillRatio(poolId, parseInt(week));
    res.status(200).json({ success: true, data: overallKillRatio });
  } catch (error) {
    console.error('Error in getOverallKillRatio:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching overall kill ratio.' });
  }
};

/**
 * Controller to get team stats.
 */
const getTeamStats = async (req, res) => {
  console.log('getTeamStats controller hit');
  try {
    const { poolId } = req.params;
    console.log('Fetching team stats for poolId:', poolId);
    const teamStats = await statsService.getTeamStats(poolId);
    console.log('Team stats fetched:', teamStats);
    res.status(200).json({ success: true, data: teamStats });
  } catch (error) {
    console.error('Error in getTeamStats:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching team stats.' });
  }
};

module.exports = {
  getTotalEntriesStats,
  getDetailedEntryList,
  getKillRatioPerWeek,
  getOverallKillRatio,
  getTeamStats
};
