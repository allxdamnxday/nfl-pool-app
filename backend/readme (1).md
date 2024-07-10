░█████╗░██╗░░░░░██╗░░░░░  
██╔══██╗██║░░░░░██║░░░░░  
███████║██║░░░░░██║░░░░░  
██╔══██║██║░░░░░██║░░░░░  
██║░░██║███████╗███████╗  
╚═╝░░╚═╝╚══════╝╚══════╝  
██████╗░░█████╗░██╗░░░██╗
██╔══██╗██╔══██╗╚██╗░██╔╝
██████╔╝███████║░╚████╔╝░
██╔═══╝░██╔══██║░░╚██╔╝░░
██║░░░░░██║░░██║░░░██║░░░
╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░

#allxdamnxday

# NFL Survivor Pool Backend

## Overview

This repository contains the backend code for the NFL Survivor Pool application. The backend is built with Node.js, Express, and MongoDB, and it provides APIs for user authentication, game management, and more.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v12.x or later)
- npm (v6.x or later)
- MongoDB (local or Atlas)

## Getting Started

### Cloning the Repository

First, clone the repository to your local machine:

```sh
git clone https://github.com/yourusername/nfl-survivor-pool-backend.git
cd nfl-survivor-pool-backend
Installing Dependencies
Install the necessary npm packages:

sh
Copy code
npm install
Environment Variables
Create a .env file in the root directory and add the following environment variables:

env
Copy code
MONGODB_URI=mongodb://localhost:27017/fbepool
PORT=5000
JWT_SECRET=YourJWTSecretKey
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
RAPID_API_KEY=YourRapidAPIKey
RAPID_API_HOST=therundown-therundown-v1.p.rapidapi.com
NODE_ENV=development
Update the values according to your configuration, especially MONGODB_URI if you are using MongoDB Atlas.

Running the Server
Start the server with:

sh
Copy code
npm start
The server should be running at http://localhost:5000.

API Documentation
Swagger Setup
Swagger is used to document the API endpoints. Once the server is running, you can access the Swagger documentation at:

bash
Copy code
http://localhost:5000/api-docs
Adding New Endpoints to Swagger
To add new endpoints to the Swagger documentation, edit the JSDoc comments in the route files located in the routes directory. For example:

js
Copy code
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
Testing
Running Tests
To run the test suite, use the following command:

sh
Copy code
npm test
Testing Instructions
Unit Tests: Ensure that your unit tests are located in the __tests__ directory and are named with a .test.js suffix.
Mocking: Use the jest.mock function to mock external dependencies like email services or third-party APIs.
Database: Before running the tests, make sure your test database is properly configured. The tests will automatically connect to the database and clean up after each run.
Example Test Command
sh
Copy code
npm test
This command will run all the tests located in the __tests__ directory.
