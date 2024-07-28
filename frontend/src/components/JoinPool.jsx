// src/components/JoinPool.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoolDetails } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger'; // Add this import

function JoinPool() {
  const [pool, setPool] = useState(null);
  const [userEntries, setUserEntries] = useState(0);
  const [numberOfEntries, setNumberOfEntries] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { poolId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    const fetchPoolDetails = async () => {
      try {
        const poolData = await getPoolDetails(poolId);
        setPool(poolData);
        setUserEntries(poolData.userEntries || 0);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pool details. Please try again later.');
        showToast('Failed to load pool details. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchPoolDetails();
  }, [poolId, showToast]);

  
  const handleJoinRequest = (e) => {
    e.preventDefault();
    logger.info(`Initiating join request for pool ${poolId} with ${numberOfEntries} entries`);
    navigate('/payment', { 
      state: { 
        poolId, 
        numberOfEntries, 
        entryFee: pool?.entryFee, 
        totalAmount: numberOfEntries * (pool?.entryFee || 0) 
      } 
    });
  };


  if (loading) return <div className="text-center text-white">Loading pool details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const remainingEntries = 3 - userEntries;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        {userEntries === 0 ? 'Join Pool' : 'Add Entry'}: {pool?.name}
      </h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6 max-w-md mx-auto">
        <p className="text-gray-400 mb-4">Entry Fee: ${pool?.entryFee}</p>
        <p className="text-gray-400 mb-4">Your Current Entries: {userEntries}</p>
        <form onSubmit={handleJoinRequest}>
          <div className="mb-4">
            <label htmlFor="numberOfEntries" className="block text-sm font-medium text-gray-400">
              Number of New Entries (1-{remainingEntries}):
            </label>
            <input
              type="number"
              id="numberOfEntries"
              value={numberOfEntries}
              onChange={(e) => setNumberOfEntries(Number(e.target.value))}
              min="1"
              max={remainingEntries}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
          >
            Submit Join Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinPool;