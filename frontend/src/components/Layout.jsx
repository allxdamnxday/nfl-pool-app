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
      navigate('/');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">NFL Pool App</Link>
          <div className="space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <Link to="/pools" className="hover:text-blue-200">Pools</Link>
                <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="hover:text-blue-200">Register</Link>
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