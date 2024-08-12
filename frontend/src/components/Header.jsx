// frontend/src/components/Header.jsx

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaUser, FaSignOutAlt, FaSearch, FaUserFriends, FaDollarSign, FaPlus } from 'react-icons/fa';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-600 flex items-center">
            <img src="/img/Logo_FBE@2x.png" alt="Football Eliminator" className="h-8 w-auto mr-2" />
            <span className="hidden sm:inline">Football Eliminator</span>
            <span className="sm:hidden">FBE</span>
          </Link>
          <div className="hidden md:flex space-x-4 items-center">
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">My Pools</Link>
                <Link to="/entries" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">My Entries</Link>
                <Link to="/user-entries" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">My Picks</Link>
                <Link to="/rules" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Rules</Link>
                {/* Commented out: Invite Friends button
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 flex items-center">
                  <FaUserFriends className="mr-2" />
                  Invite Friends
                </button>
                */}
                {/* Commented out: Money display
                <div className="text-green-600 flex items-center">
                  <FaDollarSign className="mr-1" />
                  0.00
                </div>
                */}
                {/* Commented out: Add money button
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
                  <FaPlus />
                </button>
                */}
              </>
            )}
            {user ? (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 flex items-center">
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">Register</Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 focus:outline-none">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.829z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">My Pools</Link>
                <Link to="/entries" className="block py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">My Entries</Link>
                <Link to="/picks" className="block py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">My Picks</Link>
                <Link to="/rules" className="block py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">Rules</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors duration-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-purple-600 hover:text-purple-700 transition-colors duration-200">Login</Link>
                <Link to="/register" className="block py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200">Register</Link>
                <Link to="/rules" className="block py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">Rules</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;