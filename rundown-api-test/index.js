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

const SPORT_ID = 2; // NFL

async function fetchEventsForDate(date) {
  try {
    const response = await rundownApi.get(`/sports/${SPORT_ID}/events/${date}`, {
      params: {
        include: 'all_periods,scores'
      }
    });
    return response.data.events || [];
  } catch (error) {
    console.error(`Error fetching events for date ${date}:`, error.response ? error.response.data : error.message);
    return [];
  }
}

app.get('/populate-events', async (req, res) => {
  try {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 180); // Fetch events for the next 180 days

    let allEvents = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const events = await fetchEventsForDate(dateString);
      allEvents = allEvents.concat(events);
      console.log(`Fetched ${events.length} events for date ${dateString}`);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Total events fetched: ${allEvents.length}`);
    
    // Here, you would typically save these events to your MongoDB
    // For now, we'll just send them as a response
    res.json(allEvents);
  } catch (error) {
    console.error('Error in populate-events:', error);
    res.status(500).json({ error: 'Failed to populate events', details: error.message });
  }
});

// Add a root route for testing
app.get('/', (req, res) => {
  res.send('NFL Events API is running. Use /populate-events to fetch the events.');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});