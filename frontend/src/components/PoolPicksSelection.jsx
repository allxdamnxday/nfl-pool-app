import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPools } from '../services/poolService';
import { LogoSpinner } from './CustomComponents';
import { FaTrophy } from 'react-icons/fa';

function PoolPicksSelection() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const data = await getAllPools();
        setPools(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pools. Please try again later.');
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  if (loading) return <LogoSpinner size={128} />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
      <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-12 sm:py-16">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 text-nfl-white drop-shadow-lg">
              Select a <span className="text-nfl-gold">Pool</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl drop-shadow-lg">Choose a pool to view picks</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <Link 
              key={pool._id} 
              to={`/pools/${pool._id}/picks`}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-nfl-blue">{pool.name}</h2>
                <FaTrophy className="text-nfl-gold text-2xl" />
              </div>
              <p className="text-gray-600 mb-2">Season: {pool.season}</p>
              <p className="text-gray-600">Entries: {pool.entryCount}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PoolPicksSelection;