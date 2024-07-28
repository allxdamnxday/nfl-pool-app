// frontend/src/components/Picks.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGamesForWeek, addOrUpdatePick, getPickForWeek } from '../services/pickService';
import { useToast } from '../contexts/ToastContext';
import { FaCalendarAlt, FaClock, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seasonYear = new Date().getFullYear();
        const weekNumber = parseInt(currentWeek) || 1;
        console.log('Fetching data for:', { seasonYear, weekNumber, entryId });
        const [gamesData, pickData] = await Promise.all([
          getGamesForWeek(seasonYear, weekNumber),
          getPickForWeek(entryId, weekNumber)
        ]);
        console.log('Fetched games:', gamesData);
        console.log('Fetched pick:', pickData);
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
      const updatedPick = await addOrUpdatePick(entryId, selectedTeam, weekNumber);
      setCurrentPick(updatedPick);
      showToast('Pick submitted successfully', 'success');
      setShowConfirmation(false);
      navigate('/user-entries');
    } catch (error) {
      console.error('Error submitting pick:', error);
      showToast('Failed to submit pick. Please try again.', 'error');
    }
  };

  const handleWeekChange = (direction) => {
    const newWeek = direction === 'next' ? currentWeek + 1 : currentWeek - 1;
    if (newWeek >= 1 && newWeek <= 18) {  // Assuming NFL season has 18 weeks
      setCurrentWeek(newWeek);
      navigate(`/entries/${entryId}/picks/${newWeek}`);
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (games.length === 0) {
    return <div className="text-center text-white">No games scheduled for the current week.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => handleWeekChange('prev')} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
          disabled={currentWeek === 1}
        >
          <FaArrowLeft className="mr-2" /> Previous Week
        </button>
        <h1 className="text-4xl font-bold text-center">Make Your Pick - Week {currentWeek}</h1>
        <button 
          onClick={() => handleWeekChange('next')} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
          disabled={currentWeek === 18}
        >
          Next Week <FaArrowRight className="ml-2" />
        </button>
      </div>
      <div className="max-w-3xl mx-auto space-y-6">
        {games.map((game) => (
          <div key={game._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-gray-400">
                  <FaCalendarAlt className="mr-2" />
                  <span>{new Date(game.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <FaClock className="mr-2" />
                  <span>{new Date(game.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-center w-5/12">
                  <h2 className="text-2xl font-bold mb-2">{game.away_team}</h2>
                  <p className="text-gray-400">{game.away_team_record || '0-0'}</p>
                  <button
                    onClick={() => handlePickClick(game.away_team)}
                    className={`mt-4 ${currentPick && currentPick === game.away_team ? 'bg-green-600' : 'bg-purple-600'} hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition duration-300`}
                  >
                    {currentPick && currentPick === game.away_team ? 'Current Pick' : `Pick ${game.away_team}`}
                  </button>
                </div>
                <div className="text-4xl font-bold">VS</div>
                <div className="text-center w-5/12">
                  <h2 className="text-2xl font-bold mb-2">{game.home_team}</h2>
                  <p className="text-gray-400">{game.home_team_record || '0-0'}</p>
                  <button
                    onClick={() => handlePickClick(game.home_team)}
                    className={`mt-4 ${currentPick && currentPick === game.home_team ? 'bg-green-600' : 'bg-purple-600'} hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition duration-300`}
                  >
                    {currentPick && currentPick === game.home_team ? 'Current Pick' : `Pick ${game.home_team}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="mb-4">Are you sure you want to pick {selectedTeam}?</p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPick}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Confirm Pick
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Picks;