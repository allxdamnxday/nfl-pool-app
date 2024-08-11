//frontend/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm mb-4 sm:mb-0">
            © 2024 Football Eliminator. All rights reserved.
          </div>
          <nav className="flex space-x-4">
            <Link to="/about" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Contact</Link>
            <Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;