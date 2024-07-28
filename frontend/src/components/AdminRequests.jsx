// frontend/src/components/AdminRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getRequests, approveRequest } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import { FaUserAlt, FaFootballBall, FaClipboardList, FaCheckCircle, FaDollarSign, FaClock } from 'react-icons/fa';
import logger from '../utils/logger';
import ErrorBoundary from '../ErrorBoundary';

function AdminRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const { pending, approved } = await getRequests();
        setPendingRequests(pending);
        setApprovedRequests(approved);
      } catch (error) {
        logger.error('Failed to fetch requests:', error);
        showToast('Failed to fetch requests. Please try again later.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [showToast]);

  const handleApprove = async (requestId) => {
    try {
      console.log('Approving request:', requestId);
      const approvedRequest = await approveRequest(requestId);
      console.log('Approved request:', approvedRequest);
      logger.info('Request approved successfully:', approvedRequest);
      showToast('Request approved successfully!', 'success');
      setPendingRequests(prevRequests => {
        const newPendingRequests = prevRequests.filter(request => request._id !== requestId);
        console.log('New pending requests:', newPendingRequests);
        return newPendingRequests;
      });
      setApprovedRequests(prevApproved => {
        const newApprovedRequests = [...prevApproved, approvedRequest];
        console.log('New approved requests:', newApprovedRequests);
        return newApprovedRequests;
      });
    } catch (error) {
      console.error('Error in handleApprove:', error);
      if (error.response && error.response.status === 400) {
        logger.warn('Failed to approve request:', error.response.data.error);
        showToast(error.response.data.error, 'error');
      } else {
        logger.error('Failed to approve request:', error);
        showToast('Failed to approve request. Please try again.', 'error');
      }
    }
  };

  const renderRequestCard = (request, isApproved = false) => (
    <div key={request._id} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg">
      <p className="text-gray-300 mb-2">
        <FaUserAlt className="inline-block mr-2 text-blue-400" />
        User: {request.user?.username || 'Unknown User'}
      </p>
      <p className="text-gray-300 mb-2">
        <FaFootballBall className="inline-block mr-2 text-purple-400" />
        Pool: {request.pool?.name || 'Unknown Pool'}
      </p>
      <p className="text-gray-300 mb-2">
        <FaClipboardList className="inline-block mr-2 text-green-400" />
        Number of Entries: {request.numberOfEntries}
      </p>
      <p className="text-gray-300 mb-2">
        <FaDollarSign className="inline-block mr-2 text-yellow-400" />
        Payment Method: {request.paymentMethod || 'Not specified'}
      </p>
      <p className="text-gray-300 mb-2">
        <FaDollarSign className="inline-block mr-2 text-yellow-400" />
        Payment Amount: ${request.paymentAmount || 'Not specified'}
      </p>
      <p className="text-gray-300 mb-2">
        <FaCheckCircle className="inline-block mr-2 text-green-400" />
        Status: {request.status}
      </p>
      <p className="text-gray-300 mb-4">
        <FaClock className="inline-block mr-2 text-blue-400" />
        Created: {new Date(request.createdAt).toLocaleString()}
      </p>
      {!isApproved && request.status === 'payment_pending' && (
        <button
          onClick={() => handleApprove(request._id)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 w-full"
        >
          Approve
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-center text-white text-2xl mt-12">Loading requests...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <h1 className="text-5xl font-bold mb-12 text-purple-400 shadow-text text-center">Admin Requests</h1>
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-purple-300">Pending Requests</h2>
          {pendingRequests.length === 0 ? (
            <p className="text-xl text-gray-400">No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map(request => renderRequestCard(request))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 text-purple-300">Approved Requests</h2>
          {approvedRequests.length === 0 ? (
            <p className="text-xl text-gray-400">No approved requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedRequests.map(request => renderRequestCard(request, true))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AdminRequests;