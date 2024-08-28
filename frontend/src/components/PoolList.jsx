// src/components/PoolList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAvailablePools } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaDollarSign, FaClipboardList, FaTrophy } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function PoolList() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const fetchedPools = await getAvailablePools();
        setPools(fetchedPools);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pools:', error);
        showToast('Failed to load available pools. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchPools();
  }, [showToast]);

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with gradient background and responsive image */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source media="(max-width: 640px)" srcSet="/img-optimized/pool_list_small.webp" />
            <source media="(max-width: 1024px)" srcSet="/img-optimized/pool_list_medium.webp" />
            <source media="(min-width: 1025px)" srcSet="/img-optimized/pool_list_large.webp" />
            <img
              src="/img-optimized/pool_list_medium.webp"
              alt="Football stadium background"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Available <span className="text-nfl-gold">Pools</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Choose your battlefield and prove your NFL knowledge</p>
          </div>
        </div>
      </div>

      {/* Content section with light background */}
      <div className="container mx-auto px-4 py-12">
        {pools.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center border border-gray-200">
            <p className="text-xl text-gray-600 mb-6">There are no open pools at the moment.</p>
            <Link 
              to="/dashboard"
              className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pools.map((pool) => (
              <PoolCard key={pool._id} pool={pool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PoolCard({ pool }) {
  // Calculate adjusted prize amount (50/60 of the total collected)
  const adjustedPrizeAmount = Math.floor((pool.activeEntries * pool.entryFee) * (50/60));

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:scale-102">
      <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
        <h2 className="text-2xl font-bold text-nfl-white mb-2 break-words flex items-center">
          <FaFootballBall className="mr-2 text-nfl-gold" />
          {pool.name}
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={FaCalendarAlt} label="Season" value={pool.season} />
          <InfoItem icon={FaDollarSign} label="Entry Fee" value={`$${pool.entryFee}`} />
          <InfoItem icon={FaClipboardList} label="Max Entries" value="3" />
          <InfoItem 
            icon={FaTrophy} 
            label="Prize Pool" 
            value={`$${adjustedPrizeAmount}+`}
          />
        </div>
        <div className="mt-6">
          <Link 
            to={`/pools/${pool._id}/join`} 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full block text-center transition duration-300 transform hover:scale-105 hover:shadow-neon"
          >
            View Pool Details
          </Link>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          *Prize pool is an estimate and may be subject to change.
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 text-center">
      <Icon className="text-2xl mb-2 text-nfl-light-blue" />
      <span className="font-medium text-sm text-gray-600 mb-1">{label}</span>
      <span className="text-lg font-bold text-nfl-blue">{value}</span>
    </div>
  );
}

export default PoolList;