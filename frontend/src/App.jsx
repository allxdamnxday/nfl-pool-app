// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Entries from './components/Entries';
import Picks from './components/Picks';
import PoolList from './components/PoolList';
import JoinPool from './components/JoinPool'; // Import JoinPool component

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/entries" 
                element={
                  <ProtectedRoute>
                    <Entries />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/picks" 
                element={
                  <ProtectedRoute>
                    <Picks />
                  </ProtectedRoute>
                } 
              />
               <Route 
                path="/pools" 
                element={
                  <ProtectedRoute>
                    <PoolList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pools/:poolId/join" 
                element={
                  <ProtectedRoute>
                    <JoinPool />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;