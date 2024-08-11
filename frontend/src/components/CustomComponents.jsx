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
      <motion.img
        src="/img/Logo_FBE@2x.png" // Adjust this path to your actual logo file
        alt="Football Eliminator Logo"
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
      />
    </div>
  );