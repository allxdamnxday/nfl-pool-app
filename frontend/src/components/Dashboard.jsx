// frontend/src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPoolsWithEntries } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaCalendarWeek, FaDollarSign, FaTrophy } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

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
        const userPoolsWithEntries = await getUserPoolsWithEntries();
        console.log('User pools with entries:', userPoolsWithEntries);
        setPools(userPoolsWithEntries);
      } catch (error) {
        console.error('Failed to fetch user pools with entries:', error);
        setError('Failed to load your pools. Please try again later.');
        showToast('Failed to load your pools. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPools();
  }, [user, showToast]);

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 sm:mb-0">Dashboard</h1>
          <Link 
            to="/pools" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full text-base sm:text-lg transition duration-300 ease-in-out mt-2 sm:mt-0"
          >
            Browse Pools
          </Link>
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8 text-gray-800">Your Pools</h2>
          {pools.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow-sm text-center border border-gray-100">
              <p className="mb-6 text-2xl text-gray-600">You're not in any pools. Ready to join the action?</p>
              <Link 
                to="/pools" 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 ease-in-out inline-block"
              >
                Find a Pool to Join
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pools.map((pool) => (
                <div 
                  key={pool._id} 
                  className="bg-white rounded-lg p-6 shadow-md border border-gray-200 transition duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4 break-words">
                    <FaFootballBall className="inline-block mr-2 text-purple-500" />
                    {pool.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    <FaCalendarAlt className="inline-block mr-2 text-blue-500" /> Season: {pool.season}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <FaCalendarWeek className="inline-block mr-2 text-yellow-500" /> Current Week: {pool.currentWeek}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <FaUsers className="inline-block mr-2 text-green-500" /> Active Entries: {pool.activeEntries}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <FaDollarSign className="inline-block mr-2 text-green-500" /> Entry Fee: ${pool.entryFee}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <FaTrophy className="inline-block mr-2 text-yellow-500" /> Prize: ${pool.prizeAmount}
                  </p>
                  <p className="text-gray-600 mb-5">
                    Status: <span className={`font-semibold ${pool.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                    </span>
                  </p>
                  <Link 
                    to={`/pool-entries/${pool._id}`} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full block text-center transition duration-300 ease-in-out"
                  >
                    View Entries
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;