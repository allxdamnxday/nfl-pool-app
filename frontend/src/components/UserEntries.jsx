// src/components/UserEntries.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEntriesWithPicks } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';

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
    return <div className="text-center text-white">Loading entries...</div>;
  }

  if (error) {
    return <div className="text-center text-white">{error}</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center text-white">You have no entries yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Entries and Picks</h1>
      {entries.map((entry) => (
        <div key={entry._id} className="mb-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-3xl font-semibold text-purple-400 mb-4">{entry.pool.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
              const pick = entry.picks.find(p => p.week === week);
              return (
                <div key={week} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Week {week}</h3>
                  {pick ? (
                    <div>
                      <p className="font-semibold">{pick.team}</p>
                      <p className="text-sm text-gray-400">{pick.result || 'Pending'}</p>
                    </div>
                  ) : (
                    <Link 
                      to={`/entries/${entry._id}/picks/${week}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block"
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