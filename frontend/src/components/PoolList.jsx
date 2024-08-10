// src/components/PoolList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAvailablePools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaDollarSign, FaClipboardList } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function PoolList() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const fetchedPools = await getAvailablePools();
        setPools(fetchedPools);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pools:', error);
        showToast('Failed to load available pools. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchPools();
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-white">
        <LogoSpinner size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-purple-600 text-center">Available Pools</h1>
        {pools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-6">There are no open pools at the moment.</p>
            <Link 
              to="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-block"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <PoolCard key={pool._id} pool={pool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PoolCard({ pool }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 break-words flex items-center">
          <FaFootballBall className="mr-2 text-purple-500" />
          {pool.name}
        </h2>
        <InfoItem icon={FaCalendarAlt} label="Season" value={pool.season} />
        <InfoItem icon={FaCalendarAlt} label="Current Week" value={pool.currentWeek} />
        <InfoItem icon={FaDollarSign} label="Entry Fee" value={`$${pool.entryFee}`} />
        <InfoItem icon={FaUsers} label="Active Entries" value={pool.activeEntries} />
        <InfoItem icon={FaClipboardList} label="Max Entries per User" value="3" />
      </div>
      <div className="bg-gray-50 px-6 py-4">
        <Link 
          to={`/pools/${pool._id}/join`} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 block text-center"
        >
          View Pool Details
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <p className="text-gray-600 mb-2 flex items-center">
      <Icon className="mr-2 text-purple-400" />
      <span className="font-medium">{label}:</span>
      <span className="ml-1">{value}</span>
    </p>
  );
}

export default PoolList;