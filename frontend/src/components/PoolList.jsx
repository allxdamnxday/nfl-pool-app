// src/components/PoolList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAvailablePools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import { AuthContext } from '../contexts/AuthContext';

function PoolList() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();
  const { user, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchPools = async () => {
      if (authLoading) return;
      try {
        const fetchedPools = await getAvailablePools();
        setPools(fetchedPools);
      } catch (err) {
        console.error('Error fetching pools:', err);
        setError('Failed to fetch available pools. Please try again later.');
        showToast('Failed to load available pools. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [authLoading, showToast]);

  if (authLoading || loading) return <div className="text-center text-white">Loading pool information...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!user) return <div className="text-center text-white">Please log in to view available pools.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Available Pools</h1>
      {pools.length === 0 ? (
        <p>There are no available pools to join at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <div key={pool._id} className="bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-purple-500 mb-4">{pool.name}</h2>
              <p className="text-gray-400 mb-2">Season: {pool.season}</p>
              <p className="text-gray-400 mb-2">Current Week: {pool.currentWeek}</p>
              <p className="text-gray-400 mb-2">Participants: {pool.participants.length} / {pool.maxParticipants}</p>
              <p className="text-gray-400 mb-4">Entry Fee: ${pool.entryFee}</p>
              <Link 
                to={`/pools/${pool._id}/join`} 
                className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Join Pool
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoolList;