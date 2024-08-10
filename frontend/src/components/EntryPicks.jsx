// frontend/src/components/EntryPicks.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserEntriesWithPicks } from '../services/entryService';
import { getCurrentNFLWeek } from '../services/seasonService';
import { FaFootballBall, FaCalendarAlt } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function EntryPicks() {
  const [entries, setEntries] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedEntries, { week }] = await Promise.all([
          getUserEntriesWithPicks('picks,pool'),
          getCurrentNFLWeek()
        ]);
        setEntries(fetchedEntries);
        setCurrentWeek(week);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load entries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text text-center">Your Picks</h1>
      {entries.map((entry) => (
        <div key={entry._id} className="mb-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-purple-300">
            <FaFootballBall className="inline-block mr-2 text-purple-400" />
            {entry.pool.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
              const pick = entry.picks.find(p => p.week === week);
              return (
                <div key={week} className="bg-gray-700 rounded-lg p-4 shadow transition-transform duration-200 hover:scale-105">
                  <h3 className="text-xl font-semibold mb-2 text-purple-300">
                    <FaCalendarAlt className="inline-block mr-2 text-yellow-400" />
                    Week {week}
                  </h3>
                  {pick ? (
                    <p className="text-lg font-medium">{pick.team}</p>
                  ) : (
                    <Link 
                      to={`/entries/${entry._id}/picks/${week}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 inline-block mt-2"
                    >
                      Pick 'Em
                    </Link>
                  )}
                  {week === currentWeek && (
                    <span className="text-yellow-400 ml-2 font-semibold">(Current Week)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EntryPicks;