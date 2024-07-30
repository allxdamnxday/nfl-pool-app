// frontend/src/components/EntryDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEntry } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (!entry) {
    return <div className="text-center text-white text-2xl mt-12">Entry not found.</div>;
  }

  const handlePickEmClick = () => {
    navigate(`/entries/${entryId}/picks`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text text-center">Entry Details</h1>
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 max-w-2xl mx-auto shadow-lg">
        <h2 className="text-3xl font-semibold text-purple-300 mb-6 text-center">
          <FaFootballBall className="inline-block mr-2 text-purple-400" />
          {entry.pool.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-lg font-semibold">
              {entry.isActive ? 
                <FaCheckCircle className="inline-block mr-2 text-green-400" /> : 
                <FaTimesCircle className="inline-block mr-2 text-red-400" />
              }
              {entry.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Current Week</p>
            <p className="text-lg font-semibold">
              <FaCalendarAlt className="inline-block mr-2 text-yellow-400" />
              {entry.pool.currentWeek}
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg col-span-2">
            <p className="text-sm text-gray-400">Entry Status</p>
            <p className="text-lg font-semibold">
              {entry.isEliminated ? 
                <FaTimesCircle className="inline-block mr-2 text-red-400" /> : 
                <FaCheckCircle className="inline-block mr-2 text-green-400" />
              }
              {entry.isEliminated ? 'Eliminated' : 'Still In'}
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-purple-300">Pick History</h3>
        {entry.picks && entry.picks.length > 0 ? (
          <ul className="space-y-3">
            {entry.picks.map((pick, index) => (
              <li key={pick._id} className="bg-gray-700 p-4 rounded-lg">
                <p className="font-semibold text-purple-300">Week {index + 1}</p>
                <p>Team: <span className="font-semibold">{pick.team}</span></p>
                <p>Result: <span className="font-semibold">{pick.result || 'Pending'}</span></p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">No picks made yet.</p>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          {!entry.isEliminated && (
            <button 
              onClick={handlePickEmClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Pick 'Em
            </button>
          )}
          <Link 
            to="/entries" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Back to Entries
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EntryDetail;