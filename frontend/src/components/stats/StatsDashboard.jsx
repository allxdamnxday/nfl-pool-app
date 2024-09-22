import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTotalEntriesStats, getKillRatioPerWeek } from '../../services/statsService';
import WeekSelector from './WeekSelector';
import TotalEntriesCard from './TotalEntriesCard';
import KillRatioPerWeekChart from './KillRatioPerWeekChart';
import DetailedEntryList from './DetailedEntryList';

function StatsDashboard() {
  const { poolId } = useParams();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalEntriesStats, setTotalEntriesStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const entriesResponse = await getTotalEntriesStats(poolId);
        if (entriesResponse.success) {
          setTotalEntriesStats(entriesResponse.data);
        } else {
          throw new Error('Failed to fetch total entries stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [poolId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="stats-dashboard">
      <h1>Pool Statistics</h1>
      <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
      {totalEntriesStats && <TotalEntriesCard stats={totalEntriesStats} />}
      <KillRatioPerWeekChart poolId={poolId} week={currentWeek} />
      <DetailedEntryList poolId={poolId} currentWeek={currentWeek} />
    </div>
  );
}

export default StatsDashboard;