import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaFootballBall, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getUserEntriesWithPicks } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { LogoSpinner } from './CustomComponents';

function UserEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEntry, setCurrentEntry] = useState(0);
  const showToast = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const fetchedEntries = await getUserEntriesWithPicks();
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

  const handleEntryChange = (direction) => {
    if (direction === 'prev' && currentEntry > 0) {
      setCurrentEntry(currentEntry - 1);
    } else if (direction === 'next' && currentEntry < entries.length - 1) {
      setCurrentEntry(currentEntry + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-white">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-12 bg-white p-6 rounded-lg shadow-md">{error}</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">No Entries Yet</h1>
          <p className="mb-6">You haven't joined any pools or made any entries yet.</p>
          <Link 
            to="/pools"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-block"
          >
            Browse Available Pools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 px-4 py-6"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-purple-600 leading-tight">
          Your Entries and Picks
        </h1>
        
        <EntrySelector 
          currentEntry={currentEntry}
          totalEntries={entries.length}
          onEntryChange={handleEntryChange}
          entryName={entries[currentEntry]?.pool.name}
        />

        <AnimatePresence>
          <motion.div 
            key={entries[currentEntry]?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 md:space-y-6"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
              <WeekCard
                key={week}
                week={week}
                pick={entries[currentEntry]?.picks.find(p => p.week === week)}
                entryId={entries[currentEntry]?._id}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <PickStatus currentPick={entries[currentEntry]?.picks[entries[currentEntry]?.picks.length - 1]} />
      </div>
    </motion.div>
  );
}

function EntrySelector({ currentEntry, totalEntries, onEntryChange, entryName }) {
  return (
    <motion.div 
      className="flex justify-between items-center mb-6 bg-white p-2 rounded-full shadow-md overflow-hidden"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onEntryChange('prev')} 
        className="bg-purple-600 p-2 rounded-full text-white shadow-lg transition-all duration-300"
        disabled={currentEntry === 0}
      >
        <FaChevronLeft />
      </motion.button>
      <span className="text-lg md:text-xl font-bold px-4 py-2 truncate text-gray-800">
        {entryName}
      </span>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onEntryChange('next')} 
        className="bg-purple-600 p-2 rounded-full text-white shadow-lg transition-all duration-300"
        disabled={currentEntry === totalEntries - 1}
      >
        <FaChevronRight />
      </motion.button>
    </motion.div>
  );
}

function WeekCard({ week, pick, entryId }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-lg shadow-md overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-purple-600 flex items-center">
          <FaCalendarAlt className="mr-2" />
          Week {week}
        </h3>
        <Link 
          to={`/entries/${entryId}/picks/${week}`}
          className={`font-bold py-2 px-4 rounded-full text-sm transition-colors duration-200 ${
            pick 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {pick ? 'Change Pick' : 'Make Pick'}
        </Link>
      </div>
      {pick && (
        <div className="text-gray-700">
          <p className="font-semibold">{pick.team}</p>
          {pick.game && (
            <div className="mt-2">
              <p className="text-sm flex items-center text-gray-500">
                <FaCalendarAlt className="mr-2" />
                {new Date(pick.game.event_date).toLocaleDateString()}
              </p>
              <p className="text-sm flex items-center text-gray-500">
                {pick.game.away_team} vs {pick.game.home_team}
              </p>
            </div>
          )}
          <p className="text-sm flex items-center text-gray-500">
            <FaClock className="mr-2" />
            {pick.result || 'Pending'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function PickStatus({ currentPick }) {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg"
    >
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <span className="text-gray-700 flex items-center">
          <FaFootballBall className="mr-2 text-purple-600" />
          {currentPick ? '1/1 picks made' : '0/1 picks made'}
        </span>
        {currentPick && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-purple-600">Current Pick:</span>
            <span className="font-semibold text-gray-800">{currentPick.team}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default UserEntries;