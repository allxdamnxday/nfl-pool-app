// frontend/src/components/CreatePool.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPool } from '../services/poolService';

function CreatePool() {
  const [poolData, setPoolData] = useState({
    name: '',
    season: new Date().getFullYear(),
    maxParticipants: 10000,
    entryFee: 0,
    prizeAmount: 0
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    try {
      await createPool(poolData);
      navigate('/pools');
    } catch (err) {
      setError('Failed to create pool. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Create New Pool</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Pool Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={poolData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="season" className="block mb-1">Season</label>
          <input
            type="number"
            id="season"
            name="season"
            value={poolData.season}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="maxParticipants" className="block mb-1">Max Participants</label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={poolData.maxParticipants}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="entryFee" className="block mb-1">Entry Fee ($)</label>
          <input
            type="number"
            id="entryFee"
            name="entryFee"
            value={poolData.entryFee}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="prizeAmount" className="block mb-1">Prize Amount ($)</label>
          <input
            type="number"
            id="prizeAmount"
            name="prizeAmount"
            value={poolData.prizeAmount}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Pool
        </button>
      </form>
    </div>
  );
}

export default CreatePool;