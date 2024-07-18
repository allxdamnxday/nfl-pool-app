import React, { createContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getCurrentUser } from '../services/authService';
import logger from '../utils/logger';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        logger.info('User loaded successfully', currentUser);
      } catch (error) {
        logger.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const loggedInUser = await loginService(email, password);
      setUser(loggedInUser);
      logger.info('User logged in successfully', loggedInUser);
      return loggedInUser;
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const registeredUser = await registerService(username, email, password);
      setUser(registeredUser);
      logger.info('User registered successfully', registeredUser);
      return registeredUser;
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};