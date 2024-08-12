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
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'https://footballeliminator.com', 'https://www.footballeliminator.com'],
  credentials: true
}));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.footballeliminator.com"],
        frameSrc: ["'self'"],
        frameAncestors: ["'self'", "https://footballeliminator.com", "https://www.footballeliminator.com"],
      },
    },
  })
);
app.use(xss());
app.use(hpp());
app.use(requestLogger); // Use the request logger middleware
app.use(apiLimiter);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route files
const seasonRoutes = require('./routes/season');

const auth = require('./routes/auth');
const pools = require('./routes/pools');
const pickRoutes = require('./routes/picks');
const games = require('./routes/games');
const admin = require('./routes/admin');
const entries = require('./routes/entries');
const userEntries = require('./routes/userEntries');
const requests = require('./routes/requests');
const blogs = require('./routes/blogs');
const commentRoutes = require('./routes/commentRoutes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/season', seasonRoutes);
app.use('/api/v1/pools', pools);
app.use('/api/v1/games', games);
app.use('/api/v1/admin', admin);
app.use('/api/v1/entries', entries);
app.use('/api/v1/user/entries', userEntries);
app.use('/api/v1/picks', pickRoutes);
app.use('/api/v1/pools/:poolId/entries', entries);
app.use('/api/v1/requests', requests);
app.use('/api/v1/blogs', blogs);
app.use('/api/v1/blogs', commentRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Use custom error handler
app.use(errorHandler);

// Example route with validation middleware
app.post('/register', validateRegister, (req, res) => {
  // Handle registration logic here
  res.send('User registered successfully');
});

// Add the connectDB function
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
};

const gracefulShutdown = (server) => {
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
};

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  gracefulShutdown(server);

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

module.exports = { app, connectDB, startServer };