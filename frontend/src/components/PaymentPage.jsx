// frontend/src/components/PaymentPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createRequest, confirmPayment } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaPaypal, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error: Missing Payment Information</h1>
          <p className="mb-4">Please try again or contact support if the issue persists.</p>
          <Link to="/pools" className="text-purple-600 hover:text-purple-700 font-semibold">
            Return to Pools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/pools" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
          <FaArrowLeft className="mr-2" />
          Back to Pools
        </Link>
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Complete Payment</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Summary</h2>
              <p className="text-gray-600 mb-2">Number of Entries: <span className="font-semibold">{numberOfEntries}</span></p>
              <p className="text-gray-600 mb-2">Entry Fee: <span className="font-semibold">${entryFee}</span></p>
              <p className="text-gray-600 mb-2">Total Amount: <span className="font-semibold text-lg">${totalAmount}</span></p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Options</h2>
              <PaymentOption
                title="PayPal"
                icon={FaPaypal}
                qrCode="/path-to-paypal-qr.png"
                link="https://paypal.me/yourpaypallink"
                linkText="Pay with PayPal"
              />
              <PaymentOption
                title="Venmo"
                icon={FaCreditCard}
                qrCode="/path-to-venmo-qr.png"
                link="https://venmo.com/yourvenmousername"
                linkText="Pay with Venmo"
              />
              <PaymentOption
                title="Zelle"
                icon={SiZelle}
                qrCode="/path-to-zelle-qr.png"
                info="Zelle to: your.email@example.com"
              />
            </div>
          </div>

          <form onSubmit={handlePaymentComplete} className="space-y-6">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                <option value="">Select a payment method</option>
                <option value="paypal">PayPal</option>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
              </select>
            </div>
            <div>
              <label htmlFor="paymentConfirmation" className="block text-sm font-medium text-gray-700">Payment Confirmation (e.g., Transaction ID)</label>
              <input
                type="text"
                id="paymentConfirmation"
                value={paymentConfirmation}
                onChange={(e) => setPaymentConfirmation(e.target.value)}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-purple-600 text-white px-4 py-3 rounded-full font-semibold hover:bg-purple-700 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ title, icon: Icon, qrCode, link, linkText, info }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Icon className="mr-2 text-purple-500" />
        {title}
      </h3>
      <img src={qrCode} alt={`${title} QR Code`} className="mb-2 w-24 h-24" />
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold">
          {linkText}
        </a>
      )}
      {info && <p className="text-gray-600">{info}</p>}
    </div>
  );
}

export default PaymentPage;