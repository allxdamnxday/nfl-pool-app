// frontend/src/components/AdminRequests.jsx

import React, { useState, useEffect } from 'react';
import { getRequests, approveRequest } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const fetchedRequests = await getRequests();
      setRequests(fetchedRequests);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      showToast('Failed to load requests. Please try again later.', 'error');
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId);
      showToast('Request approved successfully', 'success');
      fetchRequests(); // Refresh the list of requests
    } catch (error) {
      console.error('Failed to approve request:', error);
      showToast('Failed to approve request. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Pending Requests</h1>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-500 mb-2">
                Request for {request.pool.name}
              </h2>
              <p className="text-gray-400 mb-2">User: {request.user.username}</p>
              <p className="text-gray-400 mb-2">Entries: {request.numberOfEntries}</p>
              <p className="text-gray-400 mb-4">Status: {request.status}</p>
              <button
                onClick={() => handleApprove(request._id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRequests;