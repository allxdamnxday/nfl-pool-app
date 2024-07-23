// frontend/src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPools } from '../services/poolService';

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
    return <div className="text-center text-white">Loading your pools...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link 
          to="/pools" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Browse Pools
        </Link>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Pools</h2>
        {pools.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="mb-4">You're not in any pools yet. Ready to join the action?</p>
            <Link 
              to="/pools" 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Find a Pool to Join
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <div key={pool._id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-purple-500 mb-2">{pool.name}</h3>
                <p className="text-gray-300 mb-1">Season: {pool.season}</p>
                <p className="text-gray-300 mb-1">Current Week: {pool.currentWeek}</p>
                <p className="text-gray-300 mb-3">Active Entries: {pool.activeEntries}</p>
                <Link 
                  to={`/pool-entries/${pool._id}`} 
                  className="mt-4 inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
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