// frontend/src/components/Header.jsx

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

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
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 mr-2 text-nfl-purple"
            >
              <path
                fill="currentColor"
                d="M20.9,2.5c-0.7-0.7-2-1.1-3.7-1.1c-2.5,0-5.7,0.8-8.7,2.4C5.5,5.5,3,7.7,1.7,9.8c-1.7,2.7-1.5,4.8-0.6,5.7
                c0.5,0.5,1.3,0.8,2.3,0.8c1.8,0,4.2-0.9,6.7-2.4c3-1.8,5.5-4,6.8-6.1C18.5,5.1,18.3,3,17.4,2.1C18.6,2.2,19.6,2.5,20,2.9
                c0.4,0.4,0.9,1.5,0.4,3.6c-0.5,2.5-2.2,5.3-4.7,7.7c-3.9,3.9-9.1,6.4-11.9,5.7c-0.7-0.2-1.2-0.5-1.4-1c-0.3-0.6-0.1-1.5,0.5-2.4
                c0.6-1,1.6-2,2.8-3c0.4-0.3,0.4-0.9,0.1-1.3c-0.3-0.4-0.9-0.4-1.3-0.1c-1.4,1.1-2.5,2.3-3.2,3.5c-0.9,1.5-1.1,3-0.5,4.2
                c0.5,0.9,1.4,1.5,2.5,1.8c0.5,0.1,1.1,0.2,1.7,0.2c3.3,0,7.4-2.2,10.6-5.4c2.8-2.8,4.6-5.9,5.2-8.8C21.9,5.1,21.7,3.3,20.9,2.5z"
              />
            </svg>
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
                <NavLink to="/blogs">Eric's Blog</NavLink>
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
                <MobileNavLink to="/blogs">Eric's Blog</MobileNavLink>
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