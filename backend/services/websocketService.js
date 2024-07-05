// backend/services/websocketService.js
const WebSocket = require('ws');
const config = require('../config/rundownApi');

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 5000; // 5 seconds
  }

  connect() {
    this.ws = new WebSocket(`wss://therundown.io/api/v2/ws?key=${config.API_KEY}`);

    this.ws.on('open', () => {
      console.log('WebSocket connected');
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      // Handle the message (update database, notify clients, etc.)
      console.log('Received WebSocket message:', message);
    });

    this.ws.on('close', () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = new WebSocketService();