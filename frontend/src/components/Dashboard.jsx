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
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with gradient background and responsive image */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source media="(max-width: 640px)" srcSet="/img-optimized/dashboard_plans_small.webp" />
            <source media="(max-width: 1024px)" srcSet="/img-optimized/dashboard_plans_medium.webp" />
            <source media="(min-width: 1025px)" srcSet="/img-optimized/dashboard_plans_large.webp" />
            <img
              src="/img-optimized/dashboard_plans_medium.webp"
              alt="Football playbook background"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Your <span className="text-nfl-gold">Dashboard</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Manage your pools and entries here</p>
          </div>
        </div>
      </div>

      {/* Content section with light background */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-nfl-blue">Your Pools</h2>
          <Link 
            to="/pools" 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 transform hover:scale-105 hover:shadow-neon"
          >
            Browse Pools
          </Link>
        </div>

        {pools.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center border border-gray-200">
            <p className="mb-6 text-2xl text-gray-600">You're not in any pools. Ready to join the action?</p>
            <Link 
              to="/pools" 
              className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
            >
              Find a Pool to Join
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <div 
                key={pool._id} 
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:scale-102"
              >
                <h3 className="text-2xl font-semibold text-nfl-blue mb-4 break-words">
                  <FaFootballBall className="inline-block mr-2 text-nfl-purple" />
                  {pool.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  <FaCalendarAlt className="inline-block mr-2 text-nfl-light-blue" /> Season: {pool.season}
                </p>
                <p className="text-gray-600 mb-3">
                  <FaCalendarWeek className="inline-block mr-2 text-nfl-gold" /> Current Week: {pool.currentWeek}
                </p>
                <p className="text-gray-600 mb-3">
                  <FaUsers className="inline-block mr-2 text-green-500" /> Active Entries: {pool.activeEntries}
                </p>
                <p className="text-gray-600 mb-3">
                  <FaDollarSign className="inline-block mr-2 text-green-500" /> Entry Fee: ${pool.entryFee}
                </p>
                <p className="text-gray-600 mb-3">
                  <FaTrophy className="inline-block mr-2 text-nfl-gold" /> Prize: ${pool.prizeAmount}
                </p>
                <p className="text-gray-600 mb-5">
                  Status: <span className={`font-semibold ${pool.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
                  </span>
                </p>
                <Link 
                  to={`/entries?poolId=${pool._id}`} 
                  className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full block text-center transition duration-300 transform hover:scale-105 hover:shadow-neon"
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