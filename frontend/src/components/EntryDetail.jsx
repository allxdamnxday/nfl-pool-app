// frontend/src/components/EntryDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEntry } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';

function EntryDetail() {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { entryId } = useParams();
  const showToast = useToast();

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
    return <div className="text-center text-white">Loading entry details...</div>;
  }

  if (!entry) {
    return <div className="text-center text-white">Entry not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Entry Details</h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-purple-500 mb-4">{entry.pool.name}</h2>
        <p className="text-gray-400 mb-2">Status: {entry.isActive ? 'Active' : 'Inactive'}</p>
        <p className="text-gray-400 mb-2">Current Week: {entry.pool.currentWeek}</p>
        <p className="text-gray-400 mb-4">
          Status: {entry.isEliminated ? 'Eliminated' : 'Still In'}
        </p>

        <h3 className="text-xl font-semibold mb-3">Pick History</h3>
        {entry.picks.length > 0 ? (
          <ul className="space-y-2">
            {entry.picks.map((pick, index) => (
              <li key={pick._id} className="bg-gray-700 p-3 rounded">
                <p className="font-semibold">Week {index + 1}</p>
                <p>Team: {pick.team}</p>
                <p>Result: {pick.result || 'Pending'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No picks made yet.</p>
        )}

        <Link 
          to="/entries" 
          className="inline-block mt-6 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300"
        >
          Back to Entries
        </Link>
      </div>
    </div>
  );
}

export default EntryDetail;