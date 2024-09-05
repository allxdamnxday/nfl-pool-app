import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaFootballBall, FaTv } from 'react-icons/fa';
import { format } from 'date-fns';
import { getUserEntriesWithPicks } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { LogoSpinner } from './CustomComponents';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Import the api instance

function UserEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEntry, setCurrentEntry] = useState(0);
  const showToast = useToast();
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Or however you're storing the token
      const response = await api.get('/entries/user/with-picks', {
        params: { 
          populate: 'true',
          timestamp: Date.now()
        }
      });
      setEntries(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      setError('Failed to load entries. Please try again later.');
      showToast('Failed to load entries. Please try again later.', 'error');
      
      // If the error is due to an invalid token, you might want to redirect to login
      if (error.response && error.response.status === 401) {
        // Redirect to login page or refresh token
        // For example: history.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRefresh = () => {
    fetchEntries();
    showToast('Refreshing entries...', 'info');
  };

  const handleEntryChange = (direction) => {
    if (direction === 'prev' && currentEntry > 0) {
      setCurrentEntry(currentEntry - 1);
    } else if (direction === 'next' && currentEntry < entries.length - 1) {
      setCurrentEntry(currentEntry + 1);
    }
  };

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
        <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
        <div className="bg-white rounded-xl p-12 shadow-lg text-center border border-gray-200">
          <FaFootballBall className="mx-auto h-24 w-24 text-nfl-gold mb-8 animate-bounce" />
          <p className="mb-6 text-2xl text-gray-600">You haven't joined any pools or made any entries yet.</p>
          <Link 
            to="/pools"
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
          >
            Browse Available Pools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/img-optimized/playbook_medium.webp"
            alt="Football playbook background"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Your <span className="text-nfl-gold">Entries and Picks</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Manage your active entries here</p>
            <button
              onClick={handleRefresh}
              className="bg-nfl-gold hover:bg-yellow-500 text-nfl-blue font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Refresh Entries
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <p className="text-xl text-gray-600">Loading entries...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-xl text-red-600">{error}</p>
          </div>
        ) : (
          <>
            <EntrySelector 
              currentEntry={currentEntry}
              totalEntries={entries.length}
              onEntryChange={handleEntryChange}
              entryName={entries[currentEntry]?.pool.name}
              entryNumber={entries[currentEntry]?.entryNumber}
            />
            <div className="space-y-6 mt-8">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
                <WeekCard
                  key={week}
                  week={week}
                  pick={entries[currentEntry]?.picks.find(p => p.week === week)}
                  entryId={entries[currentEntry]?._id}
                  entryNumber={entries[currentEntry]?.entryNumber}
                />
              ))}
            </div>

            <PickStatus currentPick={entries[currentEntry]?.picks[entries[currentEntry]?.picks.length - 1]} />
          </>
        )}
      </div>
    </div>
  );
}

function EntrySelector({ currentEntry, totalEntries, onEntryChange, entryName, entryNumber }) {
  return (
    <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple rounded-xl shadow-lg mb-8 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
            {entryName}
          </h2>
          <p className="text-lg sm:text-xl text-nfl-gold font-semibold">
            Entry #{entryNumber}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onEntryChange('prev')} 
            className="bg-white hover:bg-gray-200 text-nfl-blue font-bold p-3 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentEntry === 0}
          >
            <FaChevronLeft className="text-xl" />
          </button>
          
          <p className="text-white text-sm">
            Entry {currentEntry + 1} of {totalEntries}
          </p>
          
          <button 
            onClick={() => onEntryChange('next')} 
            className="bg-white hover:bg-gray-200 text-nfl-blue font-bold p-3 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentEntry === totalEntries - 1}
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WeekCard({ week, pick, entryId, entryNumber }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Time' : format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Time Error';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
        <h3 className="text-xl font-semibold text-nfl-white flex items-center">
          <FaCalendarAlt className="mr-2" />
          Week {week}
        </h3>
      </div>
      <div className="p-4">
        {pick && pick.game ? (
          <div className="text-gray-700">
            <p className="font-semibold text-nfl-blue">{pick.team || 'Team Not Selected'}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm flex items-center text-gray-500">
                <FaCalendarAlt className="mr-2" />
                {formatDate(pick.game.event_date)}
              </p>
              <p className="text-sm flex items-center text-gray-500">
                <FaFootballBall className="mr-2" />
                {pick.game.away_team} vs {pick.game.home_team}
              </p>
              <p className="text-sm flex items-center text-gray-500">
                <FaClock className="mr-2" />
                {formatTime(pick.game.event_date)}
              </p>
              {pick.game.schedule && pick.game.schedule.broadcast && (
                <p className="text-sm flex items-center text-gray-500">
                  <FaTv className="mr-2" />
                  {pick.game.schedule.broadcast}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No pick made for this week</p>
        )}
        <div className="mt-4">
          <Link 
            to={`/entries/${entryId}/${entryNumber}/picks/${week}`}
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full text-sm transition duration-300 inline-block transform hover:scale-105"
          >
            {pick ? 'Change Pick' : 'Make Pick'}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PickStatus({ currentPick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <span className="text-gray-700 flex items-center">
          <FaFootballBall className="mr-2 text-nfl-purple" />
          {currentPick ? '1/1 picks made' : '0/1 picks made'}
        </span>
        {currentPick && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-nfl-blue">Current Pick:</span>
            <span className="font-semibold text-nfl-purple">{currentPick.team}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserEntries;