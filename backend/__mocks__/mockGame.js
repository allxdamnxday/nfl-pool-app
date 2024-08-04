//__mocks__/mockGame.js
exports.mockGame = {
    event_id: "12345",
    event_uuid: "uuid-12345",
    sport_id: 1,
    event_date: "2023-10-01T12:00:00Z",
    rotation_number_away: 101,
    rotation_number_home: 102,
    away_team_id: 1,
    home_team_id: 2,
    away_team: "Away Team",
    home_team: "Home Team",
    score: {
      event_status: "completed",
      winner_away: 1,
      winner_home: 0,
      score_away: 24,
      score_home: 17,
      score_away_by_period: [7, 10, 7, 0],
      score_home_by_period: [3, 7, 7, 0],
      venue_name: "Stadium Name",
      venue_location: "City, State",
      game_clock: 0,
      display_clock: "00:00",
      game_period: 4,
      broadcast: "ESPN",
      event_status_detail: "Final",
      updated_at: new Date()
    },
    teams_normalized: [
      {
        team_id: 1,
        name: "Away Team",
        mascot: "Mascot A",
        abbreviation: "AT",
        conference_id: 1,
        division_id: 1,
        ranking: 5,
        record: "10-2",
        is_away: true,
        is_home: false
      },
      {
        team_id: 2,
        name: "Home Team",
        mascot: "Mascot H",
        abbreviation: "HT",
        conference_id: 2,
        division_id: 2,
        ranking: 3,
        record: "11-1",
        is_away: false,
        is_home: true
      }
    ],
    schedule: {
      league_name: "NFL",
      conference_competition: true,
      season_type: "Regular",
      season_year: 2023,
      week: 5,
      week_name: "Week 5",
      week_detail: "Details of Week 5",
      event_name: "Game Name",
      attendance: "50000"
    }
  };