// frontend/src/components/Layout.jsx
import React, { useContext } from 'react';
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
      navigate('/login');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-purple-500 font-bold text-xl">NFL Survivor Pool</Link>
          {user && (
            <div className="flex space-x-4">
              <Link to="/dashboard" className="text-white hover:text-purple-500">My Pools</Link>
              <Link to="/entries" className="text-white hover:text-purple-500">My Entries</Link>
              <Link to="/picks" className="text-white hover:text-purple-500">My Picks</Link>
            </div>
          )}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Invite Friends</button>
                <div className="text-green-400">$0.00</div>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">+</button>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Login</Link>
                <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-200 text-gray-600 py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; 2023 NFL Pool App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;