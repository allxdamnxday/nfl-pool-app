// frontend/src/components/PoolCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFootballBall, 
  FaCalendarAlt, 
  FaUsers, 
  FaCalendarWeek, 
  FaDollarSign,
  FaChartBar // Add this import for the stats icon
} from 'react-icons/fa'; // Import all necessary icons
import StatusBadge from './StatusBadge';
import InfoItem from './InfoItem';
import { motion } from 'framer-motion';

function PoolCard({ pool }) {
  // Calculate total entry paid
  const totalEntryPaid = pool.activeEntries * pool.entryFee;

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:scale-102"
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
        <h3 className="text-2xl font-bold text-nfl-white mb-2 flex items-center">
          <FaFootballBall className="mr-2 text-nfl-gold" aria-hidden="true" />
          {pool.name}
        </h3>
        <StatusBadge status={pool.status} />
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={FaCalendarAlt} label="Season" value={pool.season} />
          <InfoItem icon={FaCalendarWeek} label="Current Week" value={pool.currentWeek} />
          <InfoItem icon={FaUsers} label="Active Entries" value={pool.activeEntries} />
          <InfoItem icon={FaDollarSign} label="Entry Paid" value={`$${totalEntryPaid}`} />
        </div>
        <div className="flex space-x-4"> {/* Add this wrapper div for button layout */}
          <Link 
            to={`/entries?poolId=${pool._id}`} 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full flex-1 text-center transition duration-300 transform hover:scale-105 hover:shadow-neon"
          >
            View Entries
          </Link>
          <Link 
            to={`/pool/${pool._id}/stats`} 
            className="bg-nfl-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full flex-1 text-center transition duration-300 transform hover:scale-105 hover:shadow-neon flex items-center justify-center"
          >
            <FaChartBar className="mr-2" /> View Stats
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default PoolCard;
