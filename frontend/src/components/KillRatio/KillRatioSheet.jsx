import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { killRatioService } from '../../services/killRatioService';
import WeekSelector from './WeekSelector';
import { LogoSpinner } from '../CustomComponents';
import { FaChartBar, FaExclamationTriangle, FaFootballBall, FaSkull, FaBalanceScale } from 'react-icons/fa';

const KillRatioSheet = () => {
  const { poolId } = useParams();
  const [killRatioData, setKillRatioData] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await killRatioService.getWeeklyKillRatio(poolId, currentWeek);
        setKillRatioData(response.data.killRatio);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch kill ratio data:', error);
        setError('Failed to load kill ratio data. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [poolId, currentWeek]);

  if (loading) return <LogoSpinner size={128} />;

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
      <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
        <FaExclamationTriangle className="inline-block mr-2 mb-1" />
        {error}
      </div>
    </div>
  );

  if (!killRatioData) return null;

  const { overallKillRatio, teams } = killRatioData;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Kill Ratio <span className="text-nfl-gold">Sheet</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Track team performance week by week</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-6">
            <WeekSelector currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center mb-8">
              <FaChartBar className="text-4xl text-nfl-gold mr-4" />
              <p className="text-3xl font-bold text-nfl-blue">
                Overall Kill Ratio: <span className="text-nfl-purple">{(overallKillRatio * 100).toFixed(2)}%</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Team</th>
                    <th className="px-4 py-2 text-center"><FaFootballBall className="inline mr-1" /> Picks</th>
                    <th className="px-4 py-2 text-center"><FaSkull className="inline mr-1" /> Eliminations</th>
                    <th className="px-4 py-2 text-center"><FaBalanceScale className="inline mr-1" /> Kill Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {teams && teams.map(team => (
                    <tr key={team._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{team.teamFullName || team.teamName}</td>
                      <td className="px-4 py-2 text-center">{team.picks || 0}</td>
                      <td className="px-4 py-2 text-center">{team.eliminations || 0}</td>
                      <td className="px-4 py-2 text-center font-bold text-nfl-blue">{(team.killRatio * 100 || 0).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KillRatioSheet;