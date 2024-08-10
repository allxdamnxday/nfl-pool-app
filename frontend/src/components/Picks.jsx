import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGamesForWeek, addOrUpdatePick, getPickForWeek } from '../services/pickService';
import { useToast } from '../contexts/ToastContext';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaFootballBall } from 'react-icons/fa';
import defaultLogo from '/logos/default-team-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoSpinner } from './CustomComponents';
const teamLogoMap = {
'ARI': 'ARI.png',
'ATL': 'ATL.png',
'BAL': 'BAL.png',
'BUF': 'BUF.png',
'CAR': 'CAR.png',
'CHI': 'CHI.png',
'CIN': 'CIN.png',
'CLE': 'CLE.png',
'DAL': 'DAL.png',
'DEN': 'DEN.png',
'DET': 'DET.png',
'GB': 'GB.png',
'HOU': 'HOU.png',
'IND': 'IND.png',
'JAX': 'JAX.png',
'KC': 'KC.png',
'LAC': 'LAC.png',
'LAR': 'LAR.png',
'LAS': 'LAS.png',
'MIA': 'MIA.png',
'MIN': 'MIN.png',
'NE': 'NE.png',
'NO': 'NO.png',
'NYG': 'NYG.png',
'NYJ': 'NYJ.png',
'PHI': 'PHI.png',
'PIT': 'PIT.png',
'SEA': 'SEA.png',
'SF': 'SF.png',
'TB': 'TB.png',
'TEN': 'TEN.png',
'WSH': 'WSH.png',
};

function Picks() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPick, setCurrentPick] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { entryId, entryNumber, week } = useParams();
  const showToast = useToast();
  const [currentWeek, setCurrentWeek] = useState(parseInt(week) || 1);
  const totalWeeks = 18; // Adjust this based on your NFL season structure

  const getTeamLogo = (team) => {
    if (team && team.abbreviation && teamLogoMap[team.abbreviation]) {
      return `/img/nfl_logos/${teamLogoMap[team.abbreviation]}`;
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
          getPickForWeek(entryId, entryNumber, weekNumber)
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
  }, [entryId, entryNumber, currentWeek, showToast]);

  const handlePickClick = (team) => {
    setSelectedTeam(team);
    setShowConfirmation(true);
  };

  const handleConfirmPick = async () => {
    try {
      const weekNumber = parseInt(currentWeek) || 1;
      await addOrUpdatePick(entryId, entryNumber, selectedTeam, weekNumber);
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
    return <div className="text-center text-gray-800 text-2xl mt-12">No games scheduled for the current week.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">Make Your Pick</h1>
        
        <WeekSelector 
          currentWeek={currentWeek} 
          totalWeeks={totalWeeks} 
          onWeekChange={handleWeekChange} 
        />

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {games.map((game) => (
            <GameCard 
              key={game._id}
              game={game}
              currentPick={currentPick}
              onPickClick={handlePickClick}
            />
          ))}
        </div>
        
        {showConfirmation && (
          <ConfirmationModal 
            selectedTeam={selectedTeam}
            onConfirm={handleConfirmPick}
            onCancel={() => setShowConfirmation(false)}
          />
        )}

        <PickStatus currentPick={currentPick} />
      </div>
    </motion.div>
  );
}

function WeekSelector({ currentWeek, totalWeeks, onWeekChange }) {
  return (
    <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onWeekChange('prev')} 
        className="bg-purple-600 p-3 rounded-full text-white shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentWeek === 1}
      >
        <FaChevronLeft />
      </motion.button>
      <span className="text-2xl font-bold text-gray-800">
        Week {currentWeek}
      </span>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onWeekChange('next')} 
        className="bg-purple-600 p-3 rounded-full text-white shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentWeek === totalWeeks}
      >
        <FaChevronRight />
      </motion.button>
    </div>
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
      className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      <div className="flex justify-between items-center mb-4 text-gray-600 text-xs sm:text-sm">
        <div className="flex items-center">
          <FaCalendarAlt className="mr-1 sm:mr-2 text-purple-400" />
          <span>{new Date(game.event_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <FaClock className="mr-1 sm:mr-2 text-purple-400" />
          <span>{new Date(game.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <TeamButton
          team={game.away_team}
          record={game.teams_normalized.find(t => t.is_away)?.record || '0-0'}
          isSelected={currentPick === game.away_team}
          onClick={() => onPickClick(game.away_team)}
        />
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">VS</span>
          <motion.div 
            className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl"
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
      className={`flex flex-col items-center justify-between p-2 sm:p-4 rounded-lg transition-all duration-300 h-36 sm:h-48 w-32 sm:w-40 ${
        isSelected ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      <img
        src={getTeamLogo(team)}
        alt={`${team.name} logo`}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-1 sm:mb-2"
        onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
      />
      <span className="font-bold text-xs sm:text-sm mb-1 text-center">{team}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-white text-purple-600' : 'bg-gray-800 text-white'}`}>
        {record}
      </span>
    </motion.button>
  );
}

function ConfirmationModal({ selectedTeam, onConfirm, onCancel }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirm Your Pick</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to pick <span className="font-bold text-purple-600">{selectedTeam}</span>?</p>
        <div className="flex justify-end space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Confirm Pick
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PickStatus({ currentPick }) {
  const isString = (value) => typeof value === 'string';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-sm border-t border-gray-200">
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <span className="text-gray-300 flex items-center">
          <FaFootballBall className="mr-2 text-purple-400" />
          {currentPick ? '1/1 picks made' : '0/1 picks made'}
        </span>
        {currentPick && isString(currentPick) && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-purple-400">Current Pick:</span>
            <img
              src={getTeamLogo({ abbreviation: currentPick.split(' ')[0].substring(0, 3).toUpperCase() })}
              alt={`${currentPick} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }}
            />
            <span className="font-semibold">{currentPick}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Picks;