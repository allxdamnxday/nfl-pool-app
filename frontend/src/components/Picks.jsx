// frontend/src/components/Picks.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGamesForWeek } from '../services/gameService';
import { addPick } from '../services/pickService';
import { useToast } from '../contexts/ToastContext';
import { getCurrentNFLWeek } from '../utils/nflWeekCalculator';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

function Picks() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentSeason, setCurrentSeason] = useState(2024);
  const { entryId } = useParams();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { week, season } = getCurrentNFLWeek();
    setCurrentWeek(week);
    setCurrentSeason(season);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const fetchedGames = await getGamesForWeek(currentWeek, currentSeason);
        setGames(fetchedGames);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch games:', error);
        showToast('Failed to load games. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchGames();
  }, [currentWeek, currentSeason, showToast]);

  const handleSubmitPick = async (teamId) => {
    try {
      await addPick(entryId, teamId, currentWeek);
      showToast('Pick submitted successfully', 'success');
      navigate(`/entries/${entryId}`);
    } catch (error) {
      console.error('Failed to submit pick:', error);
      showToast('Failed to submit pick. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading games...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Make Your Pick - Week {currentWeek}</h1>
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
                    onClick={() => handleSubmitPick(game.away_team_id)}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition duration-300"
                  >
                    Pick {game.away_team}
                  </button>
                </div>
                <div className="text-4xl font-bold">VS</div>
                <div className="text-center w-5/12">
                  <h2 className="text-2xl font-bold mb-2">{game.home_team}</h2>
                  <p className="text-gray-400">{game.home_team_record || '0-0'}</p>
                  <button
                    onClick={() => handleSubmitPick(game.home_team_id)}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition duration-300"
                  >
                    Pick {game.home_team}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {games.length === 0 ? (
        <div className="text-center">
          <p>No games available for picking at this time.</p>
          <Link to={`/entries/${entryId}`} className="text-blue-400 hover:underline">
            Return to Entry Details
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default Picks;