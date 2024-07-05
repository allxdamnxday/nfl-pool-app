// frontend/src/components/PoolList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivePools } from '../services/poolService';

function PoolList() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const fetchedPools = await getActivePools();
        setPools(fetchedPools);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pools. Please try again later.');
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  if (loading) return <div className="text-center">Loading pools...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Active Pools</h1>
      {pools.length === 0 ? (
        <p>No active pools available.</p>
      ) : (
        <ul className="space-y-4">
          {pools.map((pool) => (
            <li key={pool._id} className="bg-white shadow-md rounded-lg p-4">
              <Link to={`/pools/${pool._id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                {pool.name}
              </Link>
              <p className="text-gray-600">Season: {pool.season}</p>
              <p className="text-gray-600">Current Week: {pool.currentWeek}</p>
              <p className="text-gray-600">Participants: {pool.participants.length} / {pool.maxParticipants}</p>
              <p className="text-gray-600">Entry Fee: ${pool.entryFee}</p>
              <p className="text-gray-600">Prize: ${pool.prizeAmount}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/pools/create" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Create New Pool
      </Link>
    </div>
  );
}

export default PoolList;