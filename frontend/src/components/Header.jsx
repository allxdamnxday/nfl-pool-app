// frontend/src/components/Header.jsx

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaUser, FaSignOutAlt, FaSearch, FaUserFriends, FaDollarSign, FaPlus, FaBars, FaTimes } from 'react-icons/fa';

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
                <div className="flex items-center text-gray-600">
                  <FaUser className="mr-2" />
                  <span>{user.username}</span>
                </div>
              </>
            )}
            {user ? (
              <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full transition-colors duration-200 flex items-center">
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
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden bg-purple-100 p-2 rounded-full text-purple-600 hover:bg-purple-200 transition-colors duration-200"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100">My Pools</Link>
                <Link to="/entries" className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100">My Entries</Link>
                <Link to="/user-entries" className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100">My Picks</Link>
                <Link to="/rules" className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100">Rules</Link>
                <div className="px-4 py-3 text-gray-700 bg-gray-50 flex items-center">
                  <FaUser className="mr-2 text-purple-600" />
                  <span>{user.username}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="w-full px-4 py-3 text-left text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 flex items-center bg-transparent border-none"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-100">Login</Link>
                <Link to="/register" className="block px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-100">Register</Link>
                <Link to="/rules" className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200">Rules</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;