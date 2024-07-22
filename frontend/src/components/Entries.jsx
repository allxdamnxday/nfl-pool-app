// frontend/src/components/Entries.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEntries } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const fetchedEntries = await getUserEntries();
        setEntries(fetchedEntries);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
        showToast('Failed to load entries. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchEntries();
  }, [showToast]);

  if (loading) {
    return <div className="text-center text-white">Loading entries...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Entries</h1>
      {entries.length === 0 ? (
        <p>You don't have any entries yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-purple-500 mb-4">{entry.pool.name}</h2>
              <p className="text-gray-400 mb-2">Status: {entry.isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-gray-400 mb-2">Picks Made: {entry.picks.length}</p>
              <p className="text-gray-400 mb-2">Current Week: {entry.pool.currentWeek}</p>
              <p className="text-gray-400 mb-4">
                Status: {entry.isEliminated ? 'Eliminated' : 'Still In'}
              </p>
              <Link 
                to={`/entries/${entry._id}`} 
                className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300"
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