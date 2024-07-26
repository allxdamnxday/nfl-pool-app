// frontend/src/components/EntryDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEntry } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';

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
    return <div className="text-center text-white">Loading entry details...</div>;
  }

  if (!entry) {
    return <div className="text-center text-white">Entry not found.</div>;
  }

  const handlePickEmClick = () => {
    navigate(`/entries/${entryId}/picks`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Entry Details</h1>
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-purple-400 mb-6 text-center">{entry.pool.name}</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-lg font-semibold">{entry.isActive ? 'Active' : 'Inactive'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Current Week</p>
            <p className="text-lg font-semibold">{entry.pool.currentWeek}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg col-span-2">
            <p className="text-sm text-gray-400">Entry Status</p>
            <p className="text-lg font-semibold">{entry.isEliminated ? 'Eliminated' : 'Still In'}</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4">Pick History</h3>
        {entry.picks && entry.picks.length > 0 ? (
          <ul className="space-y-3">
            {entry.picks.map((pick, index) => (
              <li key={pick._id} className="bg-gray-700 p-4 rounded-lg">
                <p className="font-semibold text-purple-400">Week {index + 1}</p>
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
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition duration-300 font-semibold"
            >
              Pick 'Em
            </button>
          )}
          <Link 
            to="/entries" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
          >
            Back to Entries
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EntryDetail;