import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createRequest, confirmPayment } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaPaypal, FaCreditCard, FaArrowLeft, FaInfoCircle, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { SiZelle } from 'react-icons/si';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { poolId, numberOfEntries, entryFee, totalAmount } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentConfirmation, setPaymentConfirmation] = useState('');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isPaymentConfirmed) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPaymentConfirmed]);

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
      
      setIsPaymentConfirmed(true);
      showToast('Payment confirmed and join request submitted successfully! Awaiting admin approval.', 'success');
      navigate('/thank-you'); // Navigate to Thank You page
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <Link to="/pools" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
        <FaArrowLeft className="mr-2" /> Back to Pools
      </Link>
      
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>

        <div className="flex items-center space-x-4 text-lg text-gray-600">
          <div className="flex items-center">
            <FaMoneyBillWave className="mr-2 text-purple-500" />
            <span>Make Payment</span>
          </div>
          <div className="text-gray-300">→</div>
          <div className="flex items-center">
            <FaCheckCircle className="mr-2 text-purple-500" />
            <span>Confirm Below</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Summary</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p>Number of Entries: <span className="font-semibold">{numberOfEntries}</span></p>
              <p>Entry Fee: <span className="font-semibold">${entryFee}</span></p>
              <div className="mt-4 p-4 bg-purple-100 rounded-lg">
                <p className="text-2xl font-bold text-purple-800">Total: <span className="text-3xl">${totalAmount}</span></p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Choose a payment method below</li>
              <li>Send <span className="font-semibold">${totalAmount}</span></li>
              <li>Include your username in payment notes</li>
              <li>Confirm payment in the form below</li>
            </ol>
            <p className="text-sm text-gray-600 italic">Keep your confirmation until entry is verified</p>
          </div>
        </div>

        <form onSubmit={handlePaymentComplete} className="space-y-6 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            Confirm Your Payment
          </h2>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method Used</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="block w-full px-3 py-2 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm"
            >
              <option value="">Select method</option>
              <option value="paypal">PayPal</option>
              <option value="venmo">Venmo</option>
              <option value="zelle">Zelle</option>
            </select>
          </div>
          <div>
            <label htmlFor="paymentConfirmation" className="block text-sm font-medium text-gray-700 mb-1">Payment Confirmation</label>
            <input
              type="text"
              id="paymentConfirmation"
              value={paymentConfirmation}
              onChange={(e) => setPaymentConfirmation(e.target.value)}
              required
              className="block w-full px-3 py-2 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-md shadow-sm"
              placeholder="Transaction ID or Email Used"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-purple-700 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        </form>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Payment Options</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <PaymentOption
              title="PayPal"
              icon={FaPaypal}
              link="https://www.paypal.com/paypalme/footballelim"
              info="Send as 'Friends and Family'"
            />
            <PaymentOption
              title="Venmo"
              icon={FaCreditCard}
              link="https://venmo.com/u/Matthew-Swartz-64"
              info="Set payment to 'Private'"
            />
            <PaymentOption
              title="Zelle"
              icon={SiZelle}
              link="https://enroll.zellepay.com/qr-codes?data=ewogICJhY3Rpb24iIDogInBheW1lbnQiLAogICJuYW1lIiA6ICJNQVRUSEVXIiwKICAidG9rZW4iIDogInBheW1lbnRAZm9vdGJhbGxlbGltaW5hdG9yLmNvbSIKfQ=="
              info="To: payment@footballeliminator.com"
            />
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg" role="alert">
          <p className="font-bold flex items-center"><FaInfoCircle className="mr-2" /> Need help?</p>
          <p>Contact us at <a href="mailto:info@footballeliminator.com" className="underline">info@footballeliminator.com</a> or use the WhatsApp chat.</p>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ title, icon: Icon, link, info }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-semibold flex items-center mb-2">
        <Icon className="mr-2 text-purple-500" />
        {title}
      </h3>
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-purple-700 transition duration-300 text-center mb-2"
      >
        Pay with {title}
      </a>
      <p className="text-sm text-gray-600">{info}</p>
    </div>
  );
}

export default PaymentPage;