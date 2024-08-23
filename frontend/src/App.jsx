// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
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
import UserEntries from './components/UserEntries';
import PaymentPage from './components/PaymentPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Header from './components/Header';
import { FootballButton, FieldGoal } from './components/CustomComponents';
import BlogPostList from './components/BlogPostList';
import BlogPostDetail from './components/BlogPostDetail';
import BlogPostCreate from './components/BlogPostCreate';
import EmailVerification from './components/EmailVerification';
import Rules from './components/Rules';
import About from './components/About';
import Home from './components/Home';
import OldBlog from './components/OldBlog';
import { Helmet } from 'react-helmet';
import PoolPicks from './components/PoolPicks';
import ThankYouPage from './components/ThankYouPage';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="page-transition" timeout={300}>
        <Routes location={location}>
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
            path="/entries/:entryId/:entryNumber/picks" 
            element={
              <ProtectedRoute>
                <Picks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/entries/:entryId/:entryNumber/picks/:week" 
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
            path="/payment" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            } 
          />
          <Route path="/user-entries" element={<ProtectedRoute><UserEntries /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
          <Route path="/blogs" element={<BlogPostList />} />
          <Route path="/blog/:id" element={<BlogPostDetail />} />
          <Route
            path="/admin/blog/create"
            element={
              <ProtectedAdminRoute>
                <BlogPostCreate />
              </ProtectedAdminRoute>
            }
          />
          <Route path="auth/verify-email" element={<EmailVerification />} />
          <Route path="auth/verify-email/:token" element={<EmailVerification />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<OldBlog />} />
          <Route path="/pools/:poolId/picks" element={<PoolPicks />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;