// backend/services/dataSyncService.js
const rundownApiService = require('./rundownApiService');
const Game = require('../models/Game');
const NFLTeam = require('../models/NFLTeam');
const Player = require('../models/Player');
const Market = require('../models/Market');
const config = require('../config/rundownApi');

exports.syncNFLSchedule = async (season) => {
  try {
    const fromDate = new Date().toISOString().split('T')[0]; // Today's date
    const events = await rundownApiService.fetchNFLSchedule(fromDate, season);

    for (const event of events) {
      let homeTeam = await NFLTeam.findOneAndUpdate(
        { rundownId: event.home_team.id },
        { 
          name: event.home_team.name,
          // You'll need to add logic to determine conference and division if not provided in V2
        },
        { upsert: true, new: true }
      );

      let awayTeam = await NFLTeam.findOneAndUpdate(
        { rundownId: event.away_team.id },
        { 
          name: event.away_team.name,
          // You'll need to add logic to determine conference and division if not provided in V2
        },
        { upsert: true, new: true }
      );

      await Game.findOneAndUpdate(
        { rundownId: event.event_id },
        {
          sportId: event.sport_id,
          eventDate: event.event_date,
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          season: season,
          week: event.week // Make sure this field exists in V2 response
        },
        { upsert: true }
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

    const markets = await rundownApiService.fetchEventMarkets(game.rundownId, config.PARTICIPANT_TYPE.TEAM);
    
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
    const eventDetails = await rundownApiService.fetchEventDetails(game.rundownId, marketIds);

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

    const players = await rundownApiService.fetchTeamPlayers(team.rundownId);

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