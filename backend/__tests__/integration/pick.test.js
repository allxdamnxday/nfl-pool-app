// __tests__/integration/pick.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../../server');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const Game = require('../../models/Game');
const Pick = require('../../models/Pick');

let token;

beforeAll(async () => {
  await connectDB();
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
  token = user.getSignedJwtToken();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Pick Integration', () => {
  it('should create a pool, add a game, and submit a pick', async () => {
    // Create a pool
    const poolRes = await request(app)
      .post('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Pool',
        season: 2024,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450
      });

    expect(poolRes.statusCode).toBe(201);
    const poolId = poolRes.body.data._id;

    // Create a game
    const gameRes = await request(app)
      .post('/api/v1/games')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event_id: 'test123',
        event_uuid: 'test-uuid-123', // Add this line
        sport_id: 2,
        event_date: new Date().toISOString(),
        rotation_number_away: 101,
        rotation_number_home: 102,
        teams_normalized: [
          {
            team_id: 1,
            name: 'Away Team',
            mascot: 'Eagles',
            abbreviation: 'PHI',
            is_away: true,
            is_home: false
          },
          {
            team_id: 2,
            name: 'Home Team',
            mascot: 'Cowboys',
            abbreviation: 'DAL',
            is_away: false,
            is_home: true
          }
        ],
        schedule: {
          season_type: 'Regular Season',
          season_year: 2024,
          week: 1,
          week_name: 'Week 1',
          week_detail: 'Sep 5-9',
          event_name: 'Away Team at Home Team',
          attendance: '0'
        }
      });

    expect(gameRes.statusCode).toBe(201);
    const gameId = gameRes.body.data._id;

    // Submit a pick
    const pickRes = await request(app)
      .post(`/api/v1/pools/${poolId}/picks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        game: gameId,
        team: 'Home Team',
        weekNumber: 1
      });

    expect(pickRes.statusCode).toBe(201);
    expect(pickRes.body.data).toHaveProperty('user');
    expect(pickRes.body.data).toHaveProperty('pool', poolId);
    expect(pickRes.body.data).toHaveProperty('game', gameId);
    expect(pickRes.body.data).toHaveProperty('team', 'Home Team');
  });
});