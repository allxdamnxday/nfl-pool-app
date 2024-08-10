// frontend/src/components/CreatePool.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPool } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaDollarSign, FaTrophy } from 'react-icons/fa';

function CreatePool() {
  const [poolData, setPoolData] = useState({
    name: '',
    season: new Date().getFullYear(),
    maxParticipants: 10000,
    entryFee: 0,
    prizeAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPoolData(prevData => ({
      ...prevData,
      [name]: name === 'season' || name === 'maxParticipants' || name === 'entryFee' || name === 'prizeAmount' 
        ? parseInt(value, 10) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPool(poolData);
      showToast('Pool created successfully!', 'success');
      navigate('/pools');
    } catch (err) {
      showToast('Failed to create pool. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <FaFootballBall className="mr-2 text-purple-600" />
        Create New Pool
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block mb-1 text-gray-700">Pool Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={poolData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label htmlFor="season" className="block mb-1 text-gray-700 flex items-center">
            <FaCalendarAlt className="mr-2 text-purple-600" />
            Season
          </label>
          <input
            type="number"
            id="season"
            name="season"
            value={poolData.season}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label htmlFor="maxParticipants" className="block mb-1 text-gray-700 flex items-center">
            <FaUsers className="mr-2 text-purple-600" />
            Max Participants
          </label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={poolData.maxParticipants}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label htmlFor="entryFee" className="block mb-1 text-gray-700 flex items-center">
            <FaDollarSign className="mr-2 text-purple-600" />
            Entry Fee ($)
          </label>
          <input
            type="number"
            id="entryFee"
            name="entryFee"
            value={poolData.entryFee}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label htmlFor="prizeAmount" className="block mb-1 text-gray-700 flex items-center">
            <FaTrophy className="mr-2 text-purple-600" />
            Prize Amount ($)
          </label>
          <input
            type="number"
            id="prizeAmount"
            name="prizeAmount"
            value={poolData.prizeAmount}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Pool'}
        </button>
      </form>
    </div>
  );
}

export default CreatePool;