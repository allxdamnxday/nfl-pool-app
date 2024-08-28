import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllPoolPicks } from '../services/poolService';
import { FaFootballBall, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function PoolPicks() {
  const [picks, setPicks] = useState([]);
  const [visibleWeeks, setVisibleWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { poolId } = useParams();

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        setLoading(true);
        const data = await getAllPoolPicks(poolId);
        setPicks(data.picks);
        setVisibleWeeks(data.visibleWeeks);
        setCurrentWeek(data.currentWeek || 1);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch picks. Please try again later.');
        setLoading(false);
      }
    };

    fetchPicks();
  }, [poolId]);

  const handleWeekChange = (increment) => {
    setCurrentWeek(prevWeek => {
      const newWeek = prevWeek + increment;
      return visibleWeeks.includes(newWeek) ? newWeek : prevWeek;
    });
  };

  if (loading) return <LogoSpinner size={128} />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
      <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source media="(max-width: 640px)" srcSet="/img-optimized/poolPicks_hero_small.webp" />
            <source media="(max-width: 1024px)" srcSet="/img-optimized/poolPicks_hero_medium.webp" />
            <source media="(min-width: 1025px)" srcSet="/img-optimized/poolPicks_hero_large.webp" />
            <img
              src="/img-optimized/pool_picks_hero_medium.webp"
              alt="Football field"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 text-nfl-white drop-shadow-lg">
              Pool <span className="text-nfl-gold">Picks</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl drop-shadow-lg">Week {currentWeek}</p>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Info Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg mb-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-nfl-blue mb-4">Important Information</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700">
            <li>Picks for the current week are hidden until 1 PM EST / 10 AM PST Sunday of the current week.</li>
            <li>On Sunday at 1 PM EST / 10 AM PST, all picks for that week become visible.</li>
            <li>Use the navigation buttons to view picks from previous weeks.</li>
            <li>The status column shows if an entry is still active or has been eliminated.</li>
            <li>Picks for future weeks are not displayed to maintain fairness in the pool.</li>
          </ul>
        </div>

        {/* Picks Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
            <button 
              onClick={() => handleWeekChange(-1)} 
              disabled={currentWeek === 1}
              className="w-full sm:w-auto mb-4 sm:mb-0 bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <FaChevronLeft className="mr-2" /> Previous Week
            </button>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-nfl-blue mb-4 sm:mb-0">Week {currentWeek} Picks</h2>
            <button 
              onClick={() => handleWeekChange(1)} 
              disabled={!visibleWeeks.includes(currentWeek + 1)}
              className="w-full sm:w-auto bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Next Week <FaChevronRight className="ml-2" />
            </button>
          </div>

          {picks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-nfl-blue text-sm sm:text-base">User</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-nfl-blue text-sm sm:text-base">Pick</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-nfl-blue text-sm sm:text-base">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {picks.map((entry, index) => {
                    const currentPick = entry.picks.find(pick => pick.week === currentWeek);
                    const isEliminated = entry.picks.some(pick => pick.week < currentWeek && !pick.team);
                    return (
                      <tr key={entry.entryId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{entry.username}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          {currentPick ? (
                            <div className="flex items-center">
                              <FaFootballBall className="text-nfl-gold mr-2" />
                              {currentPick.team}
                            </div>
                          ) : 'No pick'}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${isEliminated ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                            {isEliminated ? 'Eliminated' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFootballBall className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-nfl-gold mb-4 animate-bounce" />
              <p className="text-lg sm:text-xl text-gray-600 mb-2">No picks available for this week yet.</p>
              <p className="text-sm sm:text-base text-gray-500">Picks will be visible once the first game of the week starts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PoolPicks;