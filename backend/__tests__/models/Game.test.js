const mongoose = require('mongoose');
const Game = require('../../models/Game');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createTestGame, updateGame, findGamesByWeekAndSeason } = require('../testUtils');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Game Model Test', () => {
  it('should create & save game successfully', async () => {
    const validGame = await createTestGame();
    expect(validGame._id).toBeDefined();
    expect(validGame.event_id).toBeDefined();
    expect(validGame.event_uuid).toBeDefined();
    expect(validGame.sport_id).toBe(1);
    expect(validGame.event_date).toBeDefined();
    expect(validGame.away_team_id).toBeDefined();
    expect(validGame.home_team_id).toBeDefined();
    expect(validGame.away_team).toBeDefined();
    expect(validGame.home_team).toBeDefined();
    // New fields
    expect(validGame.rotation_number_away).toBeDefined();
    expect(validGame.rotation_number_home).toBeDefined();
    expect(validGame.total).toBeDefined();
    expect(validGame.favored_team).toBeDefined();
  });

  it('should fail to create game without required fields', async () => {
    const invalidGame = new Game({});
    await expect(invalidGame.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create game with duplicate event_id', async () => {
    const game1 = await createTestGame();
    const game2 = new Game({
      ...game1.toObject(),
      _id: new mongoose.Types.ObjectId(),
      event_uuid: mongoose.Types.ObjectId().toString()
    });
    await expect(game2.save()).rejects.toThrow(/duplicate key error/);
  });

  it('should update game successfully', async () => {
    const game = await createTestGame();
    const updateData = {
      'score.score_away': 21,
      'score.score_home': 14,
      'score.event_status': 'final'
    };
    const updatedGame = await updateGame(game.event_id, updateData);
    expect(updatedGame.score.score_away).toBe(21);
    expect(updatedGame.score.score_home).toBe(14);
    expect(updatedGame.score.event_status).toBe('final');
  });

  it('should delete game successfully', async () => {
    const game = await createTestGame();
    await Game.findByIdAndDelete(game._id);
    const deletedGame = await Game.findById(game._id);
    expect(deletedGame).toBeNull();
  });

  it('should find games by week and season', async () => {
    const game1 = await createTestGame({ 'schedule.week': 1, 'schedule.season_year': 2023 });
    const game2 = await createTestGame({ 'schedule.week': 1, 'schedule.season_year': 2023 });
    await createTestGame({ 'schedule.week': 2, 'schedule.season_year': 2023 });

    const games = await findGamesByWeekAndSeason(1, 2023);
    expect(games.length).toBe(2);
    expect(games[0].schedule.week).toBe(1);
    expect(games[0].schedule.season_year).toBe(2023);
    expect(games[1].schedule.week).toBe(1);
    expect(games[1].schedule.season_year).toBe(2023);
  });

  it('should validate team_normalized structure', async () => {
    const game = await createTestGame();
    expect(game.teams_normalized.length).toBe(2);
    game.teams_normalized.forEach(team => {
      expect(team.team_id).toBeDefined();
      expect(team.name).toBeDefined();
      expect(team.mascot).toBeDefined();
      expect(team.abbreviation).toBeDefined();
      expect(typeof team.is_away).toBe('boolean');
      expect(typeof team.is_home).toBe('boolean');
      // New fields
      expect(team.logo).toBeDefined();
      expect(team.conference_id).toBeDefined();
      expect(team.division_id).toBeDefined();
      expect(team.ranking).toBeDefined();
      expect(team.record).toBeDefined();
    });
  });

  it('should validate score structure', async () => {
    const game = await createTestGame();
    expect(game.score).toBeDefined();
    expect(game.score.event_status).toBeDefined();
    expect(typeof game.score.score_away).toBe('number');
    expect(typeof game.score.score_home).toBe('number');
    expect(Array.isArray(game.score.score_away_by_period)).toBe(true);
    expect(Array.isArray(game.score.score_home_by_period)).toBe(true);
    // New fields
    expect(game.score.venue_name).toBeDefined();
    expect(game.score.venue_location).toBeDefined();
    expect(typeof game.score.game_clock).toBe('number');
    expect(game.score.display_clock).toBeDefined();
    expect(typeof game.score.game_period).toBe('number');
    expect(game.score.broadcast).toBeDefined();
    expect(game.score.event_status_detail).toBeDefined();
    expect(game.score.updated_at).toBeDefined();
  });

  it('should validate schedule structure', async () => {
    const game = await createTestGame();
    expect(game.schedule).toBeDefined();
    expect(game.schedule.season_type).toBeDefined();
    expect(typeof game.schedule.season_year).toBe('number');
    expect(typeof game.schedule.week).toBe('number');
    // New fields
    expect(game.schedule.league_name).toBeDefined();
    expect(typeof game.schedule.conference_competition).toBe('boolean');
    expect(game.schedule.week_name).toBeDefined();
    expect(game.schedule.week_detail).toBeDefined();
    expect(game.schedule.event_name).toBeDefined();
    expect(game.schedule.attendance).toBeDefined();
  });

  it('should validate odds structure', async () => {
    const game = await createTestGame();
    expect(game.odds).toBeDefined();
    expect(game.odds.moneyline).toBeDefined();
    expect(typeof game.odds.moneyline.moneyline_away).toBe('number');
    expect(typeof game.odds.moneyline.moneyline_home).toBe('number');
    expect(game.odds.spread).toBeDefined();
    expect(typeof game.odds.spread.point_spread_away).toBe('number');
    expect(typeof game.odds.spread.point_spread_home).toBe('number');
  });
});