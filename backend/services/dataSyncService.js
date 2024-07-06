const rundownApiService = require('./rundownApiService');
const Game = require('../models/Game');
const NFLTeam = require('../models/NFLTeam');
const Player = require('../models/Player');
const Market = require('../models/Market');
const config = require('../config/rundownApi');


exports.syncNFLSchedule = async (date, limit = 10) => {
    try {
      const events = await rundownApiService.fetchNFLSchedule(date, limit);
  
      for (const event of events) {
        await Game.findOneAndUpdate(
          { event_id: event.event_id },
          {
            sport_id: event.sport_id,
            event_date: new Date(event.event_date),
            rotation_number_away: event.rotation_number_away,
            rotation_number_home: event.rotation_number_home,
            teams: event.teams,
            teams_normalized: event.teams_normalized,
            score: event.score,
            schedule: event.schedule,
            venue: event.venue,
            broadcast: event.broadcast,
            odds: event.odds
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