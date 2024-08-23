import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Add this import

export const FootballButton = ({ children, ...props }) => (
  <button 
    className="bg-leather-brown text-white py-2 px-6 rounded-full transform rotate-[58deg] hover:scale-105 transition-transform duration-300"
    {...props}
  >
    <span className="inline-block -rotate-[58deg]">{children}</span>
  </button>
);

export const FieldGoal = () => (
  <svg className="w-16 h-16 text-yellow-400" viewBox="0 0 24 24">
    <path fill="currentColor" d="M6,4H8V2H16V4H18L20,20H18V22H6V20H4L6,4M16,10V7H8V10H16Z" />
  </svg>
);

export const FootballSpinner = () => (
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-nfl-red"></div>
);

export const StyledInput = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-300 mb-2" htmlFor={props.id}>{label}</label>
    <input
      className="w-full px-3 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-nfl-blue transition-all duration-300"
      {...props}
    />
  </div>
);

export const ResponsiveGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {children}
  </div>
);

export const AnimatedButton = ({ children, className, onClick, ...props }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Animation duration
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`${className} ${isAnimating ? 'animate-bounce' : ''} transition-all duration-300`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const LogoSpinner = ({ size = 20 }) => (
  <div className="flex justify-center items-center">
    <motion.svg
      viewBox="0 0 24 24"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <path
        fill="currentColor"
        d="M20.9,2.5c-0.7-0.7-2-1.1-3.7-1.1c-2.5,0-5.7,0.8-8.7,2.4C5.5,5.5,3,7.7,1.7,9.8c-1.7,2.7-1.5,4.8-0.6,5.7
        c0.5,0.5,1.3,0.8,2.3,0.8c1.8,0,4.2-0.9,6.7-2.4c3-1.8,5.5-4,6.8-6.1C18.5,5.1,18.3,3,17.4,2.1C18.6,2.2,19.6,2.5,20,2.9
        c0.4,0.4,0.9,1.5,0.4,3.6c-0.5,2.5-2.2,5.3-4.7,7.7c-3.9,3.9-9.1,6.4-11.9,5.7c-0.7-0.2-1.2-0.5-1.4-1c-0.3-0.6-0.1-1.5,0.5-2.4
        c0.6-1,1.6-2,2.8-3c0.4-0.3,0.4-0.9,0.1-1.3c-0.3-0.4-0.9-0.4-1.3-0.1c-1.4,1.1-2.5,2.3-3.2,3.5c-0.9,1.5-1.1,3-0.5,4.2
        c0.5,0.9,1.4,1.5,2.5,1.8c0.5,0.1,1.1,0.2,1.7,0.2c3.3,0,7.4-2.2,10.6-5.4c2.8-2.8,4.6-5.9,5.2-8.8C21.9,5.1,21.7,3.3,20.9,2.5z"
      />
    </motion.svg>
  </div>
);