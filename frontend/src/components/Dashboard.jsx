// frontend/src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getActivePools } from '../services/poolService';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [activePools, setActivePools] = useState([]);

  useEffect(() => {
    const fetchActivePools = async () => {
      try {
        const pools = await getActivePools();
        setActivePools(pools);
      } catch (error) {
        console.error('Failed to fetch active pools:', error);
      }
    };

    fetchActivePools();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.username}!</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Your Active Pools</h2>
        {activePools.length > 0 ? (
          <ul className="space-y-2">
            {activePools.map((pool) => (
              <li key={pool._id} className="bg-white p-4 rounded shadow">
                <Link to={`/pools/${pool._id}`} className="text-blue-500 hover:underline">
                  {pool.name}
                </Link>
                <p className="text-sm text-gray-600">Current Week: {pool.currentWeek}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You are not participating in any active pools.</p>
        )}
      </div>
      <div>
        <Link to="/pools" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Browse All Pools
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;