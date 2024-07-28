// frontend/src/components/AdminRequests.jsx

import React, { useState, useEffect } from 'react';
import { getRequests, approveRequest } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import { FaUserAlt, FaFootballBall, FaClipboardList, FaCheckCircle } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text text-center">Admin Requests</h1>
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-purple-300">Manage Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-xl text-gray-400">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map(request => (
              <div key={request._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg">
                <p className="text-gray-300 mb-2">
                  <FaUserAlt className="inline-block mr-2 text-blue-400" />
                  User: {request.user.username}
                </p>
                <p className="text-gray-300 mb-2">
                  <FaFootballBall className="inline-block mr-2 text-purple-400" />
                  Pool: {request.pool.name}
                </p>
                <p className="text-gray-300 mb-4">
                  <FaClipboardList className="inline-block mr-2 text-green-400" />
                  Number of Entries: {request.numberOfEntries}
                </p>
                <button
                  onClick={() => handleApprove(request._id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 w-full"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-6 text-purple-300">Approved Requests</h2>
        {approvedRequests.length === 0 ? (
          <p className="text-xl text-gray-400">No approved requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedRequests.map(request => (
              <div key={request._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg">
                <p className="text-gray-300 mb-2">
                  <FaUserAlt className="inline-block mr-2 text-blue-400" />
                  User: {request.user.username}
                </p>
                <p className="text-gray-300 mb-2">
                  <FaFootballBall className="inline-block mr-2 text-purple-400" />
                  Pool: {request.pool.name}
                </p>
                <p className="text-gray-300 mb-2">
                  <FaClipboardList className="inline-block mr-2 text-green-400" />
                  Number of Entries: {request.numberOfEntries}
                </p>
                <p className="text-gray-300">
                  <FaCheckCircle className="inline-block mr-2 text-green-400" />
                  Status: {request.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRequests;