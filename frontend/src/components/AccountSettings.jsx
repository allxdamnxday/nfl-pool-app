import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './AccountSettings.css';

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
    <div className="account-settings">
      <h2>Account Settings</h2>
      <div className="user-info">
        <div className="info-item">
          <label>First Name:</label>
          <span>{user.firstName}</span>
        </div>
        <div className="info-item">
          <label>Last Name:</label>
          <span>{user.lastName}</span>
        </div>
        <div className="info-item">
          <label>Username:</label>
          <span>{user.username}</span>
        </div>
        <div className="info-item">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
      </div>

      <h3>Change Password</h3>
      <form onSubmit={handlePasswordChange} className="password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password:</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
            required
            minLength={6}
          />
        </div>
        <button type="submit" disabled={isUpdating} className="submit-btn">
          {isUpdating ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;