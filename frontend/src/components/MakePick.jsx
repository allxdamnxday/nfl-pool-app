// frontend/src/components/MakePick.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoolDetails } from '../services/poolService';
import { getNFLTeams, submitPick } from '../services/pickService';

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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!pool) return <div className="text-center">Pool not found.</div>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Make Your Pick</h2>
      <p className="mb-4">Pool: {pool.name}</p>
      <p className="mb-4">Current Week: {pool.currentWeek}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="team" className="block mb-1">Select Team</label>
          <select
            id="team"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit Pick
        </button>
      </form>
    </div>
  );
}

export default MakePick;