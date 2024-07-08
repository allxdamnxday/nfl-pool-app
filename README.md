NFL Survivor Pool Backend
This repository contains the backend of the NFL Survivor Pool web application, built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The backend handles user authentication, pool management, picks, game data synchronization, and real-time updates via WebSockets.

Table of Contents
Installation
Usage
API Documentation
Project Structure
Environment Variables
Testing
Contributing
License
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/nfl-survivor-pool-backend.git
cd nfl-survivor-pool-backend
Install dependencies:

bash
Copy code
npm install
Set up environment variables:

Create a .env file in the root directory and add the necessary environment variables as described in the Environment Variables section.

Run the server:

bash
Copy code
npm run dev
Usage
The backend server will be running on http://localhost:5000 by default. You can access the API endpoints as described in the API Documentation.

API Documentation
The API documentation is generated using Swagger and can be accessed at http://localhost:5000/api-docs.

Project Structure
bash
Copy code
.
├── controllers
│   ├── auth.js
│   ├── games.js
│   ├── picks.js
│   ├── pools.js
├── middleware
│   ├── advancedResults.js
│   ├── async.js
│   ├── auth.js
│   ├── error.js
├── models
│   ├── Blacklist.js
│   ├── Game.js
│   ├── Market.js
│   ├── NFLTeam.js
│   ├── Pick.js
│   ├── Player.js
│   ├── Pool.js
│   ├── User.js
│   ├── UserPoolStats.js
├── routes
│   ├── admin.js
│   ├── auth.js
│   ├── games.js
│   ├── picks.js
│   ├── pools.js
├── services
│   ├── dataSyncService.js
│   ├── rundownApiService.js
│   ├── websocketService.js
├── utils
│   ├── errorResponse.js
│   ├── sendEmail.js
├── __mocks__
│   ├── sendEmail.js
├── __tests__
│   ├── auth.test.js
│   ├── basic-auth.test.js
│   ├── picks.test.js
│   ├── pools.test.js
├── config
│   ├── rundownApi.js
├── .env
├── package.json
├── server.js
Environment Variables
Create a .env file in the root directory and add the following environment variables:

makefile
Copy code
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
Run the tests:

bash
Copy code
npm test
Watch tests:

bash
Copy code
npm run test:watch
The tests use jest and supertest to ensure the functionality of the API endpoints.

Contributing
Fork the repository.
Create your feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -am 'Add some feature').
Push to the branch (git push origin feature/your-feature).
Create a new Pull Request.
License
This project is licensed under the MIT License. See the LICENSE file for details.
