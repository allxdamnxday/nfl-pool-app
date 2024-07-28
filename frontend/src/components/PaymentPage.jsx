// frontend/src/components/PaymentPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRequest, confirmPayment } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaPaypal, FaCreditCard } from 'react-icons/fa';
import { SiZelle } from 'react-icons/si';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { poolId, numberOfEntries, entryFee, totalAmount } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentConfirmation, setPaymentConfirmation] = useState('');

  logger.debug('PaymentPage rendered', { poolId, numberOfEntries, entryFee, totalAmount });

  const handlePaymentComplete = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    logger.info(`Attempting to complete payment for pool ${poolId}`);
    try {
      const request = await createRequest(poolId, numberOfEntries);
      await confirmPayment(request._id, paymentMethod, totalAmount, paymentConfirmation);
      logger.info(`Payment request created and confirmed successfully for pool ${poolId}`);
      showToast('Join request submitted successfully! Awaiting admin approval.', 'success');
      navigate('/dashboard');
    } catch (err) {
      logger.error(`Failed to submit join request: ${err.message}`, { poolId, numberOfEntries });
      showToast('Failed to submit join request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!poolId || !numberOfEntries || !entryFee) {
    logger.error('Missing required payment information', { poolId, numberOfEntries, entryFee });
    return <div>Error: Missing payment information. Please try again.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6 max-w-md mx-auto">
        <p className="text-gray-400 mb-4">Number of Entries: {numberOfEntries}</p>
        <p className="text-gray-400 mb-4">Entry Fee: ${entryFee}</p>
        <p className="text-gray-400 mb-6">Total Amount: ${totalAmount}</p>
        
        <div className="space-y-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">PayPal</h2>
            <img src="/path-to-paypal-qr.png" alt="PayPal QR Code" className="mb-2" />
            <a href="https://paypal.me/yourpaypallink" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              <FaPaypal className="inline mr-2" />
              Pay with PayPal
            </a>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Venmo</h2>
            <img src="/path-to-venmo-qr.png" alt="Venmo QR Code" className="mb-2" />
            <a href="https://venmo.com/yourvenmousername" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              <FaCreditCard className="inline mr-2" />
              Pay with Venmo
            </a>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Zelle</h2>
            <img src="/path-to-zelle-qr.png" alt="Zelle QR Code" className="mb-2" />
            <p className="text-gray-400">
              <SiZelle className="inline mr-2" />
              Zelle to: your.email@example.com
            </p>
          </div>
        </div>

        <form onSubmit={handlePaymentComplete} className="space-y-4">
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-400">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-700 text-white"
            >
              <option value="">Select a payment method</option>
              <option value="paypal">PayPal</option>
              <option value="venmo">Venmo</option>
              <option value="zelle">Zelle</option>
            </select>
          </div>
          <div>
            <label htmlFor="paymentConfirmation" className="block text-sm font-medium text-gray-400">Payment Confirmation (e.g., Transaction ID)</label>
            <input
              type="text"
              id="paymentConfirmation"
              value={paymentConfirmation}
              onChange={(e) => setPaymentConfirmation(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-700 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentPage;