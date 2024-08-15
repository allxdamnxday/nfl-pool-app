import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaEnvelope, FaLock, FaFootballBall } from 'react-icons/fa';
import { resendVerificationEmail } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const { login } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      logger.info('Login successful');
      showToast('Login successful', 'success');
      navigate('/dashboard');
    } catch (error) {
      logger.error('Login failed:', error);
      if (error.message === 'Email not verified') {
        setShowResendVerification(true);
        showToast('Please verify your email before logging in. You can request a new verification link below.', 'warning');
      } else {
        showToast(error.message || 'Login failed. Please check your credentials.', 'error');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(email);
      showToast('Verification email sent. Please check your inbox.', 'success');
      setShowResendVerification(false);
    } catch (error) {
      logger.error('Failed to resend verification email:', error);
      showToast(error.message || 'Failed to resend verification email. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue via-nfl-purple to-nfl-light-blue flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <FaFootballBall className="mx-auto h-16 w-16 text-nfl-gold animate-bounce" />
          <h1 className="mt-4 text-4xl font-extrabold text-white mb-2">
            Football Eliminator
          </h1>
          <h2 className="text-xl font-semibold text-nfl-gold">
            Welcome Back
          </h2>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-nfl-gold">
          <div className="px-6 py-8 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <InputField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                icon={FaEnvelope}
              />
              <InputField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                icon={FaLock}
              />
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-nfl-gold hover:text-white transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nfl-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nfl-gold transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                Sign In
              </button>
            </form>
            
            {showResendVerification && (
              <div className="mt-4">
                <p className="text-sm text-nfl-gold mb-2">
                  Your email is not verified. Need a new verification link?
                </p>
                <button
                  onClick={handleResendVerification}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nfl-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nfl-gold transition-colors duration-300 ease-in-out"
                >
                  Resend Verification Email
                </button>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-nfl-blue bg-opacity-50 sm:px-10">
            <p className="text-xs text-center text-nfl-gold">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-white hover:text-nfl-gold transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ id, label, type, value, onChange, icon: Icon }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-nfl-gold mb-1">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-nfl-gold" aria-hidden="true" />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          required
          className="block w-full pl-10 pr-3 py-2 border border-nfl-gold rounded-md leading-5 bg-white bg-opacity-10 placeholder-nfl-gold placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-nfl-gold focus:border-nfl-gold sm:text-sm text-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Login;