// frontend/src/components/Picks.jsx

import React, { useState, useEffect } from 'react';
import { getUserEntries } from '../services/entryService';
import { addPick } from '../services/pickService';
import { useToast } from '../contexts/ToastContext';

function Picks() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  // This is a placeholder. In a real application, you'd fetch this from your backend.
  const teams = ['Team A', 'Team B', 'Team C', 'Team D']; 

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const fetchedEntries = await getUserEntries();
        const activeEntries = fetchedEntries.filter(entry => entry.isActive);
        setEntries(activeEntries);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
        showToast('Failed to load entries. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchEntries();
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry || !selectedTeam) {
      showToast('Please select an entry and a team', 'error');
      return;
    }

    try {
      await addPick(selectedEntry, { team: selectedTeam });
      showToast('Pick successfully submitted', 'success');
      // Reset form
      setSelectedEntry('');
      setSelectedTeam('');
    } catch (error) {
      console.error('Failed to submit pick:', error);
      showToast('Failed to submit pick. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center text-white">You don't have any active entries to make picks for.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Make a Pick</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="entry" className="block mb-2">Select Entry:</label>
          <select
            id="entry"
            value={selectedEntry}
            onChange={(e) => setSelectedEntry(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
          >
            <option value="">Select an entry</option>
            {entries.map((entry) => (
              <option key={entry._id} value={entry._id}>{entry.pool.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="team" className="block mb-2">Select Team:</label>
          <select
            id="team"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600">
          Submit Pick
        </button>
      </form>
    </div>
  );
}

export default Picks;