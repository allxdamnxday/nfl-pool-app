// frontend/src/components/MakePick.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoolDetails } from '../services/poolService';
import { getGamesForWeek, addOrUpdatePick } from '../services/pickService';
import { FaFootballBall, FaCalendarAlt } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';
import { useToast } from '../contexts/ToastContext';

function MakePick() {
  const [pool, setPool] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id, entryNumber } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const poolData = await getPoolDetails(id);
        setPool(poolData);
        const gamesData = await getGamesForWeek(poolData.seasonYear, poolData.currentWeek);
        setGames(gamesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      showToast('Please select a team before submitting.', 'error');
      return;
    }
    try {
      await addOrUpdatePick(id, entryNumber, selectedTeam, pool.currentWeek);
      showToast('Pick submitted successfully!', 'success');
      navigate(`/pools/${id}`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        showToast(err.response.data.message, 'error');
      } else {
        showToast('Failed to submit pick. Please try again.', 'error');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LogoSpinner size={20} /></div>;
  if (error) return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  if (!pool) return <div className="text-center text-white text-2xl mt-12">Pool not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-purple-400 flex items-center">
          <FaFootballBall className="mr-2" />
          Make Your Pick
        </h2>
        <p className="mb-4 text-gray-300">Pool: {pool.name}</p>
        <p className="mb-6 text-gray-300 flex items-center">
          <FaCalendarAlt className="mr-2 text-yellow-400" />
          Current Week: {pool.currentWeek}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="team" className="block mb-2 text-gray-300">Select Team</label>
            <select
              id="team"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a team</option>
              {games.map((game) => (
                <React.Fragment key={game._id}>
                  <option value={game.home_team}>{game.home_team}</option>
                  <option value={game.away_team}>{game.away_team}</option>
                </React.Fragment>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
            Submit Pick
          </button>
        </form>
      </div>
    </div>
  );
}

export default MakePick;