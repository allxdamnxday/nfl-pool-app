// src/components/JoinPool.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoolDetails } from '../services/poolService';
import { createRequest } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';

function JoinPool() {
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numberOfEntries, setNumberOfEntries] = useState(1);
  const { poolId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    const fetchPoolDetails = async () => {
      try {
        const poolData = await getPoolDetails(poolId);
        setPool(poolData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pool details. Please try again later.');
        showToast('Failed to load pool details. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchPoolDetails();
  }, [poolId, showToast]);

  const handleJoinRequest = async (e) => {
    e.preventDefault();
    try {
      await createRequest(poolId, numberOfEntries);
      showToast('Join request submitted successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Failed to submit join request. Please try again.', 'error');
    }
  };

  if (loading) return <div className="text-center text-white">Loading pool details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Join Pool: {pool?.name}</h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6 max-w-md mx-auto">
        <p className="text-gray-400 mb-4">Entry Fee: ${pool?.entryFee}</p>
        <form onSubmit={handleJoinRequest}>
          <div className="mb-4">
            <label htmlFor="numberOfEntries" className="block text-gray-400 mb-2">Number of Entries</label>
            <input
              type="number"
              id="numberOfEntries"
              value={numberOfEntries}
              onChange={(e) => setNumberOfEntries(e.target.value)}
              min="1"
              max="3"
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
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