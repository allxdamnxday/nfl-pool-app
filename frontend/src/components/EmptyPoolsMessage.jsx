// frontend/src/components/EmptyPoolsMessage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFootballBall } from 'react-icons/fa';
import { motion } from 'framer-motion';

function EmptyPoolsMessage() {
  return (
    <motion.div
      className="bg-white rounded-xl p-12 shadow-lg text-center border border-gray-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <FaFootballBall className="mx-auto h-24 w-24 text-nfl-gold mb-8 animate-bounce" aria-hidden="true" />
      <p className="mb-6 text-2xl text-gray-600">You're not in any pools. Ready to join the action?</p>
      <Link 
        to="/pools"
        className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
      >
        Find a Pool to Join
      </Link>
    </motion.div>
  );
}

export default EmptyPoolsMessage;
