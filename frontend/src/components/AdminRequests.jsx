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
      const approvedRequest = await approveRequest(requestId);
      logger.info('Request approved successfully:', approvedRequest);
      showToast('Request approved successfully!', 'success');
      setPendingRequests(prevRequests => prevRequests.filter(request => request._id !== requestId));
      setApprovedRequests(prevApproved => [...prevApproved, approvedRequest]);
    } catch (error) {
      logger.error('Failed to approve request:', error);
      showToast('Failed to approve request. Please try again.', 'error');
    }
  };

  const renderRequestCard = (request, isApproved = false) => (
    <div key={request._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition duration-300 ease-in-out hover:shadow-md">
      <p className="text-gray-700 mb-2">
        <FaUserAlt className="inline-block mr-2 text-blue-500" />
        User: {request.user?.username || 'Unknown User'}
      </p>
      <p className="text-gray-700 mb-2">
        <FaFootballBall className="inline-block mr-2 text-purple-500" />
        Pool: {request.pool?.name || 'Unknown Pool'}
      </p>
      <p className="text-gray-700 mb-2">
        <FaClipboardList className="inline-block mr-2 text-green-500" />
        Number of Entries: {request.numberOfEntries}
      </p>
      <p className="text-gray-700 mb-2">
        <FaDollarSign className="inline-block mr-2 text-yellow-500" />
        Payment Method: {request.paymentMethod || 'Not specified'}
      </p>
      <p className="text-gray-700 mb-2">
        <FaDollarSign className="inline-block mr-2 text-yellow-500" />
        Payment Amount: ${request.paymentAmount || 'Not specified'}
      </p>
      <p className="text-gray-700 mb-2">
        <FaCheckCircle className="inline-block mr-2 text-green-500" />
        Status: {request.status}
      </p>
      <p className="text-gray-700 mb-4">
        <FaClock className="inline-block mr-2 text-blue-500" />
        Created: {new Date(request.createdAt).toLocaleString()}
      </p>
      {!isApproved && request.status === 'payment_pending' && (
        <button
          onClick={() => handleApprove(request._id)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 w-full"
        >
          Approve
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-center text-gray-600 text-xl mt-8">Loading requests...</div>;
  }

  return (
    <ErrorBoundary>
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Pending Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-xl text-gray-600">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {pendingRequests.map(request => renderRequestCard(request))}
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Approved Requests</h2>
        {approvedRequests.length === 0 ? (
          <p className="text-xl text-gray-600">No approved requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedRequests.map(request => renderRequestCard(request, true))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default AdminRequests;