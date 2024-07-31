import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

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
      showToast('Registration successful', 'success');
      navigate('/dashboard');
    } catch (error) {
      logger.error('Registration failed:', error);
      showToast('Registration failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-extrabold text-white mb-6">
          FOOTBALL ELIMINATOR
        </h2>
        <h3 className="text-center text-2xl font-bold text-white">
          Create Your Account
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ id, label, type, value, onChange, icon: Icon }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          required
          className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Register;