const nock = require('nock');
const rundownApi = require('../../services/rundownApiService');
const config = require('../../config/rundownApi');

describe('RundownApiService', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('fetchSportsList should fetch sports list', async () => {
    const mockResponse = [{ id: 1, name: 'Football' }];
    nock(config.BASE_URL)
      .get('/sports')
      .reply(200, mockResponse);

    const result = await rundownApi.fetchSportsList();
    expect(result).toEqual(mockResponse);
  });

  test('fetchNFLSchedule should fetch NFL schedule', async () => {
    const mockResponse = { schedules: [{ event_id: '1' }] };
    nock(config.BASE_URL)
      .get('/sports/2/schedule')
      .query({ from: '2024-09-02T00:00:00.000Z', limit: 400 })
      .reply(200, mockResponse);

    const result = await rundownApi.fetchNFLSchedule(new Date('2024-09-02'));
    expect(result).toEqual(mockResponse.schedules);
  });

  test('fetchEventDetails should fetch event details', async () => {
    const mockResponse = {
      event_id: '1',
      sport_id: 2,
      event_date: '2024-08-08T23:00:00Z',
      teams_normalized: [{ name: 'Team A' }, { name: 'Team B' }],
      score: { event_status: 'STATUS_IN_PROGRESS', score_away: 3, score_home: 13 },
      lines: { 3: { total: { total_over: 50 } } }
    };
    nock(config.BASE_URL)
      .get('/events/1')
      .query({ include: 'all_periods' })
      .reply(200, mockResponse);

    const result = await rundownApi.fetchEventDetails('1');
    expect(result).toEqual({
      event_id: '1',
      sport_id: 2,
      event_date: '2024-08-08T23:00:00Z',
      away_team: { name: 'Team A' },
      home_team: { name: 'Team B' },
      total: 50,
      event_status: 'STATUS_IN_PROGRESS',
      score_away: 3,
      score_home: 13,
      broadcast: undefined,
      venue_name: undefined,
      venue_location: undefined
    });
  });

  test('fetchNFLEvents should fetch NFL events', async () => {
    const mockResponse = { events: [{ event_id: '1' }] };
    nock(config.BASE_URL)
      .get('/sports/2/events/2024-08-08T00:00:00.000Z')
      .query({ include: 'scores', affiliate_ids: '4', offset: '0' })
      .reply(200, mockResponse);

    const result = await rundownApi.fetchNFLEvents(new Date('2024-08-08'));
    expect(result).toEqual(mockResponse.events);
  });
});