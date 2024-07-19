// frontend/src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getActivePools } from '../services/poolService';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [activePools, setActivePools] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchActivePools = async () => {
      try {
        const pools = await getActivePools();
        setActivePools(pools);
      } catch (error) {
        console.error('Failed to fetch active pools:', error);
        showToast('Failed to load active pools. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchActivePools();
  }, [showToast]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-purple-500 font-bold text-xl">NFL Survivor Pool</div>
          <div className="flex space-x-4">
            <Link to="/dashboard" className="text-white hover:text-purple-500">My Pools</Link>
            <Link to="/entries" className="text-white hover:text-purple-500">My Entries</Link>
            <Link to="/picks" className="text-white hover:text-purple-500">My Picks</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Invite Friends</button>
            <div className="text-green-400">$0.00</div>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">+</button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Active Pools</h2>
          {activePools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePools.map((pool) => (
                <div key={pool._id} className="bg-gray-800 p-4 rounded shadow">
                  <Link to={`/pools/${pool._id}`} className="text-purple-500 hover:underline font-semibold">
                    {pool.name}
                  </Link>
                  <p className="text-sm text-gray-400">Current Week: {pool.currentWeek}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">You are not participating in any active pools.</p>
          )}
        </div>
        <div className="flex space-x-4">
          <Link to="/pools" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Browse All Pools
          </Link>
          <Link to="/pools/create" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create New Pool
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;