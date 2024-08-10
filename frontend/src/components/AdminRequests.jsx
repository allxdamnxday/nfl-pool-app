// frontend/src/components/AdminRequests.jsx

import React, { useState, useEffect } from 'react';
import { getAllRequests, approveRequest, rejectRequest } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import { FaUserAlt, FaFootballBall, FaClipboardList, FaCheckCircle, FaDollarSign, FaClock } from 'react-icons/fa';
import logger from '../utils/logger';
import ErrorBoundary from '../ErrorBoundary';

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const fetchedRequests = await getAllRequests();
      setRequests(fetchedRequests);
    } catch (error) {
      logger.error('Failed to fetch requests:', error);
      showToast('Failed to fetch requests. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const { request, entries } = await approveRequest(requestId);
      logger.info('Request approved successfully:', request, entries);
      showToast('Request approved successfully!', 'success');
      setRequests(prevRequests => prevRequests.map(r => r._id === requestId ? request : r));
    } catch (error) {
      logger.error('Failed to approve request:', error);
      showToast('Failed to approve request. Please try again.', 'error');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const rejectedRequest = await rejectRequest(requestId);
      logger.info('Request rejected successfully:', rejectedRequest);
      showToast('Request rejected successfully!', 'success');
      setRequests(prevRequests => prevRequests.map(r => r._id === requestId ? rejectedRequest : r));
    } catch (error) {
      logger.error('Failed to reject request:', error);
      showToast('Failed to reject request. Please try again.', 'error');
    }
  };

  const renderRequestCard = (request) => (
    <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-600 text-white p-4">
        <h3 className="text-xl font-semibold">Request Details</h3>
      </div>
      <div className="p-4 space-y-3">
        <InfoItem icon={FaUserAlt} label="User" value={request.user?.username || 'Unknown User'} />
        <InfoItem icon={FaFootballBall} label="Pool" value={request.pool?.name || 'Unknown Pool'} />
        <InfoItem icon={FaClipboardList} label="Number of Entries" value={request.numberOfEntries} />
        <InfoItem icon={FaDollarSign} label="Payment Type" value={request.paymentType || 'Not specified'} />
        <InfoItem icon={FaDollarSign} label="Total Amount" value={`$${request.totalAmount}`} />
        <InfoItem icon={FaCheckCircle} label="Payment Status" value={request.paymentStatus} />
        <InfoItem icon={FaCheckCircle} label="Status" value={request.status} />
        <InfoItem icon={FaClock} label="Created" value={new Date(request.createdAt).toLocaleString()} />
      </div>
      {request.status === 'pending' && (
        <div className="px-4 py-3 bg-gray-50 text-right space-x-2">
          <button
            onClick={() => handleApprove(request._id)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(request._id)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-center text-gray-600 text-xl mt-8">Loading requests...</div>;
  }

  return (
    <ErrorBoundary>
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">All Requests</h2>
        {requests.length === 0 ? (
          <p className="text-xl text-gray-600">No requests found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {requests.map(request => renderRequestCard(request))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center">
      <Icon className="text-purple-500 mr-2" />
      <span className="font-medium mr-2">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export default AdminRequests;