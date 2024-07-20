// frontend/src/components/PoolList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';

function PoolList() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const fetchedPools = await getAllPools();
        setPools(fetchedPools);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pools. Please try again later.');
        showToast('Failed to load pools. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchPools();
  }, [showToast]);

  if (loading) return <div className="text-center text-white">Loading pools...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {pools.length === 0 ? (
        <p>No active pools available.</p>
      ) : (
        <ul className="space-y-4">
          {pools.map((pool) => (
            <li key={pool._id} className="bg-gray-800 shadow-md rounded-lg p-4">
              <Link to={`/pools/${pool._id}`} className="text-xl font-semibold text-purple-500 hover:underline">
                {pool.name}
              </Link>
              <p className="text-gray-400">Season: {pool.season}</p>
              <p className="text-gray-400">Current Week: {pool.currentWeek}</p>
              <p className="text-gray-400">Participants: {pool.participants.length} / {pool.maxParticipants}</p>
              <p className="text-gray-400">Entry Fee: ${pool.entryFee}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/pools/create" className="mt-6 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Create New Pool
      </Link>
    </div>
  );
}

export default PoolList;