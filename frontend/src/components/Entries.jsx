// frontend/src/components/Entries.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserEntries } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaUsers } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const entriesData = await getUserEntries();
        setEntries(entriesData);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
        setError('Failed to load entries. Please try again later.');
        showToast('Failed to load entries. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [showToast]);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">My Entries</h1>
      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-6">You don't have any entries yet.</p>
          <Link 
            to="/pools" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-block"
          >
            Browse Pools
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg hover:scale-105">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaFootballBall className="text-purple-500 mr-2" />
                {entry.pool?.name || 'Unknown Pool'}
              </h2>
              <p className="text-gray-600 mb-2 flex items-center">
                <FaCheckCircle className={`mr-2 ${entry.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                Status: {entry.status === 'active' ? 'Active' : 'Inactive'}
              </p>
              <p className="text-gray-600 mb-2 flex items-center">
                <FaCalendarAlt className="text-blue-500 mr-2" />
                Picks Made: {entry.picks?.length || 0}
              </p>
              <p className="text-gray-600 mb-2 flex items-center">
                <FaCalendarAlt className="text-yellow-500 mr-2" />
                Current Week: {entry.pool?.currentWeek || 'N/A'}
              </p>
              <p className="text-gray-600 mb-4 flex items-center">
                {entry.status === 'eliminated' ? 
                  <FaTimesCircle className="text-red-500 mr-2" /> : 
                  <FaCheckCircle className="text-green-500 mr-2" />
                }
                Status: {entry.status === 'eliminated' ? 'Eliminated' : 'Still In'}
              </p>
              <Link 
                to={`/entries/${entry._id}`} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 inline-block w-full text-center"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Entries;