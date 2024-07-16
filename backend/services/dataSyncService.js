// backend/services/dataSyncService.js
const rundownApiService = require('./rundownApiService');
const Game = require('../models/Game');
const NFLTeam = require('../models/NFLTeam');
const Player = require('../models/Player');
const Market = require('../models/Market');
const config = require('../config/rundownApi');


exports.syncNFLSchedule = async (fromDate, limit = 100) => {
    try {
      const schedules = await rundownApiService.fetchNFLSchedule(fromDate, limit);
  
      for (const game of schedules) {
        await Game.findOneAndUpdate(
          { event_id: game.event_id },
          {
            id: game.id,
            event_uuid: game.event_uuid,
            sport_id: game.sport_id,
            season_type: game.season_type,
            season_year: game.season_year,
            away_team_id: game.away_team_id,
            home_team_id: game.home_team_id,
            away_team: game.away_team,
            home_team: game.home_team,
            date_event: new Date(game.date_event),
            neutral_site: game.neutral_site,
            conference_competition: game.conference_competition,
            away_score: game.away_score,
            home_score: game.home_score,
            league_name: game.league_name,
            event_name: game.event_name,
            event_location: game.event_location,
            attendance: game.attendance,
            updated_at: new Date(game.updated_at),
            event_status: game.event_status,
            event_status_detail: game.event_status_detail
          },
          { upsert: true, new: true }
        );
      }
  
      console.log('NFL schedule synced successfully');
    } catch (error) {
      console.error('Error syncing NFL schedule:', error);
    }
  };

exports.syncGameMarkets = async (gameId) => {
  try {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');

    const markets = await rundownApiService.fetchEventMarkets(game.event_id, config.PARTICIPANT_TYPE.TEAM);
    
    for (const market of markets) {
      await Market.findOneAndUpdate(
        { rundownId: market.id },
        {
          name: market.name,
          description: market.description,
          lineValueIsParticipant: market.line_value_is_participant,
          proposition: market.proposition,
          periodId: market.period_id,
          updatedAt: market.updated_at
        },
        { upsert: true }
      );
    }

    const marketIds = markets.map(market => market.id);
    const eventDetails = await rundownApiService.fetchEventDetails(game.event_id, marketIds);

    game.markets = eventDetails.markets.map(market => ({
      marketId: market.market_id,
      name: market.name,
      participants: market.participants.map(participant => ({
        participantId: participant.id,
        type: participant.type,
        name: participant.name,
        lines: participant.lines.map(line => ({
          value: line.value,
          prices: line.prices
        }))
      }))
    }));

    await game.save();
    console.log(`Markets synced for game ${gameId}`);
  } catch (error) {
    console.error('Error syncing game markets:', error);
  }
};

exports.syncTeamPlayers = async (teamId) => {
  try {
    const team = await NFLTeam.findById(teamId);
    if (!team) throw new Error('Team not found');

    const players = await rundownApiService.fetchTeamPlayers(team.team_id);

    for (const playerData of players) {
      await Player.findOneAndUpdate(
        { rundownId: playerData.id },
        {
          firstName: playerData.first_name,
          lastName: playerData.last_name,
          displayName: playerData.display_name,
          team: team._id,
          position: playerData.position,
          jerseyNumber: playerData.jersey_number,
          active: playerData.active,
          status: playerData.status
        },
        { upsert: true }
      );
    }

    console.log(`Players synced for team ${team.name}`);
  } catch (error) {
    console.error('Error syncing team players:', error);
  }
};