NFL Survivor Pool Backend
This repository contains the backend of the NFL Survivor Pool web application, built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The backend handles user authentication, pool management, picks, game data synchronization, and real-time updates via WebSockets.

Usage
The backend server will be running on http://localhost:5000 by default. You can access the API endpoints as described in the API Documentation.

API Documentation
The API documentation is generated using Swagger and can be accessed at http://localhost:5000/api-docs.

.env variables:
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
SMTP_HOST=smtp.your-email.com
SMTP_PORT=587
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_email_password
FROM_NAME=NFL Survivor Pool
FROM_EMAIL=noreply@nflsurvivorpool.com
RAPID_API_KEY=your_rapid_api_key

Testing
Run the tests: npm test
