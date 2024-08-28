// frontend/src/components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignInAlt, FaUserPlus, FaBars, FaTrophy, FaClipboardList, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPoolsMenuOpen, setIsPoolsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const poolsDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (poolsDropdownRef.current && !poolsDropdownRef.current.contains(event.target)) {
        setIsPoolsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="bg-white shadow-lg">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <svg className="w-8 h-8 mr-2 text-nfl-blue" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M20.9,2.5c-0.7-0.7-2-1.1-3.7-1.1c-2.5,0-5.7,0.8-8.7,2.4C5.5,5.5,3,7.7,1.7,9.8c-1.7,2.7-1.5,4.8-0.6,5.7
                c0.5,0.5,1.3,0.8,2.3,0.8c1.8,0,4.2-0.9,6.7-2.4c3-1.8,5.5-4,6.8-6.1C18.5,5.1,18.3,3,17.4,2.1C18.6,2.2,19.6,2.5,20,2.9
                c0.4,0.4,0.9,1.5,0.4,3.6c-0.5,2.5-2.2,5.3-4.7,7.7c-3.9,3.9-9.1,6.4-11.9,5.7c-0.7-0.2-1.2-0.5-1.4-1c-0.3-0.6-0.1-1.5,0.5-2.4
                c0.6-1,1.6-2,2.8-3c0.4-0.3,0.4-0.9,0.1-1.3c-0.3-0.4-0.9-0.4-1.3-0.1c-1.4,1.1-2.5,2.3-3.2,3.5c-0.9,1.5-1.1,3-0.5,4.2
                c0.5,0.9,1.4,1.5,2.5,1.8c0.5,0.1,1.1,0.2,1.7,0.2c3.3,0,7.4-2.2,10.6-5.4c2.8-2.8,4.6-5.9,5.2-8.8C21.9,5.1,21.7,3.3,20.9,2.5z"
              />
            </svg>
            <span className="text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-nfl-blue to-nfl-purple">
              Football Eliminator
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-nfl-purple hover:text-nfl-purple/80 mobile-menu-button"
          >
            <FaBars className="h-6 w-6" />
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {isAuthenticated && (
              <>
                <PoolsMenu isOpen={isPoolsMenuOpen} setIsOpen={setIsPoolsMenuOpen} dropdownRef={poolsDropdownRef} />
                <UserMenu isOpen={isUserMenuOpen} setIsOpen={setIsUserMenuOpen} dropdownRef={userDropdownRef} />
              </>
            )}
            <NavLink to="/rules">Rules</NavLink>
            <NavLink to="/blogs">Eric's Blog</NavLink>
            {isAuthenticated ? (
              <LogoutButton onClick={handleLogout} />
            ) : (
              <>
                <LoginButton />
                <RegisterButton />
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <CSSTransition
          in={isMobileMenuOpen}
          timeout={300}
          classNames="mobile-menu"
          unmountOnExit
        >
          <div ref={mobileMenuRef} className="md:hidden mt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <NavLink to="/pools" mobile>My Pools</NavLink>
                <NavLink to="/entries" mobile>My Entries</NavLink>
                <NavLink to="/user-entries" mobile>My Picks</NavLink>
                <NavLink to="/pool-picks-selection" mobile>View Pool Picks</NavLink>
              </>
            ) : null}
            <NavLink to="/rules" mobile>Rules</NavLink>
            <NavLink to="/blogs" mobile>Eric's Blog</NavLink>
            {isAuthenticated ? (
              <LogoutButton onClick={handleLogout} mobile />
            ) : (
              <>
                <LoginButton mobile />
                <RegisterButton mobile />
              </>
            )}
          </div>
        </CSSTransition>
      </nav>
    </header>
  );
}

function NavLink({ to, children, mobile }) {
  const baseClasses = "text-nfl-blue hover:text-nfl-purple transition-colors duration-200 font-medium";
  const mobileClasses = mobile ? "block py-2" : "relative group";
  const desktopClasses = !mobile && "inline-block";

  return (
    <Link to={to} className={`${baseClasses} ${mobileClasses} ${desktopClasses}`}>
      {children}
      {!mobile && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-nfl-purple transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
      )}
    </Link>
  );
}

function PoolsMenu({ isOpen, setIsOpen, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-nfl-purple hover:text-nfl-purple/80 px-4 py-2 transition-colors duration-200"
      >
        <FaTrophy className="mr-2" />
        <span className="font-medium">My Pools</span>
        <FaChevronDown className={`ml-1 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="dropdown"
        unmountOnExit
      >
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10 border border-gray-200">
          <div className="py-1">
            <DropdownLink to="/dashboard" icon={FaTrophy}>My Pools</DropdownLink>
            <DropdownLink to="/entries" icon={FaClipboardList}>My Entries</DropdownLink>
            <DropdownLink to="/pool-picks-selection" icon={FaUser}>View Pool Picks</DropdownLink>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

function UserMenu({ isOpen, setIsOpen, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-nfl-purple hover:text-nfl-purple/80 px-4 py-2 transition-colors duration-200"
      >
        <FaUser className="mr-2" />
        <span className="font-medium">Account</span>
        <FaChevronDown className={`ml-1 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="dropdown"
        unmountOnExit
      >
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10 border border-gray-200">
          <div className="py-1">
            <DropdownLink to="/dashboard" icon={FaUser}>My Profile</DropdownLink>
            <DropdownLink to="/user-entries" icon={FaClipboardList}>My Picks</DropdownLink>
            <DropdownLink to="/account-settings" icon={FaUser}>Account Settings</DropdownLink>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

function DropdownLink({ to, children, icon: Icon }) {
  return (
    <Link 
      to={to} 
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-nfl-purple transition-colors duration-200 flex items-center transform hover:translate-x-1"
    >
      {Icon && <Icon className="mr-2 text-nfl-purple" />}
      {children}
    </Link>
  );
}

function LoginButton({ mobile }) {
  const baseClasses = "bg-gradient-to-r from-nfl-blue to-nfl-purple hover:from-nfl-purple hover:to-nfl-blue text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center";
  const mobileClasses = mobile ? "w-full justify-center" : "";

  return (
    <Link 
      to="/login" 
      className={`${baseClasses} ${mobileClasses}`}
    >
      <FaSignInAlt className="mr-2" />
      Login
    </Link>
  );
}

function RegisterButton({ mobile }) {
  const baseClasses = "bg-gradient-to-r from-nfl-purple to-purple-700 hover:from-purple-700 hover:to-nfl-purple text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center";
  const mobileClasses = mobile ? "w-full justify-center" : "";

  return (
    <Link 
      to="/register" 
      className={`${baseClasses} ${mobileClasses}`}
    >
      <FaUserPlus className="mr-2" />
      Register
    </Link>
  );
}

function LogoutButton({ onClick, mobile }) {
  const baseClasses = "bg-gradient-to-r from-nfl-purple to-purple-700 hover:from-purple-700 hover:to-nfl-purple text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center";
  const mobileClasses = mobile ? "w-full justify-center" : "";

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

export default Header;
