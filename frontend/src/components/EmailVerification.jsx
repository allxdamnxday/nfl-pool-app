import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';

function EmailVerification() {
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const { token } = useParams();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (response.data.success) {
          setVerificationStatus('success');
          showToast(response.data.message, 'success');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setVerificationStatus('error');
          showToast('Email verification failed.', 'error');
        }
      } catch (error) {
        logger.error('Email verification error:', error);
        setVerificationStatus('error');
        showToast(error.response?.data?.message || 'Email verification failed. Please try again.', 'error');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, showToast, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl p-6">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Email Verification
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {verificationStatus === 'verifying' && (
            <p className="text-center text-white">Verifying your email...</p>
          )}
          {verificationStatus === 'success' && (
            <div className="text-center">
              <p className="text-green-400 mb-4">{verificationStatus === 'success' ? verificationStatus : 'Email already verified'}</p>
              <p className="text-white mb-4">You will be redirected to the login page shortly.</p>
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Proceed to Login
              </Link>
            </div>
          )}
          {verificationStatus === 'error' && (
            <div className="text-center">
              <p className="text-red-400 mb-4">Email verification failed. The link may be invalid or expired.</p>
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;