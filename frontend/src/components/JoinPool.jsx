// src/components/JoinPool.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPoolDetails, getAvailablePools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaArrowLeft, FaFootballBall, FaUserPlus, FaDollarSign } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

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
        const availablePools = await getAvailablePools();
        const poolData = availablePools.find(p => p._id === poolId);
        if (!poolData) {
          throw new Error('Pool not found or not available');
        }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-white">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-4">{error}</p>
          <Link to="/pools" className="text-purple-600 hover:text-purple-700 font-semibold">
            Return to Pools
          </Link>
        </div>
      </div>
    );
  }

  const remainingEntries = 3 - userEntries;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/pools" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
          <FaArrowLeft className="mr-2" />
          Back to Pools
        </Link>
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
            <FaFootballBall className="mr-3 text-purple-500" />
            {userEntries === 0 ? 'Join Pool' : 'Add Entry'}: {pool?.name}
          </h1>
          <div className="mb-6 space-y-4">
            <InfoItem icon={FaDollarSign} label="Entry Fee" value={`$${pool?.entryFee}`} />
            <InfoItem icon={FaUserPlus} label="Your Current Entries" value={userEntries} />
          </div>
          <form onSubmit={handleJoinRequest} className="space-y-6">
            <div>
              <label htmlFor="numberOfEntries" className="block text-sm font-medium text-gray-700">
                Number of New Entries (1-{remainingEntries}):
              </label>
              <input
                type="number"
                id="numberOfEntries"
                value={numberOfEntries}
                onChange={(e) => setNumberOfEntries(Number(e.target.value))}
                min="1"
                max={remainingEntries}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-4 py-3 rounded-full font-semibold hover:bg-purple-700 transition duration-300"
            >
              Submit Join Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center text-gray-600">
      <Icon className="mr-2 text-purple-500" />
      <span className="font-medium">{label}:</span>
      <span className="ml-1">{value}</span>
    </div>
  );
}

export default JoinPool;