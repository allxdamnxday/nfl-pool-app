// frontend/src/components/Button.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Create a Motion-enhanced Link component
const MotionLink = motion(Link);

function Button({ to, children }) {
  return (
    <MotionLink
      to={to}
      className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full text-base sm:text-lg transition duration-300 transform hover:scale-105 shadow-neon"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }} // Optional: Adds a tap animation
      aria-label={children} // Enhances accessibility
    >
      {children}
    </MotionLink>
  );
}

export default Button;
