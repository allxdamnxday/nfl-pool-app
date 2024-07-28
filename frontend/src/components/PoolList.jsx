// src/components/PoolList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAvailablePools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaDollarSign, FaClipboardList } from 'react-icons/fa';

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
    return <div className="text-center text-white text-2xl mt-12">Loading pools...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text">Available Pools</h1>
      {pools.length === 0 ? (
        <p className="text-xl text-gray-300">There are no open pools at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <div key={pool._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-purple-300 mb-4 break-words">
                <FaFootballBall className="inline-block mr-2 text-purple-400" />
                {pool.name}
              </h2>
              <p className="text-gray-300 mb-2">
                <FaCalendarAlt className="inline-block mr-2 text-blue-400" /> Season: {pool.season}
              </p>
              <p className="text-gray-300 mb-2">
                <FaCalendarAlt className="inline-block mr-2 text-yellow-400" /> Current Week: {pool.currentWeek}
              </p>
              <p className="text-gray-300 mb-2">
                <FaDollarSign className="inline-block mr-2 text-green-400" /> Entry Fee: ${pool.entryFee}
              </p>
              <p className="text-gray-300 mb-2">
                <FaClipboardList className="inline-block mr-2 text-blue-400" /> Your Entries: {pool.userEntries} / 3
              </p>
              <p className="text-gray-300 mb-2">
                <FaUsers className="inline-block mr-2 text-green-400" /> Active Entries: {pool.activeEntries}
              </p>
              <p className="text-gray-300 mb-2">
                <FaClipboardList className="inline-block mr-2 text-yellow-400" /> Pending Requests: {pool.pendingRequests}
              </p>
              <p className="text-gray-300 mb-4">
                <FaClipboardList className="inline-block mr-2 text-green-400" /> Approved Entries: {pool.approvedEntries}
              </p>
              {pool.canJoin ? (
                <Link 
                  to={`/pools/${pool._id}/join`} 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 block text-center"
                >
                  {pool.userEntries === 0 ? 'Join Pool' : 'Add Entry'}
                </Link>
              ) : (
                <span className="text-gray-500 block text-center">Maximum entries reached</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoolList;