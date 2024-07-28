// frontend/src/components/PoolEntries.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getPoolEntries } from '../services/entryService';
import { getPoolDetails } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function PoolEntries() {
  const { poolId } = useParams();
  const { user } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoolAndEntries = async () => {
      try {
        setLoading(true);
        const [poolData, entriesData] = await Promise.all([
          getPoolDetails(poolId),
          getPoolEntries(poolId)
        ]);
        setPool(poolData);
        setEntries(entriesData.filter(entry => entry.user === user.id && entry.isActive));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pool entries:', err);
        setError('Failed to load entries. Please try again later.');
        setLoading(false);
      }
    };

    fetchPoolAndEntries();
  }, [poolId, user.id]);

  if (loading) return <div className="text-center text-white text-2xl mt-12">Loading entries...</div>;
  if (error) return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text">{pool?.name} - Your Entries</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
            <h3 className="text-2xl font-semibold text-purple-300 mb-4">
              <FaFootballBall className="inline-block mr-2 text-purple-400" />
              {pool?.name}
            </h3>
            <p className="text-gray-300 mb-2">
              <FaCheckCircle className="inline-block mr-2 text-green-400" /> Status: {entry.isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="text-gray-300 mb-2">
              <FaCalendarAlt className="inline-block mr-2 text-blue-400" /> Picks Made: {entry.picks?.length || 0}
            </p>
            <p className="text-gray-300 mb-2">
              <FaCalendarAlt className="inline-block mr-2 text-yellow-400" /> Current Week: {pool?.currentWeek}
            </p>
            <p className="text-gray-300 mb-4">
              {entry.eliminated ? 
                <FaTimesCircle className="inline-block mr-2 text-red-400" /> : 
                <FaCheckCircle className="inline-block mr-2 text-green-400" />
              }
              Status: {entry.eliminated ? 'Eliminated' : 'Still In'}
            </p>
            <Link 
              to={`/entries/${entry._id}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 block text-center"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PoolEntries;