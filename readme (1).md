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

# NFL Survivor Pool Web App

This project is a web application for managing NFL Survivor Pools. It uses a MERN stack (MongoDB, Express.js, React, Node.js) with Vite as the build tool for the frontend.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (v4 or later)

## Installation

### Clone the repository

```bash
git clone https://github.com/your-username/nfl-survivor-pool.git
cd nfl-survivor-pool
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory and add the following environment variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
   Replace `your_mongodb_connection_string` and `your_jwt_secret` with your actual MongoDB connection string and a secure JWT secret.

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory and add the following:
   ```
   VITE_API_URL=http://localhost:5000/api/v1
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Running the Application

- The backend server will run on `http://localhost:5000`
- The frontend development server will run on `http://localhost:3000`

You can access the application by opening `http://localhost:3000` in your web browser.

## Available Scripts

In the project directory, you can run:

### Backend

- `npm run dev`: Starts the backend server in development mode
- `npm start`: Starts the backend server in production mode
- `npm test`: Runs the backend tests

### Frontend

- `npm run dev`: Starts the Vite development server
- `npm run build`: Builds the app for production
- `npm run preview`: Locally preview the production build

## Project Structure

```
nfl-survivor-pool/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── README.md
```