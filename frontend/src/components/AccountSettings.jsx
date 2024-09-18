import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion'; // For animations
import { FaKey, FaEnvelope, FaUser, FaSyncAlt } from 'react-icons/fa';

const AccountSettings = () => {
  const { user, loading, loadUser } = useAuth();
  const showToast = useToast();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      loadUser(); // Attempt to load user data if it's not available
    } else {
      setFormData(prevState => ({
        ...prevState,
        username: user.username,
        email: user.email,
      }));
    }
  }, [user, loadUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      await axios.put('/api/v1/auth/updatepassword', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showToast('Password changed successfully', 'success');
      setFormData(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) return <div className="error">Unable to load user data. Please try again later.</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-6">
      <motion.div 
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6" 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-nfl-blue dark:text-nfl-white">Account Settings</h2>

        <div className="space-y-4 mb-8">
          <UserInfo label="First Name" value={user.firstName} icon={<FaUser />} />
          <UserInfo label="Last Name" value={user.lastName} icon={<FaUser />} />
          <UserInfo label="Username" value={user.username} icon={<FaUser />} />
          <UserInfo label="Email" value={user.email} icon={<FaEnvelope />} />
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-nfl-purple dark:text-nfl-white">Change Password</h3>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <PasswordField
            label="Current Password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
          />
          <PasswordField
            label="New Password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            minLength={6}
          />
          <PasswordField
            label="Confirm New Password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
            required
            minLength={6}
          />

          <motion.button
            type="submit"
            disabled={isUpdating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-3 px-6 rounded-lg text-white font-bold transition-all duration-300 ${
              isUpdating ? 'bg-gray-500 cursor-not-allowed' : 'bg-nfl-purple hover:bg-nfl-blue'
            }`}
          >
            {isUpdating ? (
              <>
                <FaSyncAlt className="inline-block animate-spin mr-2" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AccountSettings;

// Reusable components for modularity

const UserInfo = ({ label, value, icon }) => (
  <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
    <span className="text-nfl-blue dark:text-nfl-white">{icon}</span>
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}:</label>
      <span className="text-xl font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  </div>
);

const PasswordField = ({ label, id, name, value, onChange, ...rest }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-semibold text-gray-600 dark:text-gray-300">
      {label}:
    </label>
    <input
      type="password"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-nfl-purple"
      {...rest}
    />
  </div>
);
