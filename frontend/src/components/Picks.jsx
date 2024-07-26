// frontend/src/components/Picks.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentWeekGames } from '../services/gameService';
import { addPick } from '../services/pickService';
import { useToast } from '../contexts/ToastContext';

function Picks() {
  const [games, setGames] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { entryId } = useParams();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const fetchedGames = await getCurrentWeekGames();
        setGames(fetchedGames);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch games:', error);
        showToast('Failed to load games. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchGames();
  }, [showToast]);

  const handleSubmitPick = async () => {
    if (!selectedTeam) {
      showToast('Please select a team', 'error');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmPick = async () => {
    try {
      await addPick(entryId, selectedTeam);
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

  if (games.length === 0) {
    return (
      <div className="text-center text-white">
        <p>No games available for picking at this time.</p>
        <Link to={`/entries/${entryId}`} className="text-blue-400 hover:underline">
          Return to Entry Details
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Make Your Pick</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game._id} className="bg-gray-800 shadow-md rounded-lg p-6">
            <p className="text-lg font-semibold mb-2">{game.awayTeam} @ {game.homeTeam}</p>
            <p className="text-sm text-gray-400 mb-2">Date: {new Date(game.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-400 mb-4">Kickoff: {new Date(game.date).toLocaleTimeString()}</p>
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedTeam(game.awayTeam)}
                className={`px-4 py-2 rounded ${
                  selectedTeam === game.awayTeam ? 'bg-purple-600' : 'bg-gray-600'
                } hover:bg-purple-500 transition duration-300`}
              >
                {game.awayTeam}
              </button>
              <button
                onClick={() => setSelectedTeam(game.homeTeam)}
                className={`px-4 py-2 rounded ${
                  selectedTeam === game.homeTeam ? 'bg-purple-600' : 'bg-gray-600'
                } hover:bg-purple-500 transition duration-300`}
              >
                {game.homeTeam}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Link
          to={`/entries/${entryId}`}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition duration-300"
        >
          Back to Entry
        </Link>
        <button
          onClick={handleSubmitPick}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300"
        >
          Submit Pick
        </button>
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
                onClick={confirmPick}
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