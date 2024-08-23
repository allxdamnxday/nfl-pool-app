import React from 'react';
import { Link } from 'react-router-dom';

function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Thank You!</h1>
        <p className="mb-4">Your payment has been confirmed. An admin will approve your request within 24 hours. Once approved, you will be able to see your entry and make picks.</p>
        <Link to="/dashboard" className="text-purple-600 hover:text-purple-700 font-semibold">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default ThankYouPage;