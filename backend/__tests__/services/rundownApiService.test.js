const nock = require('nock');
const rundownApi = require('../../services/rundownApiService');
const config = require('../../config/rundownApi');

describe('RundownApiService', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('fetchNFLSchedule should fetch NFL schedule', async () => {
    const mockResponse = {
      schedules: [{
        event_id: '1',
        event_uuid: 'uuid1',
        sport_id: 2,
        date_event: '2024-09-02T00:00:00Z',
        away_team_id: 'away1',
        home_team_id: 'home1',
        away_team: 'Team A',
        home_team: 'Team B',
        neutral_site: false,
        season_type: 'regular',
        season_year: 2024,
        away_score: 0,
        home_score: 0,
        league_name: 'NFL',
        event_name: 'Team A vs Team B',
        broadcast: 'CBS',
        event_location: 'Stadium',
        attendance: 50000,
        updated_at: '2024-09-02T01:00:00Z'
      }]
    };

    nock(config.BASE_URL)
      .get('/sports/2/schedule')
      .query({ from: '2024-09-02T00:00:00.000Z', limit: 400 })
      .reply(200, mockResponse);

    const result = await rundownApi.fetchNFLSchedule(new Date('2024-09-02'));
    expect(result).toEqual([{
      event_id: '1',
      event_uuid: 'uuid1',
      sport_id: 2,
      event_date: '2024-09-02T00:00:00Z',
      away_team_id: 'away1',
      home_team_id: 'home1',
      away_team: 'Team A',
      home_team: 'Team B',
      neutral_site: false,
      season_type: 'regular',
      season_year: 2024,
      score: {
        away_score: 0,
        home_score: 0,
      },
      league_name: 'NFL',
      event_name: 'Team A vs Team B',
      broadcast: 'CBS',
      event_location: 'Stadium',
      attendance: 50000,
      updated_at: '2024-09-02T01:00:00Z'
    }]);
  });

  test('fetchNFLEvents should fetch NFL events', async () => {
    const mockResponse = {
      events: [{
        event_id: '1',
        event_uuid: 'uuid1',
        sport_id: 2,
        event_date: '2024-08-08T23:00:00Z',
        rotation_number_away: 101,
        rotation_number_home: 102,
        score: {
          event_status: 'STATUS_IN_PROGRESS',
          winner_away: 0,
          winner_home: 0,
          score_away: 3,
          score_home: 13,
          score_away_by_period: [3],
          score_home_by_period: [13],
          venue_name: 'Stadium',
          venue_location: 'City, State',
          game_clock: 900,
          display_clock: '15:00',
          game_period: 1,
          broadcast: 'CBS',
          event_status_detail: 'In Progress',
          updated_at: '2024-08-08T23:30:00Z'
        },
        teams: [
          { team_id: 'away1', team_normalized_id: 1, name: 'Team A', is_away: true, is_home: false },
          { team_id: 'home1', team_normalized_id: 2, name: 'Team B', is_away: false, is_home: true }
        ],
        teams_normalized: [
          { team_id: 1, name: 'Team A', mascot: 'Mascot A', abbreviation: 'TA', conference_id: 'conf1', division_id: 'div1', ranking: 1, record: '0-0', is_away: true, is_home: false, conference: 'Conference A', division: 'Division A' },
          { team_id: 2, name: 'Team B', mascot: 'Mascot B', abbreviation: 'TB', conference_id: 'conf1', division_id: 'div1', ranking: 2, record: '0-0', is_away: false, is_home: true, conference: 'Conference A', division: 'Division A' }
        ],
        schedule: {
          league_name: 'NFL',
          conference_competition: false,
          season_type: 'regular',
          season_year: 2024,
          event_name: 'Team A vs Team B',
          attendance: 50000
        },
        lines: {
          4: { spread: { point_spread_away: -3.5 } }
        }
      }]
    };

    nock(config.BASE_URL)
      .get('/sports/2/events/2024-08-08T00:00:00.000Z')
      .query({ include: 'all_periods,scores', affiliate_ids: '4', offset: '0' })
      .reply(200, mockResponse);

    const result = await rundownApi.fetchNFLEvents(new Date('2024-08-08'));
    expect(result).toEqual([{
      event_id: '1',
      event_uuid: 'uuid1',
      sport_id: 2,
      event_date: '2024-08-08T23:00:00Z',
      rotation_number_away: 101,
      rotation_number_home: 102,
      score: {
        event_status: 'STATUS_IN_PROGRESS',
        winner_away: 0,
        winner_home: 0,
        score_away: 3,
        score_home: 13,
        score_away_by_period: [3],
        score_home_by_period: [13],
        venue_name: 'Stadium',
        venue_location: 'City, State',
        game_clock: 900,
        display_clock: '15:00',
        game_period: 1,
        broadcast: 'CBS',
        event_status_detail: 'In Progress',
        updated_at: '2024-08-08T23:30:00Z'
      },
      teams: [
        { team_id: 'away1', team_normalized_id: 1, name: 'Team A', is_away: true, is_home: false },
        { team_id: 'home1', team_normalized_id: 2, name: 'Team B', is_away: false, is_home: true }
      ],
      teams_normalized: [
        { team_id: 1, name: 'Team A', mascot: 'Mascot A', abbreviation: 'TA', conference_id: 'conf1', division_id: 'div1', ranking: 1, record: '0-0', is_away: true, is_home: false, conference: 'Conference A', division: 'Division A' },
        { team_id: 2, name: 'Team B', mascot: 'Mascot B', abbreviation: 'TB', conference_id: 'conf1', division_id: 'div1', ranking: 2, record: '0-0', is_away: false, is_home: true, conference: 'Conference A', division: 'Division A' }
      ],
      schedule: {
        league_name: 'NFL',
        conference_competition: false,
        season_type: 'regular',
        season_year: 2024,
        event_name: 'Team A vs Team B',
        attendance: 50000
      },
      lines: { spread: { point_spread_away: -3.5 } }
    }]);
  });
});