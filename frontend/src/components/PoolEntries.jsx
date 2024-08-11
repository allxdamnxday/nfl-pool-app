import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getPoolDetails, getPoolEntries } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function PoolEntries() {
  const { poolId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Add this state

  useEffect(() => {
    const fetchPoolAndEntries = async () => {
      if (authLoading) return;

      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [poolData, entriesData] = await Promise.all([
          getPoolDetails(poolId),
          getPoolEntries(poolId)
        ]);
        
        console.log('Pool Data:', poolData);
        console.log('Entries Data:', entriesData);
        console.log('Current User ID:', user.id);

        setPool(poolData);
        setIsAdmin(poolData.creator === user.id); // Set admin status
        
        // Filter entries for the current user or show all if admin
        const userEntries = isAdmin ? entriesData : entriesData.filter(entry => entry.user === user.id);
        console.log('Filtered User Entries:', userEntries);
        
        setEntries(userEntries);
      } catch (err) {
        console.error('Error fetching pool entries:', err);
        setError('Failed to load entries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPoolAndEntries();
  }, [poolId, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }
  
  if (error) return <div className="text-center text-red-500 text-2xl mt-12">{error}</div>;
  if (!user) return <div className="text-center text-gray-800 text-2xl mt-12">Please log in to view entries.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/pools" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
        <FaArrowLeft className="mr-2" />
        Back to Pools
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        {pool?.name || 'Pool'} - {isAdmin ? 'All' : 'Your'} Entries
      </h1>
      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-6">
            {isAdmin ? 'There are no entries in this pool yet.' : 'You have no entries in this pool.'}
          </p>
          {!isAdmin && (
            <Link 
              to={`/pools/${poolId}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-block"
            >
              Join Pool
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <EntryCard key={entry._id} entry={entry} pool={pool} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryCard({ entry, pool, isAdmin }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Entry #{entry.entryNumber}</h3>
        <StatusBadge isActive={entry.status === 'active'} />
      </div>
      {isAdmin && (
        <p className="text-sm text-gray-600 mb-2">User: {entry.user}</p>
      )}
      <div className="space-y-2 mb-4">
        <InfoItem icon={FaFootballBall} label="Picks Made" value={entry.picks?.length || 0} />
        <InfoItem icon={FaCalendarAlt} label="Current Week" value={pool?.currentWeek} />
        <InfoItem 
          icon={entry.status === 'eliminated' ? FaTimesCircle : FaCheckCircle} 
          label="Status" 
          value={entry.status === 'eliminated' ? 'Eliminated' : 'Still In'}
          valueColor={entry.status === 'eliminated' ? 'text-red-500' : 'text-green-500'}
        />
      </div>
      <Link 
        to={`/entries/${entry._id}`}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 inline-block w-full text-center"
      >
        View Details
      </Link>
    </div>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value, valueColor = 'text-gray-800' }) {
  return (
    <div className="flex items-center">
      <Icon className="text-purple-500 mr-2" />
      <span className="text-gray-600">{label}:</span>
      <span className={`font-semibold ml-1 ${valueColor}`}>{value}</span>
    </div>
  );
}

export default PoolEntries;