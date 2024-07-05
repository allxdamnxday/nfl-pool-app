// frontend/src/components/GameDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGameDetails } from '../services/gameService';
import { useToast } from '../contexts/ToastContext';

function GameDetails() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const showToast = useToast();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const gameData = await getGameDetails(id);
        setGame(gameData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch game details. Please try again later.');
        showToast('Error loading game details', 'error');
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id, showToast]);

  if (loading) return <div className="text-center">Loading game details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!game) return <div className="text-center">Game not found.</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-4">
        {game.homeTeam.name} vs {game.awayTeam.name}
      </h1>
      <div className="mb-4">
        <p className="text-gray-600">Date: {new Date(game.eventDate).toLocaleString()}</p>
        <p className="text-gray-600">Season: {game.season}</p>
        <p className="text-gray-600">Week: {game.week}</p>
        <p className="text-gray-600">Status: {game.status}</p>
      </div>
      <h2 className="text-2xl font-bold mb-2">Markets</h2>
      {game.markets.map((market) => (
        <div key={market.marketId} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold mb-2">{market.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            {market.participants.map((participant) => (
              <div key={participant.participantId} className="bg-gray-100 p-2 rounded">
                <p className="font-medium">{participant.name}</p>
                {participant.lines.map((line, index) => (
                  <div key={index} className="text-sm">
                    {line.value && <span>Line: {line.value}</span>}
                    {Object.entries(line.prices).map(([affiliateId, price]) => (
                      <p key={affiliateId}>
                        Odds: {price.price} (Affiliate: {affiliateId})
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default GameDetails;