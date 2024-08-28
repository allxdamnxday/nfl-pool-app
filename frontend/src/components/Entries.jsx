import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEntries } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaTrophy, FaChartLine, FaHashtag } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const entriesData = await getUserEntries();
        setEntries(entriesData);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
        setError('Failed to load entries. Please try again later.');
        showToast('Failed to load entries. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [showToast]);

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
        <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with gradient background */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source 
              media="(max-width: 640px)" 
              srcSet="/img-optimized/playbook_small.webp"
            />
            <source 
              media="(max-width: 1024px)" 
              srcSet="/img-optimized/playbook_medium.webp"
            />
            <source 
              media="(min-width: 1025px)" 
              srcSet="/img-optimized/playbook_large.webp"
            />
            <img
              src="/img-optimized/playbook_medium.webp"
              alt="Football playbook background"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              My <span className="text-nfl-gold">Entries</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Manage your active entries here</p>
          </div>
        </div>
      </div>

      {/* Content section with light background */}
      <div className="container mx-auto px-4 py-12">
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center border border-gray-200">
            <FaFootballBall className="mx-auto h-24 w-24 text-nfl-gold mb-8 animate-bounce" />
            <p className="mb-6 text-2xl text-gray-600">You don't have any entries yet. Ready to join the action?</p>
            <Link 
              to="/pools" 
              className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
            >
              Browse Pools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {entries.map((entry) => (
              <EntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryCard({ entry }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:scale-102">
      <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
        <h2 className="text-2xl font-bold text-nfl-white mb-2 break-words flex items-center">
          <FaFootballBall className="mr-2 text-nfl-gold" />
          {entry.pool?.name || 'Unknown Pool'}
        </h2>
        <StatusBadge status={entry.status} />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InfoItem icon={FaHashtag} label="Entry" value={entry.entryNumber} />
          <InfoItem icon={FaCalendarAlt} label="Picks Made" value={entry.picks?.length || 0} />
          <InfoItem icon={FaChartLine} label="Current Week" value={entry.pool?.currentWeek || 'N/A'} />
          <InfoItem 
            icon={FaTrophy} 
            label="Status" 
            value={entry.status === 'eliminated' ? 'Eliminated' : 'Still In'} 
            valueColor={entry.status === 'eliminated' ? 'text-red-500' : 'text-green-500'}
          />
        </div>
        <div className="mt-6">
          <Link 
            to={`/entries/${entry._id}`} 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full block text-center transition duration-300 transform hover:scale-105 hover:shadow-neon"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const bgColor = status === 'active' ? 'bg-green-500' : 'bg-red-500';
  return (
    <span className={`${bgColor} text-white text-sm font-semibold px-4 py-1 rounded-full inline-block`}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value, valueColor = 'text-nfl-blue' }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 text-center">
      <Icon className="text-2xl mb-2 text-nfl-light-blue" />
      <span className="font-medium text-sm text-gray-600 mb-1">{label}</span>
      <span className={`text-lg font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

export default Entries;