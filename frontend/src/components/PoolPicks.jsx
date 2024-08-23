import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllPoolPicks } from '../services/poolService';

function PoolPicks() {
  const [picks, setPicks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { poolId } = useParams();

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        setLoading(true);
        const data = await getAllPoolPicks(poolId);
        setPicks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch picks. Please try again later.');
        setLoading(false);
      }
    };

    fetchPicks();
  }, [poolId]);

  const handleWeekChange = (increment) => {
    setCurrentWeek(prevWeek => Math.max(1, prevWeek + increment));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pool-picks">
      <h2>Pool Picks - Week {currentWeek}</h2>
      <div className="week-navigation">
        <button onClick={() => handleWeekChange(-1)} disabled={currentWeek === 1}>Previous Week</button>
        <button onClick={() => handleWeekChange(1)}>Next Week</button>
      </div>
      <table className="picks-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Pick</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {picks.map(entry => {
            const currentPick = entry.picks.find(pick => pick.week === currentWeek);
            const isEliminated = entry.picks.some(pick => pick.week < currentWeek && !pick.team);
            return (
              <tr key={entry.entryId}>
                <td>{entry.username}</td>
                <td>{currentPick ? currentPick.team : 'No pick'}</td>
                <td>{isEliminated ? 'Eliminated' : 'Active'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PoolPicks;