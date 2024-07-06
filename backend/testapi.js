require('dotenv').config();
const { fetchNFLSchedule } = require('./services/rundownApiService');

const testApiRequest = async () => {
  try {
    const schedule = await fetchNFLSchedule('2023-10-01', 10);
    console.log('Fetched Schedule:', schedule);
  } catch (error) {
    console.error('Error:', error);
  }
};

testApiRequest();
