// src/components/PoolList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAvailablePools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';

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
    return <div className="text-center text-white">Loading pools...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Available Pools</h1>
      {pools.length === 0 ? (
        <p>There are no open pools at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <div key={pool._id} className="bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-purple-500 mb-4">{pool.name}</h2>
              <p className="text-gray-400 mb-2">Season: {pool.season}</p>
              <p className="text-gray-400 mb-2">Current Week: {pool.currentWeek}</p>
              <p className="text-gray-400 mb-2">Participants: {pool.participants.length} / {pool.maxParticipants}</p>
              <p className="text-gray-400 mb-2">Entry Fee: ${pool.entryFee}</p>
              <p className="text-gray-400 mb-2">Your Entries: {pool.userEntries} / 3</p>
              <p className="text-gray-400 mb-2">Active Entries: {pool.activeEntries}</p>
              <p className="text-gray-400 mb-2">Pending Requests: {pool.pendingRequests}</p>
              <p className="text-gray-400 mb-4">Approved Entries: {pool.approvedEntries}</p>
              {pool.canJoin ? (
                <Link 
                  to={`/pools/${pool._id}/join`} 
                  className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  {pool.userEntries === 0 ? 'Join Pool' : 'Add Entry'}
                </Link>
              ) : (
                <span className="text-gray-500">Maximum entries reached</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoolList;