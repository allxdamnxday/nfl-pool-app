import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaUser, FaSignOutAlt, FaDollarSign, FaPlus, FaUserFriends, FaBars, FaTimes } from 'react-icons/fa';

function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-purple-500 flex items-center">
              <FaFootballBall className="mr-2" />
              <span className="hidden sm:inline">NFL Survivor Pool</span>
              <span className="sm:hidden">NFL Pool</span>
            </Link>
            <div className="hidden md:flex space-x-2 lg:space-x-4 items-center">
              {user && (
                <>
                  <Link to="/dashboard" className="text-white hover:text-purple-300 transition-colors duration-200 text-sm lg:text-base">My Pools</Link>
                  <Link to="/entries" className="text-white hover:text-purple-300 transition-colors duration-200 text-sm lg:text-base">My Entries</Link>
                  <Link to="/picks" className="text-white hover:text-purple-300 transition-colors duration-200 text-sm lg:text-base">My Picks</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/requests" className="text-white hover:text-purple-300 transition-colors duration-200 text-sm lg:text-base">Admin</Link>
                  )}
                </>
              )}
              {user ? (
                <>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 lg:py-2 lg:px-4 rounded transition-colors duration-200 flex items-center text-xs lg:text-base">
                    <FaUserFriends className="mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Invite Friends</span>
                    <span className="sm:hidden">Invite</span>
                  </button>
                  <div className="text-green-400 flex items-center text-sm lg:text-base">
                    <FaDollarSign className="mr-1" />
                    0.00
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 lg:py-2 lg:px-4 rounded transition-colors duration-200 text-xs lg:text-base">
                    <FaPlus />
                  </button>
                  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 lg:py-2 lg:px-4 rounded transition-colors duration-200 flex items-center text-xs lg:text-base">
                    <FaSignOutAlt className="mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 lg:py-2 lg:px-4 rounded transition-colors duration-200 text-xs lg:text-base">Login</Link>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 lg:py-2 lg:px-4 rounded transition-colors duration-200 text-xs lg:text-base">Register</Link>
                </>
              )}
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="mt-4 md:hidden">
              {user && (
                <>
                  <Link to="/dashboard" className="block py-2 text-white hover:text-purple-300 transition-colors duration-200">My Pools</Link>
                  <Link to="/entries" className="block py-2 text-white hover:text-purple-300 transition-colors duration-200">My Entries</Link>
                  <Link to="/picks" className="block py-2 text-white hover:text-purple-300 transition-colors duration-200">My Picks</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/requests" className="block py-2 text-white hover:text-purple-300 transition-colors duration-200">Admin</Link>
                  )}
                </>
              )}
              {user ? (
                <>
                  <button className="block w-full text-left py-2 text-white hover:text-purple-300 transition-colors duration-200">Invite Friends</button>
                  <div className="py-2 text-green-400 flex items-center"><FaDollarSign className="mr-1" />0.00</div>
                  <button className="block w-full text-left py-2 text-white hover:text-purple-300 transition-colors duration-200">Add Funds</button>
                  <button onClick={handleLogout} className="block w-full text-left py-2 text-white hover:text-purple-300 transition-colors duration-200">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-white hover:text-purple-300 transition-colors duration-200">Login</Link>
                  <Link to="/register" className="block py-2 text-white hover:text-purple-300 transition-colors duration-200">Register</Link>
                </>
              )}
            </div>
          )}
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; 2023 NFL Pool App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;