// frontend/src/components/PoolDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPoolDetails, getPoolEntries } from '../services/poolService';
import { createJoinRequest } from '../services/requestService';
import { addOrUpdatePick } from '../services/pickService';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaUsers, FaDollarSign, FaTrophy, FaCalendarAlt, FaFootballBall, FaArrowLeft } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function PoolDetails() {
  const [pool, setPool] = useState(null);
  const [entries, setEntries] = useState([]);
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
    const fetchPoolData = async () => {
      try {
        const [poolData, entriesData] = await Promise.all([
          getPoolDetails(id),
          getPoolEntries(id)
        ]);
        setPool(poolData);
        setEntries(entriesData);
        setGames(poolData.games || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pool details. Please try again later.');
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [id]);

  const handleJoinPool = async () => {
    try {
      await createJoinRequest(id, 1); // Assuming 1 entry by default
      showToast('Join request submitted successfully!', 'success');
      // Refresh pool details after submitting join request
      const updatedPoolData = await getPoolDetails(id);
      setPool(updatedPoolData);
    } catch (err) {
      showToast('Failed to submit join request. Please try again later.', 'error');
    }
  };

  const handleMakePick = async () => {
    if (!selectedGame || !selectedTeam) {
      showToast('Please select a game and a team', 'error');
      return;
    }

    try {
      const userEntry = entries.find(entry => entry.user === user.id);
      if (!userEntry) {
        throw new Error('User entry not found');
      }
      await addOrUpdatePick(userEntry._id, selectedTeam._id, pool.currentWeek);
      showToast('Pick submitted successfully!', 'success');
      // Refresh pool details after submitting pick
      const [updatedPoolData, updatedEntriesData] = await Promise.all([
        getPoolDetails(id),
        getPoolEntries(id)
      ]);
      setPool(updatedPoolData);
      setEntries(updatedEntriesData);
    } catch (err) {
      showToast('Failed to submit pick. Please try again.', 'error');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LogoSpinner size={20} /></div>;
  if (error) return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  if (!pool) return <div className="text-center text-gray-800 text-2xl mt-12">Pool not found.</div>;

  const userEntry = entries.find(entry => entry.user === user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/pools" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
        <FaArrowLeft className="mr-2" />
        Back to Pools
      </Link>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{pool.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <InfoItem icon={FaCalendarAlt} label="Season" value={pool.season} />
            <InfoItem icon={FaCalendarAlt} label="Current Week" value={pool.currentWeek} />
            <InfoItem icon={FaFootballBall} label="Status" value={pool.status} />
          </div>
          <div className="space-y-4">
            <InfoItem icon={FaUsers} label="Active Entries" value={entries.filter(e => e.status === 'active').length} />
            <InfoItem icon={FaDollarSign} label="Entry Fee" value={`$${pool.entryFee}`} />
            <InfoItem icon={FaTrophy} label="Prize" value={`$${pool.prizeAmount}`} />
          </div>
        </div>
        {!userEntry && (
          <button
            onClick={handleJoinPool}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 mb-8"
          >
            Join Pool
          </button>
        )}
        {userEntry && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Make Your Pick</h2>
            <div className="space-y-4 mb-6">
              {games.map((game) => (
                <GameItem
                  key={game._id}
                  game={game}
                  isSelected={selectedGame === game}
                  onSelect={() => setSelectedGame(game)}
                />
              ))}
            </div>
            {selectedGame && (
              <div className="flex justify-center space-x-4 mb-6">
                <TeamButton
                  team={selectedGame.homeTeam}
                  isSelected={selectedTeam === selectedGame.homeTeam}
                  onClick={() => setSelectedTeam(selectedGame.homeTeam)}
                />
                <TeamButton
                  team={selectedGame.awayTeam}
                  isSelected={selectedTeam === selectedGame.awayTeam}
                  onClick={() => setSelectedTeam(selectedGame.awayTeam)}
                />
              </div>
            )}
            <button 
              onClick={handleMakePick}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200"
              disabled={!selectedGame || !selectedTeam}
            >
              Submit Pick
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center">
      <Icon className="text-purple-500 mr-2" />
      <span className="text-gray-600">{label}: </span>
      <span className="font-semibold ml-1">{value}</span>
    </div>
  );
}

function GameItem({ game, isSelected, onSelect }) {
  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold">{game.homeTeam.name} vs {game.awayTeam.name}</span>
        <span className="text-sm text-gray-600">{new Date(game.eventDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function TeamButton({ team, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
        isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      <img
        src={`/img/nfl_logos/${team.name.split(' ')[0].substring(0, 3).toUpperCase()}.png`}
        alt={`${team.name} logo`}
        className="w-16 h-16 object-contain mb-2"
        onError={(e) => { e.target.onerror = null; e.target.src = '/img/nfl_logos/default-team-logo.png'; }}
      />
      <span className="font-semibold text-sm">{team.name}</span>
    </button>
  );
}

export default PoolDetails;