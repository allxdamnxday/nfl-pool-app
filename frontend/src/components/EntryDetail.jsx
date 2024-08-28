import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEntry } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaHashtag, FaTrophy, FaChartLine } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function EntryDetail() {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { entryId } = useParams();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const fetchedEntry = await getEntry(entryId);
        setEntry(fetchedEntry);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch entry:', error);
        showToast('Failed to load entry details. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, showToast]);

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
        <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
          Entry not found.
        </div>
      </div>
    );
  }

  const handlePickEmClick = () => {
    const entryNumber = entry.entryNumber || 1;
    navigate(`/entries/${entryId}/${entryNumber}/picks`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with gradient background */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source 
              media="(max-width: 640px)" 
              srcSet="/img-optimized/entry_stadium_small.webp"
            />
            <source 
              media="(max-width: 1024px)" 
              srcSet="/img-optimized/entry_stadium_medium.webp"
            />
            <source 
              media="(min-width: 1025px)" 
              srcSet="/img-optimized/entry_stadium_large.webp"
            />
            <img
              src="/img-optimized/entry_stadium_medium.webp"
              alt="Football stadium background"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Entry <span className="text-nfl-gold">Details</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">{entry.pool.name}</p>
          </div>
        </div>
      </div>

      {/* Content section with light background */}
      <div className="container mx-auto px-4 py-12">
        <Link to="/entries" className="inline-flex items-center text-nfl-purple hover:text-purple-700 mb-6 transition-colors duration-200">
          <FaArrowLeft className="mr-2" />
          Back to Entries
        </Link>
        
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
            <h2 className="text-2xl font-bold text-nfl-white mb-2 break-words flex items-center">
              <FaFootballBall className="mr-2 text-nfl-gold" />
              Entry #{entry.entryNumber} - {entry.pool.name}
            </h2>
            <StatusBadge status={entry.status} />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <InfoItem icon={FaHashtag} label="Entry Number" value={entry.entryNumber} />
              <InfoItem 
                icon={FaTrophy} 
                label="Status" 
                value={entry.status === 'eliminated' ? 'Eliminated' : 'Still In'} 
                valueColor={entry.status === 'eliminated' ? 'text-red-500' : 'text-green-500'}
              />
              <InfoItem icon={FaCalendarAlt} label="Current Week" value={entry.pool.currentWeek} />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-nfl-blue flex items-center">
              <FaChartLine className="text-nfl-gold mr-3" />
              Pick History
            </h3>
            {entry.picks && entry.picks.length > 0 ? (
              <ul className="space-y-4">
                {entry.picks.map((pick, index) => (
                  <li key={pick._id} className="bg-gray-100 p-4 rounded-lg transition duration-300 hover:shadow-md">
                    <p className="font-semibold text-nfl-blue">Week {index + 1}</p>
                    <p className="text-gray-600">Team: <span className="font-semibold">{pick.team}</span></p>
                    <p className="text-gray-600 flex items-center">
                      Result: 
                      <span className={`font-semibold ml-2 flex items-center ${pick.result === 'win' ? 'text-green-500' : pick.result === 'loss' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {pick.result === 'win' && <FaCheckCircle className="mr-1" />}
                        {pick.result === 'loss' && <FaTimesCircle className="mr-1" />}
                        {pick.result ? pick.result.charAt(0).toUpperCase() + pick.result.slice(1) : 'Pending'}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 italic">No picks made yet.</p>
            )}

            <div className="mt-8 flex justify-center space-x-4">
              {entry.status === 'active' && (
                <button 
                  onClick={handlePickEmClick}
                  className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-neon flex items-center"
                >
                  <FaFootballBall className="mr-2" />
                  Make a Pick
                </button>
              )}
              <Link 
                to="/entries" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Back to Entries
              </Link>
            </div>
          </div>
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

export default EntryDetail;