// frontend/src/components/GameDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGamesForWeek } from '../services/gameService';
import { useToast } from '../contexts/ToastContext';

function GameDetails() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { seasonYear, week, eventId } = useParams();
  const showToast = useToast();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const games = await getGamesForWeek(seasonYear, week);
        const gameData = games.find(g => g.event_id === eventId);
        if (gameData) {
          setGame(gameData);
        } else {
          setError('Game not found.');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch game details. Please try again later.');
        showToast('Error loading game details', 'error');
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [seasonYear, week, eventId, showToast]);

  if (loading) return <div className="text-center">Loading game details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!game) return <div className="text-center">Game not found.</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-4">
        {game.away_team} vs {game.home_team}
      </h1>
      <div className="mb-4">
        <p className="text-gray-600">Date: {new Date(game.event_date).toLocaleString()}</p>
        <p className="text-gray-600">Season: {game.schedule.season_year}</p>
        <p className="text-gray-600">Week: {game.schedule.week}</p>
        <p className="text-gray-600">Type: {game.schedule.season_type}</p>
        <p className="text-gray-600">Status: {game.score.event_status}</p>
        {game.score.event_status_detail && <p className="text-gray-600">Status Detail: {game.score.event_status_detail}</p>}
      </div>
      <h2 className="text-2xl font-bold mb-2">Scores</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-semibold">{game.away_team}</p>
          <p className="text-2xl">{game.score.score_away || '-'}</p>
        </div>
        <div>
          <p className="font-semibold">{game.home_team}</p>
          <p className="text-2xl">{game.score.score_home || '-'}</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Odds</h2>
      {game.odds ? (
        <div className="mb-4 p-4 border rounded">
          <p>Spread: {game.odds.spread?.point_spread_away} (Away) / {game.odds.spread?.point_spread_home} (Home)</p>
          <p>Moneyline: {game.odds.moneyline?.moneyline_away} (Away) / {game.odds.moneyline?.moneyline_home} (Home)</p>
          <p>Total: {game.odds.total?.total_over} (Over) / {game.odds.total?.total_under} (Under)</p>
        </div>
      ) : (
        <p>No odds information available.</p>
      )}
    </div>
  );
}

export default GameDetails;