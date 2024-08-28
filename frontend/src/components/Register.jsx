import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaExclamationTriangle, FaFootballBall } from 'react-icons/fa';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ firstName, lastName, username, email, password });
      logger.info('Registration successful');
      showToast('Registration successful. Please check your email to verify your account.', 'success');
      navigate('/login');
    } catch (error) {
      logger.error('Registration failed:', error);
      showToast(error.response?.data?.message || 'Registration failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nfl-blue via-nfl-purple to-nfl-light-blue flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            FOOTBALL ELIMINATOR
          </h1>
          <h2 className="text-xl font-semibold text-nfl-gold">
            Create Your Account
          </h2>
        </div>
        
        {/* Email provider warning */}
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="flex-shrink-0 mr-2" />
            <p className="text-sm">
              We are currently experiencing issues sending emails to Yahoo addresses. Please use an alternative email provider if possible.
            </p>
          </div>
        </div>

        {/* New spam folder note */}
        <div className="mb-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md shadow-md">
          <div className="flex items-center">
            <FaEnvelope className="flex-shrink-0 mr-2" />
            <p className="text-sm">
              Please check your spam folder if you don't receive the verification email in your inbox.
            </p>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-nfl-gold">
          <div className="px-6 py-8 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <InputField
                id="firstName"
                label="First Name"
                type="text"
                value={firstName}
                onChange={setFirstName}
                icon={FaUser}
              />
              <InputField
                id="lastName"
                label="Last Name"
                type="text"
                value={lastName}
                onChange={setLastName}
                icon={FaUser}
              />
              <InputField
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={setUsername}
                icon={FaUser}
              />
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
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-nfl-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nfl-gold transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </button>
            </form>
          </div>
          <div className="px-6 py-4 bg-nfl-blue bg-opacity-50 sm:px-10">
            <p className="text-xs text-center text-nfl-gold">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-white hover:text-nfl-gold transition-colors">
                Log in here
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

export default Register;