// frontend/src/components/Header.jsx

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-500">NFL Pool App</Link>
          <div className="space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-purple-300">Dashboard</Link>
                <Link to="/pools" className="hover:text-purple-300">Pools</Link>
                <button onClick={handleLogout} className="hover:text-purple-300">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-purple-300">Login</Link>
                <Link to="/register" className="hover:text-purple-300">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; 2023 NFL Pool App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;