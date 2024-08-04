// frontend/src/components/AdminRequests.jsx

import React, { useState, useEffect } from 'react';
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
    <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-600 text-white p-4">
        <h3 className="text-xl font-semibold">Request Details</h3>
      </div>
      <div className="p-4 space-y-3">
        <InfoItem icon={FaUserAlt} label="User" value={request.user?.username || 'Unknown User'} />
        <InfoItem icon={FaFootballBall} label="Pool" value={request.pool?.name || 'Unknown Pool'} />
        <InfoItem icon={FaClipboardList} label="Number of Entries" value={request.numberOfEntries} />
        <InfoItem icon={FaDollarSign} label="Payment Method" value={request.paymentMethod} />
        <InfoItem icon={FaDollarSign} label="Payment Amount" value={`$${request.paymentAmount || request.totalAmount}`} />
        <InfoItem icon={FaCheckCircle} label="Payment Confirmation" value={request.paymentConfirmation} />
        <InfoItem icon={FaCheckCircle} label="Status" value={request.status} />
        <InfoItem icon={FaClock} label="Created" value={new Date(request.createdAt).toLocaleString()} />
      </div>
      {!isApproved && (
        <div className="px-4 py-3 bg-gray-50 text-right">
          <button
            onClick={() => handleApprove(request._id)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Approve
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