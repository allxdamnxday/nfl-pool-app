// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Football Eliminator</h1>
      <p className="mb-4">Join the excitement of NFL survivor pools!</p>
      <div>
        <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Sign Up</Link>
        <Link to="/login" className="bg-green-500 text-white px-4 py-2 rounded">Login</Link>
      </div>
    </div>
  );
}

export default Home;