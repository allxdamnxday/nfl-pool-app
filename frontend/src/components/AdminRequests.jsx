// frontend/src/components/AdminRequests.jsx

import React, { useState, useEffect } from 'react';
import { getRequests, approveRequest } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';

function AdminRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const showToast = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { pending, approved } = await getRequests();
        setPendingRequests(pending);
        setApprovedRequests(approved);
      } catch (error) {
        showToast('Failed to fetch requests. Please try again later.', 'error');
      }
    };

    fetchRequests();
  }, [showToast]);

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId);
      showToast('Request approved successfully!', 'success');
      setPendingRequests(pendingRequests.filter(request => request._id !== requestId));
      const approvedRequest = pendingRequests.find(request => request._id === requestId);
      setApprovedRequests([...approvedRequests, { ...approvedRequest, status: 'approved' }]);
    } catch (error) {
      showToast('Failed to approve request. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Requests</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Manage Requests</h2>
        {pendingRequests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul>
            {pendingRequests.map(request => (
              <li key={request._id} className="mb-4">
                <p>User: {request.user.username}</p>
                <p>Pool: {request.pool.name}</p>
                <p>Number of Entries: {request.numberOfEntries}</p>
                <button
                  onClick={() => handleApprove(request._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Approved Requests</h2>
        {approvedRequests.length === 0 ? (
          <p>No approved requests.</p>
        ) : (
          <ul>
            {approvedRequests.map(request => (
              <li key={request._id} className="mb-4">
                <p>User: {request.user.username}</p>
                <p>Pool: {request.pool.name}</p>
                <p>Number of Entries: {request.numberOfEntries}</p>
                <p>Status: {request.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminRequests;