// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PoolList from './components/PoolList';
import PoolDetails from './components/PoolDetails';
import GameDetails from './components/GameDetails';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
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
                path="/pools" 
                element={
                  <ProtectedRoute>
                    <PoolList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pools/:id" 
                element={
                  <ProtectedRoute>
                    <PoolDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/games/:id" 
                element={
                  <ProtectedRoute>
                    <GameDetails />
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