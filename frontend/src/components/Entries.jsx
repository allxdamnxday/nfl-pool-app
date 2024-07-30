// frontend/src/components/Entries.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEntries } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await getUserEntries();
        if (response.success && Array.isArray(response.data)) {
          setEntries(response.data);
        } else {
          setError('Invalid data format received from the server.');
          showToast('Error loading entries', 'error');
        }
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
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text text-center">My Entries</h1>
      {entries.length === 0 ? (
        <p className="text-center text-xl text-gray-400">You don't have any entries yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <h2 className="text-2xl font-semibold text-purple-300 mb-4">
                <FaFootballBall className="inline-block mr-2 text-purple-400" />
                {entry.pool?.name || 'Unknown Pool'}
              </h2>
              <p className="text-gray-300 mb-2">
                <FaCheckCircle className={`inline-block mr-2 ${entry.isActive ? 'text-green-400' : 'text-red-400'}`} />
                Status: {entry.isActive ? 'Active' : 'Inactive'}
              </p>
              <p className="text-gray-300 mb-2">
                <FaCalendarAlt className="inline-block mr-2 text-blue-400" />
                Picks Made: {entry.picks?.length || 0}
              </p>
              <p className="text-gray-300 mb-2">
                <FaCalendarAlt className="inline-block mr-2 text-yellow-400" />
                Current Week: {entry.pool?.currentWeek || 'N/A'}
              </p>
              <p className="text-gray-300 mb-4">
                {entry.isEliminated ? 
                  <FaTimesCircle className="inline-block mr-2 text-red-400" /> : 
                  <FaCheckCircle className="inline-block mr-2 text-green-400" />
                }
                Status: {entry.isEliminated ? 'Eliminated' : 'Still In'}
              </p>
              <Link 
                to={`/entries/${entry._id}`} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 block text-center"
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

export default Entries;