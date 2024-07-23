// frontend/src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPools } from '../services/poolService';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [userPools, setUserPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchUserPools = async () => {
      try {
        // Make sure user.id is defined before making the request
        if (user && user.id) {
          const pools = await getUserPools(user.id);
          setUserPools(pools);
        } else {
          console.error('User ID is undefined');
          // Handle the case where user ID is not available
        }
      } catch (error) {
        console.error('Failed to fetch user pools:', error);
        showToast('Failed to fetch your pools. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserPools();
    }
  }, [user, showToast]);

  if (loading) {
    return <div className="text-center text-white">Loading your pools...</div>;
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
        {userPools.length === 0 ? (
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
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPools.map(pool => (
              <li key={pool._id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">{pool.name}</h3>
                <p className="text-gray-300">Season: {pool.season}</p>
                <p className="text-gray-300">Current Week: {pool.currentWeek}</p>
                <Link 
                  to={`/pools/${pool._id}`} 
                  className="mt-4 inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  View Pool
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;