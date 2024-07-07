const request = require('supertest');
const app = require('../server');
const Pick = require('../models/Pick');
const Pool = require('../models/Pool');
const User = require('../models/User');
const Game = require('../models/Game');
const mongoose = require('mongoose');

describe('Picks Endpoints', () => {
  let token, poolId, gameId;

  beforeEach(async () => {
    await Pick.deleteMany({});
    await Pool.deleteMany({});
    await User.deleteMany({});
    await Game.deleteMany({});

    // Create a user and get token for authenticated requests
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    token = user.getSignedJwtToken();

    // Create a pool
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: user._id
    });
    poolId = pool._id;

    // Create a game
    const game = await Game.create({
      event_id: 'test123',
      away_team: 'Away Team',
      home_team: 'Home Team',
      date_event: new Date(),
      season: 2023,
      week: 1
    });
    gameId = game._id;
  });

  it('should create a new pick', async () => {
    const res = await request(app)
      .post(`/api/v1/pools/${poolId}/picks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        game: gameId,
        team: 'Home Team',
        weekNumber: 1
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('team', 'Home Team');
  });

  it('should get picks for a pool', async () => {
    // First, create a pick
    await Pick.create({
      user: mongoose.Types.ObjectId(),
      pool: poolId,
      game: gameId,
      team: 'Away Team',
      weekNumber: 1
    });

    const res = await request(app)
      .get(`/api/v1/pools/${poolId}/picks`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});