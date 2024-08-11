// frontend/src/components/PaymentPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createRequest, confirmPayment } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaPaypal, FaCreditCard, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
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
      // Step 1: Create the request
      const request = await createRequest(poolId, numberOfEntries);
      
      // Step 2: Confirm the payment
      await confirmPayment(request.data._id, paymentConfirmation, paymentMethod);
      
      showToast('Payment confirmed and join request submitted successfully! Awaiting admin approval.', 'success');
      navigate('/dashboard');
    } catch (err) {
      logger.error(`Failed to submit join request or confirm payment: ${err.message}`, { poolId, numberOfEntries });
      showToast('Failed to complete the process. Please try again.', 'error');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/pools" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
          <FaArrowLeft className="mr-2" />
          Back to Pools
        </Link>
        <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">Complete Payment</h1>

          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8 rounded-r-lg">
            <p className="font-bold text-lg mb-2">Important:</p>
            <p>Please complete your payment before proceeding. This ensures your spot in the pool!</p>
            <p className="mt-2"><strong>Payment Deadline:</strong> All payments must be received by 9/4/2024 at 1 PM PDT.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Summary</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600 mb-2">Number of Entries: <span className="font-semibold">{numberOfEntries}</span></p>
                <p className="text-gray-600 mb-2">Entry Fee: <span className="font-semibold">${entryFee}</span></p>
                <div className="mt-4 p-4 bg-purple-100 rounded-lg shadow-inner">
                  <p className="text-2xl font-bold text-purple-800">Total Amount: <span className="text-3xl">${totalAmount}</span></p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment Instructions</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>Choose your preferred payment method from the options below.</li>
                <li>Send the exact amount of <span className="font-semibold">${totalAmount}</span> using the provided details.</li>
                <li>Include your username and "your@email.com" in the payment notes/memo.</li>
                <li>After sending, copy the transaction ID or confirmation number.</li>
                <li>Return to this page and complete the form at the bottom.</li>
              </ol>
              <p className="text-sm text-gray-600 italic mt-4">Tip: Keep your payment confirmation until your entry is verified.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Options</h2>
          <div className="space-y-6 mb-8">
            <PaymentOption
              title="PayPal"
              icon={FaPaypal}
              qrCode="/paymentQR/Paypal-footballeliminator-QR-code.png"
              link="https://www.paypal.com/paypalme/footballelim"
              linkText="Pay with PayPal"
              info="Send as 'Friends and Family'"
            />
            <PaymentOption
              title="Venmo"
              icon={FaCreditCard}
              qrCode="/paymentQR/Venmo-footballeliminator-QR-Code.png"
              link="https://venmo.com/u/Matthew-Swartz-64"
              linkText="Pay with Venmo"
              info="Set payment to 'Private'"
            />
            <PaymentOption
              title="Zelle"
              icon={SiZelle}
              qrCode="/paymentQR/ZelleQR-code-footballeliminator.png"
              link="https://enroll.zellepay.com/qr-codes?data=ewogICJhY3Rpb24iIDogInBheW1lbnQiLAogICJuYW1lIiA6ICJNQVRUSEVXIiwKICAidG9rZW4iIDogInBheW1lbnRAZm9vdGJhbGxlbGltaW5hdG9yLmNvbSIKfQ=="
              linkText="Pay with Zelle"
              info="Zelle to: payment@footballeliminator.com"
            />
          </div>

          <form onSubmit={handlePaymentComplete} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Step 1: Select Your Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="block w-full px-3 py-2 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm"
              >
                <option value="">Choose how you paid</option>
                <option value="paypal">PayPal</option>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
              </select>
            </div>
            <div>
              <label htmlFor="paymentConfirmation" className="block text-sm font-medium text-gray-700 mb-1">Step 2: Enter Payment Confirmation</label>
              <input
                type="text"
                id="paymentConfirmation"
                value={paymentConfirmation}
                onChange={(e) => setPaymentConfirmation(e.target.value)}
                required
                className="block w-full px-3 py-2 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm"
                placeholder="Transaction ID or Confirmation Number"
              />
              <p className="text-xs text-gray-500 mt-1">This helps us match your payment to your account.</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-purple-700 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </form>

          <div className="mt-8 bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 rounded-r-lg" role="alert">
            <p className="font-bold flex items-center text-lg mb-2"><FaInfoCircle className="mr-2" /> Need help?</p>
            <p>If you're having trouble with your payment, please contact us at <a href="mailto:info@footballeliminator.com" className="text-purple-600 hover:underline">info@footballeliminator.com</a></p>
            <p className="mt-2">For immediate assistance, use the live chat feature on our website.</p>
          </div>

          <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2 text-lg">Additional Information:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Refunds are available up to 48 hours before the pool starts.</li>
              <li>Your payment will be verified within 24 hours.</li>
              <li>You'll receive an email confirmation once your entry is approved.</li>
              <li>Check your entry status anytime on your dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ title, icon: Icon, qrCode, link, linkText, info }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center mb-2 sm:mb-0">
          <Icon className="mr-2 text-purple-500 text-2xl" />
          {title}
        </h3>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-purple-700 transition duration-300 w-full sm:w-auto text-center"
        >
          {linkText}
        </a>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <img src={qrCode} alt={`${title} QR Code`} className="w-40 h-40 sm:w-32 sm:h-32" />
        <div className="text-center sm:text-left">
          <p className="text-gray-700 mb-2">{info}</p>
          <p className="text-sm text-gray-500">Scan QR code or click button to pay</p>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;