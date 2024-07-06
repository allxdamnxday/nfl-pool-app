// backend/config/rundownApi.js
module.exports = {
    BASE_URL: 'https://therundown-therundown-v1.p.rapidapi.com/sports/2/events/2020-09-20',
    RAPID_API_KEY: process.env.RAPID_API_KEY,
    RAPID_API_HOST: 'therundown-therundown-v1.p.rapidapi.com',
    SPORT_ID: {
      NFL: 2
    },
    MARKET_ID: {
      MONEYLINE: 1,
      SPREAD: 3,
      TOTAL: 2
    },
    PARTICIPANT_TYPE: {
      TEAM: 'TYPE_TEAM',
      PLAYER: 'TYPE_PLAYER',
      GAME: 'TYPE_RESULT'
    }
  };