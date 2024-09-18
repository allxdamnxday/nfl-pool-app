// frontend/src/components/MobileMenu.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import {
  FaTrophy,
  FaClipboardList,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaTable
} from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';

function MobileMenu({
  isOpen,
  toggleMobileMenu,
  isAuthenticated,
  handleLogout,
}) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="mobile-menu-transition"
      unmountOnExit
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
        <div className="w-3/4 bg-nfl-white h-full p-6 overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={toggleMobileMenu}
            className="absolute top-4 right-4 text-nfl-purple hover:text-nfl-purple/80 focus:outline-none focus:ring-2 focus:ring-nfl-purple rounded"
            aria-label="Close Mobile Menu"
          >
            <FaTimes className="h-6 w-6" />
          </button>

          {/* Logo or Header in Mobile Menu */}
          <div className="mb-8 flex items-center">
            <Link to="/" onClick={toggleMobileMenu} className="flex items-center">
              <svg
                className="w-8 h-8 mr-2 text-nfl-blue"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-nfl-blue to-nfl-purple">
                Football Eliminator
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            {isAuthenticated && (
              <>
                <MobileNavLink to="/dashboard" icon={FaTrophy} onClick={toggleMobileMenu}>
                  My Pools
                </MobileNavLink>
                <MobileNavLink to="/entries" icon={FaClipboardList} onClick={toggleMobileMenu}>
                  My Entries
                </MobileNavLink>
                <MobileNavLink to="/user-entries" icon={FaUser} onClick={toggleMobileMenu}>
                  My Picks
                </MobileNavLink>
                <MobileNavLink to="/pool-picks-selection" icon={FaTrophy} onClick={toggleMobileMenu}>
                  View Pool Picks
                </MobileNavLink>
                <MobileNavLink to="/week-picks" icon={FaTable} onClick={toggleMobileMenu}>
                  Weekly Picks Temp
                </MobileNavLink>
                <MobileNavLink to="/account-settings" icon={FaUser} onClick={toggleMobileMenu}>
                  Account Settings
                </MobileNavLink>
                <hr className="border-gray-300 my-4" />
              </>
            )}
            <MobileNavLink to="/rules" icon={FaInfoCircle} onClick={toggleMobileMenu}>
              Rules
            </MobileNavLink>
            <MobileNavLink to="/blogs" icon={FaInfoCircle} onClick={toggleMobileMenu}>
              Eric's Blog
            </MobileNavLink>
            {isAuthenticated ? (
              <LogoutButton onClick={() => { handleLogout(); toggleMobileMenu(); }} />
            ) : (
              <>
                <LoginButton mobile onClick={toggleMobileMenu} />
                <RegisterButton mobile onClick={toggleMobileMenu} />
              </>
            )}
          </nav>
        </div>
      </div>
    </CSSTransition>,
    document.body
  );
}

function MobileNavLink({ to, children, icon: Icon, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center text-nfl-blue hover:text-nfl-purple transition-colors duration-200 text-lg font-medium p-2 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:text-nfl-purple"
    >
      {Icon && <Icon className="mr-3 text-nfl-purple" />}
      {children}
    </Link>
  );
}

function LoginButton({ mobile, onClick }) {
  const baseClasses =
    'bg-gradient-to-r from-nfl-blue to-nfl-purple hover:from-nfl-purple hover:to-nfl-blue text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center';
  const mobileClasses = mobile ? 'w-full' : '';

  return (
    <Link
      to="/login"
      onClick={onClick}
      className={`${baseClasses} ${mobileClasses}`}
    >
      <FaSignInAlt className="mr-2" />
      Login
    </Link>
  );
}

function RegisterButton({ mobile, onClick }) {
  const baseClasses =
    'bg-gradient-to-r from-nfl-purple to-purple-700 hover:from-purple-700 hover:to-nfl-purple text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center';
  const mobileClasses = mobile ? 'w-full' : '';

  return (
    <Link
      to="/register"
      onClick={onClick}
      className={`${baseClasses} ${mobileClasses}`}
    >
      <FaUserPlus className="mr-2" />
      Register
    </Link>
  );
}

function LogoutButton({ onClick, mobile }) {
  const baseClasses =
    'bg-gradient-to-r from-nfl-purple to-purple-700 hover:from-purple-700 hover:to-nfl-purple text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center';
  const mobileClasses = mobile ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${mobileClasses}`}
    >
      <FaSignOutAlt className="mr-2" />
      Logout
    </button>
  );
}

export default MobileMenu;
