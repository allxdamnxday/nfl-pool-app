// src/components/UserEntries.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEntriesWithPicks } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

function UserEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        console.log('Fetching user entries...');
        const fetchedEntries = await getUserEntriesWithPicks();
        console.log('Fetched entries:', fetchedEntries);
        setEntries(fetchedEntries);
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
    return <div className="text-center text-white text-2xl mt-12">Loading entries...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center text-white text-2xl mt-12">You have no entries yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-center text-purple-400 shadow-text">Your Entries and Picks</h1>
      {entries.map((entry) => (
        <div key={entry._id} className="mb-12 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 shadow-lg">
          <h2 className="text-4xl font-semibold text-purple-400 mb-6 flex items-center">
            <FaFootballBall className="mr-4" />
            {entry.pool.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
              const pick = entry.picks.find(p => p.week === week);
              return (
                <div key={week} className="bg-gradient-to-br from-gray-700 to-gray-600 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-200">
                  <h3 className="text-2xl font-semibold mb-3 text-yellow-400 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Week {week}
                  </h3>
                  {pick ? (
                    <div>
                      <p className="font-semibold text-lg mb-2">{pick.team}</p>
                      <p className="text-sm mb-3 flex items-center">
                        {pick.result === 'win' && <FaCheckCircle className="text-green-400 mr-2" />}
                        {pick.result === 'loss' && <FaTimesCircle className="text-red-400 mr-2" />}
                        {pick.result || 'Pending'}
                      </p>
                      <Link 
                        to={`/entries/${entry._id}/picks/${week}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 inline-block"
                      >
                        Change Pick
                      </Link>
                    </div>
                  ) : (
                    <Link 
                      to={`/entries/${entry._id}/picks/${week}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 inline-block"
                    >
                      Make Pick
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserEntries;