// frontend/src/components/EntryDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEntry } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function EntryDetail() {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { entryId } = useParams();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const fetchedEntry = await getEntry(entryId);
        setEntry(fetchedEntry);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch entry:', error);
        showToast('Failed to load entry details. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (!entry) {
    return <div className="text-center text-gray-800 text-2xl mt-12">Entry not found.</div>;
  }

  const handlePickEmClick = () => {
    navigate(`/entries/${entryId}/picks`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/entries" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
        <FaArrowLeft className="mr-2" />
        Back to Entries
      </Link>
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Entry Details</h1>
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaFootballBall className="text-purple-500 mr-2" />
            {entry.pool.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                {entry.status === 'active' ? 
                  <FaCheckCircle className="mr-2 text-green-500" /> : 
                  <FaTimesCircle className="mr-2 text-red-500" />
                }
                {entry.status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Current Week</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500" />
                {entry.pool.currentWeek}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Entry Status</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                {entry.status === 'eliminated' ? 
                  <FaTimesCircle className="mr-2 text-red-500" /> : 
                  <FaCheckCircle className="mr-2 text-green-500" />
                }
                {entry.status === 'eliminated' ? 'Eliminated' : 'Still In'}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Pick History</h3>
        {entry.picks && entry.picks.length > 0 ? (
          <ul className="space-y-3">
            {entry.picks.map((pick, index) => (
              <li key={pick._id} className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold text-gray-800">Week {index + 1}</p>
                <p className="text-gray-600">Team: <span className="font-semibold">{pick.team}</span></p>
                <p className="text-gray-600">Result: <span className="font-semibold">{pick.result || 'Pending'}</span></p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic">No picks made yet.</p>
        )}

        <div className="mt-8 flex justify-center space-x-4">
          {entry.status === 'active' && (
            <button 
              onClick={handlePickEmClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
            >
              Make a Pick
            </button>
          )}
          <Link 
            to="/entries" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors duration-200"
          >
            Back to Entries
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EntryDetail;