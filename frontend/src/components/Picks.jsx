import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGamesForWeek, addOrUpdatePick, getPickForWeek } from '../services/pickService';
import { useToast } from '../contexts/ToastContext';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaFootballBall } from 'react-icons/fa';
import defaultLogo from '/img/nfl_logos/default-team-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoSpinner } from './CustomComponents';

function Picks() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPick, setCurrentPick] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { entryId, week } = useParams();
  const showToast = useToast();
  const [currentWeek, setCurrentWeek] = useState(parseInt(week) || 1);
  const totalWeeks = 18; // Adjust this based on your NFL season structure

  const getTeamLogo = (team) => {
    if (team && team.abbreviation) {
      return `/img/nfl_logos/${team.abbreviation}.png`;
    }
    return defaultLogo;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seasonYear = new Date().getFullYear();
        const weekNumber = parseInt(currentWeek) || 1;
        const [gamesData, pickData] = await Promise.all([
          getGamesForWeek(seasonYear, weekNumber),
          getPickForWeek(entryId, weekNumber)
        ]);
        setGames(gamesData);
        if (pickData) {
          setCurrentPick(pickData.team);
          setSelectedTeam(pickData.team);
        } else {
          setCurrentPick(null);
          setSelectedTeam(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entryId, currentWeek, showToast]);

  const handlePickClick = (team) => {
    setSelectedTeam(team);
    setShowConfirmation(true);
  };

  const handleConfirmPick = async () => {
    try {
      const weekNumber = parseInt(currentWeek) || 1;
      await addOrUpdatePick(entryId, selectedTeam, weekNumber);
      showToast('Pick submitted successfully', 'success');
      setCurrentPick(selectedTeam); // Ensure currentPick is set as a string
      setShowConfirmation(false);
      navigate('/user-entries');
    } catch (error) {
      console.error('Error submitting pick:', error);
      if (error.response && error.response.data && error.response.data.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Failed to submit pick. Please try again.', 'error');
      }
    }
  };

  const handleWeekChange = (direction) => {
    if (direction === 'prev' && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    } else if (direction === 'next' && currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (games.length === 0) {
    return <div className="text-center text-white text-2xl mt-12">No games scheduled for the current week.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 md:p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      <h1 className="text-5xl font-bold mb-8 text-center text-purple-400 relative z-10">Make Your Pick</h1>
      
      <WeekSelector 
        currentWeek={currentWeek} 
        totalWeeks={totalWeeks} 
        onWeekChange={handleWeekChange} 
      />

      <AnimatePresence>
        {games.map((game) => (
          <GameCard 
            key={game._id}
            game={game}
            currentPick={currentPick}
            onPickClick={handlePickClick}
          />
        ))}
      </AnimatePresence>

      {showConfirmation && (
        <ConfirmationModal 
          selectedTeam={selectedTeam}
          onConfirm={handleConfirmPick}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      <PickStatus currentPick={currentPick} />
    </motion.div>
  );
}

function WeekSelector({ currentWeek, totalWeeks, onWeekChange }) {
  return (
    <motion.div 
      className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg shadow-lg"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onWeekChange('prev')} 
        className="bg-purple-600 p-3 rounded-full text-white shadow-lg transition-all duration-300"
        disabled={currentWeek === 1}
      >
        <FaChevronLeft />
      </motion.button>
      <span className="text-3xl font-bold bg-purple-600 px-8 py-3 rounded-full shadow-inner">
        Week {currentWeek}
      </span>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onWeekChange('next')} 
        className="bg-purple-600 p-3 rounded-full text-white shadow-lg transition-all duration-300"
        disabled={currentWeek === totalWeeks}
      >
        <FaChevronRight />
      </motion.button>
    </motion.div>
  );
}

function GameCard({ game, currentPick, onPickClick }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 mb-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      <div className="flex justify-between items-center mb-4 text-gray-300">
        <div className="flex items-center text-sm">
          <FaCalendarAlt className="mr-2 text-purple-400" />
          <span>{new Date(game.event_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-sm">
          <FaClock className="mr-2 text-purple-400" />
          <span>{new Date(game.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <TeamButton
          team={game.away_team}
          record={game.teams_normalized.find(t => t.is_away)?.record || '0-0'}
          isSelected={currentPick === game.away_team}
          onClick={() => onPickClick(game.away_team)}
        />
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-400 mb-2">VS</span>
          <motion.div 
            className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <FaFootballBall />
          </motion.div>
        </div>
        <TeamButton
          team={game.home_team}
          record={game.teams_normalized.find(t => !t.is_away)?.record || '0-0'}
          isSelected={currentPick === game.home_team}
          onClick={() => onPickClick(game.home_team)}
        />
      </div>
    </motion.div>
  );
}

function TeamButton({ team, record, isSelected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-300 ${
        isSelected ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
      }`}
    >
      <img
        src={`/img/nfl_logos/${team.split(' ')[0].substring(0, 3).toUpperCase()}.png`}
        alt={`${team} logo`}
        className="w-20 h-20 object-contain"
        onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
      />
      <span className="font-bold text-lg">{team}</span>
      <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">{record}</span>
    </motion.button>
  );
}

function ConfirmationModal({ selectedTeam, onConfirm, onCancel }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-lg shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-4">Confirm Your Pick</h2>
        <p className="mb-6 text-lg">Are you sure you want to pick <span className="font-bold text-purple-400">{selectedTeam}</span>?</p>
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors duration-200"
          >
            Confirm Pick
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PickStatus({ currentPick }) {
  const isString = (value) => typeof value === 'string';

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 shadow-lg"
    >
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <span className="text-gray-300 flex items-center">
          <FaFootballBall className="mr-2 text-purple-400" />
          {currentPick ? '1/1 picks made' : '0/1 picks made'}
        </span>
        {currentPick && isString(currentPick) && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-purple-400">Current Pick:</span>
            <img
              src={`/img/nfl_logos/${currentPick.split(' ')[0].substring(0, 3).toUpperCase()}.png`}
              alt={`${currentPick} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
            />
            <span className="font-semibold">{currentPick}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Picks;