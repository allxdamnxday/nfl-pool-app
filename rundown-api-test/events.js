const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

const rundownApi = axios.create({
  baseURL: 'https://therundown-therundown-v1.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
    'X-RapidAPI-Host': 'therundown-therundown-v1.p.rapidapi.com'
  }
});

app.get('/events/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const response = await rundownApi.get(`/sports/2/events/${date}`, {
      params: {
        include: 'scores',
        affiliate_ids: '1,2,3',
        offset: '0'
      }
    });

    console.log('Events data:');
    console.log(JSON.stringify(response.data, null, 2));

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching events data:', error);
    res.status(500).json({ error: 'Failed to fetch events data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});