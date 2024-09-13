// frontend/src/components/Dashboard.jsx

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPoolsWithEntries } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaCalendarWeek, FaDollarSign, FaInfoCircle, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';
import BlogPromotion from './BlogPromotion';
import { getLatestBlogPost, likeBlogPost } from '../services/blogService';
import { motion } from 'framer-motion';
import PoolCard from './PoolCard'; // Assuming PoolCard is extracted
import EmptyPoolsMessage from './EmptyPoolsMessage'; // Assuming EmptyPoolsMessage is extracted
import Button from './Button'; // Assuming Button is extracted

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestBlogPost, setLatestBlogPost] = useState(null);
  const showToast = useToast();

  // Fetch user pools with entries
  const fetchUserPools = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const userPoolsWithEntries = await getUserPoolsWithEntries();
      console.log('User pools with entries:', userPoolsWithEntries);
      setPools(userPoolsWithEntries);
    } catch (error) {
      console.error('Failed to fetch user pools with entries:', error);
      setError('Failed to load your pools. Please try again later.');
      showToast('Failed to load your pools. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Fetch latest blog post
  const fetchLatestBlogPost = useCallback(async () => {
    try {
      const post = await getLatestBlogPost();
      setLatestBlogPost(post);
    } catch (error) {
      console.error('Failed to fetch latest blog post:', error);
      // Optionally show a toast message
    }
  }, []);

  useEffect(() => {
    fetchUserPools();
    fetchLatestBlogPost();
  }, [fetchUserPools, fetchLatestBlogPost]);

  // Handle liking a blog post
  const handleLikeBlogPost = async (postId) => {
    if (!user) {
      showToast('You must be logged in to like posts', 'error');
      return;
    }
    try {
      const response = await likeBlogPost(postId);
      setLatestBlogPost(prevPost => ({
        ...prevPost,
        likes: response.data.likes
      }));
      showToast('Post liked successfully!', 'success');
    } catch (error) {
      console.error('Error liking post:', error);
      showToast('Failed to like the post. Please try again.', 'error');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LogoSpinner size={128} />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center p-4">
        <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl" aria-hidden="true" />
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchUserPools}
            className="bg-white text-red-600 font-bold py-2 px-4 rounded-full hover:bg-gray-100 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (pools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center p-4">
        <EmptyPoolsMessage />
      </div>
    );
  }

  // Main Dashboard Render
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <motion.header
        className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16 bg-center bg-cover"
        style={{ backgroundImage: 'url(/img-optimized/dashboard_plans_medium.webp)' }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 text-nfl-white drop-shadow-xl">
              Your <span className="text-nfl-gold">Dashboard</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 drop-shadow-lg">
              Manage your pools and entries here
            </p>
          </div>
        </div>
      </motion.header>

      {/* Content Section */}
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Blog Promotion */}
        {latestBlogPost && (
          <BlogPromotion latestPost={latestBlogPost} onLike={handleLikeBlogPost} />
        )}

        {/* Pools Overview */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-nfl-blue mb-4 md:mb-0">Your Pools</h2>
          <Button to="/pools">Join a New Pool</Button>
        </div>

        {/* Pools Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {pools.map((pool) => (
            <motion.div key={pool._id} variants={cardVariants}>
              <PoolCard pool={pool} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Animation Variants for Cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default Dashboard;
