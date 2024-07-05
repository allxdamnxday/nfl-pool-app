// frontend/src/components/PoolDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoolDetails, joinPool } from '../services/poolService';
import { createPick } from '../services/pickService';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function PoolDetails() {
  const [pool, setPool] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoolDetails = async () => {
      try {
        const { pool, games } = await getPoolDetails(id);
        setPool(pool);
        setGames(games);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pool details. Please try again later.');
        setLoading(false);
      }
    };

    fetchPoolDetails();
  }, [id]);

  const handleJoinPool = async () => {
    try {
      await joinPool(id);
      showToast('Successfully joined the pool!', 'success');
      // Refresh pool details after joining
      const { pool: updatedPool } = await getPoolDetails(id);
      setPool(updatedPool);
    } catch (err) {
      showToast('Failed to join the pool. Please try again later.', 'error');
    }
  };

  const handleMakePick = async () => {
    if (!selectedGame || !selectedTeam) {
      showToast('Please select a game and a team', 'error');
      return;
    }

    try {
      await createPick(id, {
        game: selectedGame._id,
        team: selectedTeam._id,
        market: selectedGame.markets[0].marketId, // Assuming we're using the first market (e.g., moneyline)
      });
      showToast('Pick submitted successfully!', 'success');
      navigate(`/pools/${id}`);
    } catch (err) {
      showToast('Failed to submit pick. Please try again.', 'error');
    }
  };

  if (loading) return <div className="text-center">Loading pool details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!pool) return <div className="text-center">Pool not found.</div>;

  const isUserParticipant = pool.participants.some(participant => participant._id === user.id);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-4">{pool.name}</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">Season: {pool.season}</p>
          <p className="text-gray-600">Current Week: {pool.currentWeek}</p>
          <p className="text-gray-600">Status: {pool.status}</p>
        </div>
        <div>
          <p className="text-gray-600">Participants: {pool.participants.length} / {pool.maxParticipants}</p>
          <p className="text-gray-600">Entry Fee: ${pool.entryFee}</p>
          <p className="text-gray-600">Prize: ${pool.prizeAmount}</p>
        </div>
      </div>
      {isUserParticipant && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Make Your Pick</h2>
          <div className="mb-4">
            {games.map((game) => (
              <div key={game._id} className="mb-2 p-2 border rounded">
                <Link to={`/games/${game._id}`} className="text-blue-500 hover:underline">
                  {game.homeTeam.name} vs {game.awayTeam.name} - {new Date(game.eventDate).toLocaleDateString()}
                </Link>
                <button
                  onClick={() => setSelectedGame(game)}
                  className={`ml-4 px-2 py-1 rounded ${selectedGame === game ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
          {selectedGame && (
            <div className="mb-4">
              <button
                onClick={() => setSelectedTeam(selectedGame.homeTeam)}
                className={`mr-4 px-4 py-2 rounded ${selectedTeam === selectedGame.homeTeam ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {selectedGame.homeTeam.name}
              </button>
              <button
                onClick={() => setSelectedTeam(selectedGame.awayTeam)}
                className={`px-4 py-2 rounded ${selectedTeam === selectedGame.awayTeam ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {selectedGame.awayTeam.name}
              </button>
            </div>
          )}
          <button 
            onClick={handleMakePick}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!selectedGame || !selectedTeam}
          >
            Submit Pick
          </button>
        </div>
      )}
    </div>
  );
}

export default PoolDetails;