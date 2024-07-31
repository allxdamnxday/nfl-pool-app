const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/error');
const requestLogger = require('./middleware/requestLogger');
const { validateRegister } = require('./middleware/validators');
const swaggerSpec = require('./config/swaggerOptions');
const apiLimiter = require('./middleware/rateLimiter');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Log the environment variables to verify they are loaded correctly
console.log('Environment Variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
});

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(requestLogger); // Use the request logger middleware
app.use(apiLimiter);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route files
const seasonRoutes = require('./routes/season');
const gameRoutes = require('./routes/games');

const auth = require('./routes/auth');
const pools = require('./routes/pools');
const pickRoutes = require('./routes/picks');
const games = require('./routes/games');
const admin = require('./routes/admin');
const entries = require('./routes/entries');
const userEntries = require('./routes/userEntries');
const requests = require('./routes/requests');

// Mount routers

// Apply stricter rate limiting to auth routes etc if necessary
//app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/auth', auth);
app.use('/api/v1/season', seasonRoutes);
app.use('/api/v1/pools', pools);
app.use('/api/v1/games', games);
app.use('/api/v1/admin', admin);
app.use('/api/v1/entries', entries);
app.use('/api/v1/user/entries', userEntries);
app.use('/api/v1/entries/:entryId/picks', pickRoutes); // Use the pickRoutes here
app.use('/api/v1/pools/:poolId/entries', entries);
app.use('/api/v1/requests', requests);

// Use custom error handler
app.use(errorHandler);

// Example route with validation middleware
app.post('/register', validateRegister, (req, res) => {
  // Handle registration logic here
  res.send('User registered successfully');
});

// Add the connectDB function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });

  return server;
};

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Enable CORS for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}

// Serve static files and handle client-side routing in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Anything that doesn't match the above, send back index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

module.exports = { app, connectDB, startServer };