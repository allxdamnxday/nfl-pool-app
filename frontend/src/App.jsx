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
import EntryDetail from './components/EntryDetail';
import Picks from './components/Picks';
import PoolList from './components/PoolList';
import JoinPool from './components/JoinPool';
import AdminRequests from './components/AdminRequests';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import PoolEntries from './components/PoolEntries';
import AdminDashboard from './components/AdminDashboard';
import AdminPanel from './components/AdminPanel';

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
                path="/entries/:entryId" 
                element={
                  <ProtectedRoute>
                    <EntryDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/entries/:entryId/picks" 
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
                path="/pool-entries/:poolId" 
                element={<PoolEntries />} 
              />
              <Route 
                path="/pools/:poolId/join" 
                element={
                  <ProtectedRoute>
                    <JoinPool />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedAdminRoute>
                    <AdminPanel />
                  </ProtectedAdminRoute>
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