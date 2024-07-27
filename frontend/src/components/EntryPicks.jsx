// frontend/src/components/EntryPicks.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEntriesForUser } from '../services/entryService';
import { getCurrentNFLWeek } from '../services/seasonService';

function EntryPicks() {
  const [entries, setEntries] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedEntries = await getEntriesForUser(userId);
        setEntries(fetchedEntries);
        const { week } = await getCurrentNFLWeek();
        setCurrentWeek(week);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Picks</h1>
      {entries.map((entry) => (
        <div key={entry._id} className="mb-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{entry.pool.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
              const pick = entry.picks.find(p => p.week === week);
              return (
                <div key={week} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">Week {week}</h3>
                  {pick ? (
                    <p>{pick.team}</p>
                  ) : (
                    <Link 
                      to={`/entries/${entry._id}/picks/${week}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Pick 'Em
                    </Link>
                  )}
                  {week === currentWeek && <span className="text-yellow-400 ml-2">(Current Week)</span>}
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