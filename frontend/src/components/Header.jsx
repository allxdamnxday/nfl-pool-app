// frontend/src/components/Header.jsx

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

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
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-nfl-blue flex items-center">
            <FaFootballBall className="mr-2 text-nfl-purple" />
            <span className="hidden sm:inline">Football Eliminator</span>
            <span className="sm:hidden">FBE</span>
          </Link>
          <div className="hidden md:flex space-x-4 items-center">
            {user && (
              <>
                <NavLink to="/dashboard">My Pools</NavLink>
                <NavLink to="/entries">My Entries</NavLink>
                <NavLink to="/user-entries">My Picks</NavLink>
                <NavLink to="/rules">Rules</NavLink>
                <NavLink href="https://footballeliminator.godaddysites.com/poorly-written-blog" external>
                  Eric's Soap Box
                </NavLink>
                <div className="flex items-center text-nfl-blue">
                  <FaUser className="mr-2" />
                  <span>{user.username}</span>
                </div>
              </>
            )}
            {user ? (
              <button onClick={handleLogout} className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 flex items-center">
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">Login</Link>
                <Link to="/register" className="bg-nfl-gold hover:bg-yellow-500 text-nfl-blue font-bold py-2 px-4 rounded-full transition-colors duration-200">Register</Link>
              </>
            )}
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden bg-nfl-purple p-2 rounded-full text-white hover:bg-purple-700 transition-colors duration-200"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
            {user ? (
              <>
                <MobileNavLink to="/dashboard">My Pools</MobileNavLink>
                <MobileNavLink to="/entries">My Entries</MobileNavLink>
                <MobileNavLink to="/user-entries">My Picks</MobileNavLink>
                <MobileNavLink to="/rules">Rules</MobileNavLink>
                <MobileNavLink href="https://footballeliminator.godaddysites.com/poorly-written-blog" external>
                  Eric's Blog
                </MobileNavLink>
                <div className="px-4 py-3 text-nfl-blue bg-gray-100 flex items-center">
                  <FaUser className="mr-2" />
                  <span>{user.username}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="w-full px-4 py-3 text-left text-nfl-purple hover:bg-gray-100 transition-colors duration-200 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login">Login</MobileNavLink>
                <MobileNavLink to="/register">Register</MobileNavLink>
                <MobileNavLink to="/rules">Rules</MobileNavLink>
                <MobileNavLink href="https://footballeliminator.godaddysites.com/poorly-written-blog" external>
                  Blog
                </MobileNavLink>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ to, href, children, external }) {
  if (external) {
    return (
      <a 
        href={href}
        target="_blank" 
        rel="noopener noreferrer"
        className="text-nfl-blue hover:text-nfl-purple transition-colors duration-200"
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className="text-nfl-blue hover:text-nfl-purple transition-colors duration-200">
      {children}
    </Link>
  );
}

function MobileNavLink({ to, href, children, external }) {
  if (external) {
    return (
      <a 
        href={href}
        target="_blank" 
        rel="noopener noreferrer"
        className="block px-4 py-3 text-nfl-blue hover:bg-gray-100 hover:text-nfl-purple transition-colors duration-200 border-b border-gray-200"
      >
        {children}
      </a>
    );
  }
  return (
    <Link 
      to={to} 
      className="block px-4 py-3 text-nfl-blue hover:bg-gray-100 hover:text-nfl-purple transition-colors duration-200 border-b border-gray-200"
    >
      {children}
    </Link>
  );
}

export default Header;