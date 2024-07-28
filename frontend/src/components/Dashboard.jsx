// frontend/src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPools } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaCalendarWeek } from 'react-icons/fa';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchUserPools = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const userPools = await getUserPools(user.id);
        setPools(userPools);
      } catch (error) {
        console.error('Failed to fetch user pools:', error);
        setError('Failed to load your pools. Please try again later.');
        showToast('Failed to load your pools. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPools();
  }, [user, showToast]);

  if (loading) {
    return <div className="text-center text-white text-2xl mt-12">Loading your pools...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-bold text-purple-400 shadow-text">Dashboard</h1>
        <Link 
          to="/pools" 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Browse Pools
        </Link>
      </div>
      <div>
        <h2 className="text-4xl font-semibold mb-8 text-purple-400">Your Pools</h2>
        {pools.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="mb-6 text-xl">You're not in any pools yet. Ready to join the action?</p>
            <Link 
              to="/pools" 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Find a Pool to Join
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pools.map((pool) => (
              <div key={pool._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-purple-300 mb-4 break-words">
                  <FaFootballBall className="inline-block mr-2 text-purple-400" />
                  {pool.name}
                </h3>
                <p className="text-gray-300 mb-2">
                  <FaCalendarAlt className="inline-block mr-2 text-blue-400" /> Season: {pool.season}
                </p>
                <p className="text-gray-300 mb-2">
                  <FaCalendarWeek className="inline-block mr-2 text-yellow-400" /> Current Week: {pool.currentWeek}
                </p>
                <p className="text-gray-300 mb-4">
                  <FaUsers className="inline-block mr-2 text-green-400" /> Active Entries: {pool.activeEntries}
                </p>
                <Link 
                  to={`/pool-entries/${pool._id}`} 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded block text-center transition duration-300 ease-in-out"
                >
                  View Entries
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;