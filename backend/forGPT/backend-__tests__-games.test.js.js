// backend/__tests__/games.test.js
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Game = require('../models/Game');

describe('Game Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/v1/games', () => {
    it('should return all games', async () => {
      const res = await request(app).get('/api/v1/games').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('GET /api/v1/games/:id', () => {
    it('should return a single game', async () => {
      const game = await Game.create({
        id: '1',
        event_id: '1',
        event_uuid: 'uuid1',
        sport_id: 1,
        season_type: 'regular',
        season_year: 2021,
        away_team_id: 1,
        home_team_id: 2,
        away_team: 'Away Team',
        home_team: 'Home Team',
        date_event: new Date(),
        neutral_site: false,
        conference_competition: false,
        away_score: 0,
        home_score: 0,
        league_name: 'NFL',
        event_name: 'Game 1',
        event_location: 'Location 1',
        attendance: 1000,
        updated_at: new Date(),
        event_status: 'scheduled',
        event_status_detail: 'Scheduled'
      });

      const res = await request(app).get(`/api/v1/games/${game._id}`).set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', game._id.toString());
    });
  });

  describe('POST /api/v1/games/fetch', () => {
    it('should fetch and store games from The Rundown API', async () => {
      const res = await request(app)
        .post('/api/v1/games/fetch')
        .set('Authorization', `Bearer ${token}`)
        .send({ season_year: 2021, sport_id: 1 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveLength(res.body.count);
    });
  });
});
