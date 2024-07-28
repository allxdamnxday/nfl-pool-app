// frontend/src/components/MakePick.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoolDetails } from '../services/poolService';
import { getNFLTeams, submitPick } from '../services/pickService';
import { FaFootballBall, FaCalendarAlt } from 'react-icons/fa';

function MakePick() {
  const [pool, setPool] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poolData, teamsData] = await Promise.all([
          getPoolDetails(id),
          getNFLTeams()
        ]);
        setPool(poolData);
        setTeams(teamsData);
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
      setError('Please select a team before submitting.');
      return;
    }
    try {
      await submitPick(id, pool.currentWeek, selectedTeam);
      navigate(`/pools/${id}`);
    } catch (err) {
      setError('Failed to submit pick. Please try again.');
    }
  };

  if (loading) return <div className="text-center text-white text-2xl mt-12">Loading...</div>;
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
              {teams.map((team) => (
                <option key={team._id} value={team._id}>{team.name}</option>
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