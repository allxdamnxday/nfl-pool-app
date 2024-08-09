// Using rundown schedule endpoint to get all games for a sport

const axios = require('axios');
const fs = require('fs').promises;

const options = {
  method: 'GET',
  url: 'https://therundown-therundown-v1.p.rapidapi.com/sports/2/schedule',
  params: {
    from: '2024-09-04',
    limit: '300'
  },
  headers: {
    'x-rapidapi-key': '1701031eb1mshc800e3940304359p1bd6ccjsn44c6f4718739',
    'x-rapidapi-host': 'therundown-therundown-v1.p.rapidapi.com'
  }
};

const fetchAndSaveResponse = async () => {
  try {
    const response = await axios.request(options);
    const data = JSON.stringify(response.data, null, 2);
    await fs.writeFile('events-games.json', data);
    console.log('Response saved to events-games.json');
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};

fetchAndSaveResponse();