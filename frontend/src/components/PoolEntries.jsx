// frontend/src/components/PoolEntries.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getPoolEntries } from '../services/entryService';
import { getPoolDetails } from '../services/poolService';

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

  if (loading) return <div className="text-center text-white">Loading entries...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">{pool?.name} - Your Entries</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-purple-500 mb-4">{pool?.name}</h3>
            <p className="text-gray-300 mb-2">Status: {entry.isActive ? 'Active' : 'Inactive'}</p>
            <p className="text-gray-300 mb-2">Picks Made: {entry.picks?.length || 0}</p>
            <p className="text-gray-300 mb-2">Current Week: {pool?.currentWeek}</p>
            <p className="text-gray-300 mb-4">Status: {entry.eliminated ? 'Eliminated' : 'Still In'}</p>
            <Link 
              to={`/entries/${entry._id}`}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300"
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