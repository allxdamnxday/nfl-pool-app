// frontend/src/components/AdminDashboard.jsx

import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { 
  syncNFLSchedule, 
  updateGameData, 
  initializeSeasonData,
  runClosingService
} from '../services/adminService';

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [closingDate, setClosingDate] = useState('');
  const showToast = useToast();

  const handleSyncSchedule = async () => {
    setLoading(true);
    try {
      await syncNFLSchedule();
      showToast('NFL Schedule synced successfully', 'success');
    } catch (error) {
      showToast('Failed to sync NFL Schedule', 'error');
    }
    setLoading(false);
  };

  const handleUpdateGameData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      await updateGameData(today);
      showToast('Game data updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update game data', 'error');
    }
    setLoading(false);
  };

  const handleInitializeSeason = async () => {
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      await initializeSeasonData(year);
      showToast(`Season ${year} initialized successfully`, 'success');
    } catch (error) {
      showToast('Failed to initialize season', 'error');
    }
    setLoading(false);
  };

  const handleRunClosingService = async () => {
    setLoading(true);
    try {
      const dateToUse = closingDate || new Date().toISOString().split('T')[0];
      await runClosingService(dateToUse);
      showToast('Closing service completed successfully', 'success');
    } catch (error) {
      showToast('Failed to run closing service', 'error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Data Management</h2>
      <div className="space-y-4">
        <button 
          onClick={handleSyncSchedule} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          Sync NFL Schedule
        </button>
        <button 
          onClick={handleUpdateGameData} 
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
        >
          Update Game Data
        </button>
        <button 
          onClick={handleInitializeSeason} 
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300"
        >
          Initialize New Season
        </button>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button 
            onClick={handleRunClosingService} 
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
          >
            Run Closing Service
          </button>
        </div>
      </div>
      {loading && <p className="mt-4">Loading...</p>}
    </div>
  );
}

export default AdminDashboard;