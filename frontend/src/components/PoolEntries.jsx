import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getPoolDetails } from '../services/poolService';
import { getUserEntries } from '../services/entryService';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function PoolEntries() {
  const { poolId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoolAndEntries = async () => {
      if (authLoading) return;

      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching pool and entries for poolId:', poolId);
        setLoading(true);
        const [poolData, userEntriesData] = await Promise.all([
          getPoolDetails(poolId),
          getUserEntries()
        ]);
        console.log('Pool Data:', poolData);
        console.log('User Entries Data:', userEntriesData);
        
        setPool(poolData);
        
        // Filter entries for the current pool
        const poolEntries = userEntriesData.data.filter(entry => entry.pool._id === poolId);
        console.log('Pool Entries:', poolEntries);
        
        setEntries(poolEntries);
      } catch (err) {
        console.error('Error fetching pool entries:', err);
        setError('Failed to load entries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPoolAndEntries();
  }, [poolId, user, authLoading]);

  if (authLoading || loading) return <div className="text-center text-white text-2xl mt-12">Loading entries...</div>;
  if (error) return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  if (!user) return <div className="text-center text-white text-2xl mt-12">Please log in to view entries.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-center text-purple-400 shadow-text">{pool?.name || 'Pool'} - Your Entries</h1>
      {entries.length === 0 ? (
        <p className="text-center text-xl text-gray-400">You have no entries in this pool.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <FaFootballBall className="mr-2 text-purple-500" />
                {pool?.name}
              </h3>
              <p className="text-gray-300 mb-2 flex items-center">
                {entry.isActive ? (
                  <FaCheckCircle className="mr-2 text-green-500" />
                ) : (
                  <FaTimesCircle className="mr-2 text-red-500" />
                )}
                Status: {entry.isActive ? 'Active' : 'Inactive'}
              </p>
              <p className="text-gray-300 mb-2 flex items-center">
                <FaFootballBall className="mr-2 text-blue-400" />
                Picks Made: {entry.picks?.length || 0}
              </p>
              <p className="text-gray-300 mb-2 flex items-center">
                <FaCalendarAlt className="mr-2 text-yellow-400" />
                Current Week: {pool?.currentWeek}
              </p>
              <p className="text-gray-300 mb-4 flex items-center">
                {entry.eliminated ? (
                  <FaTimesCircle className="mr-2 text-red-500" />
                ) : (
                  <FaCheckCircle className="mr-2 text-green-500" />
                )}
                Status: {entry.eliminated ? 'Eliminated' : 'Still In'}
              </p>
              <Link 
                to={`/entries/${entry._id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 w-full block text-center"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoolEntries;