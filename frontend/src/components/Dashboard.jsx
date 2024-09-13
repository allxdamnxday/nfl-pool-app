import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPoolsWithEntries } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaCalendarWeek, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';
import BlogPromotion from './BlogPromotion';
import { getLatestBlogPost, likeBlogPost } from '../services/blogService';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestBlogPost, setLatestBlogPost] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchUserPools = async () => {
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
    };

    const fetchLatestBlogPost = async () => {
      try {
        const post = await getLatestBlogPost();
        setLatestBlogPost(post);
      } catch (error) {
        console.error('Failed to fetch latest blog post:', error);
        // Optionally show a toast message
      }
    };

    fetchUserPools();
    fetchLatestBlogPost();
  }, [user, showToast]);

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
    } catch (error) {
      console.error('Error liking post:', error);
      showToast('Failed to like the post. Please try again.', 'error');
    }
  };

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
        <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => fetchUserPools()}
            className="bg-white text-red-600 font-bold py-2 px-4 rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16 bg-center bg-cover"
        style={{ backgroundImage: 'url(/img-optimized/dashboard_plans_medium.webp)' }}
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
      </header>

      <div className="container mx-auto px-4 py-12">
        {latestBlogPost && (
          <BlogPromotion latestPost={latestBlogPost} onLike={handleLikeBlogPost} />
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-nfl-blue">Your Pools</h2>
          <Button to="/pools">Browse Pools</Button>
        </div>

        {pools.length === 0 ? (
          <EmptyPoolsMessage />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {pools.map((pool) => (
              <PoolCard key={pool._id} pool={pool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PoolCard({ pool }) {
  // Calculate total entry paid
  const totalEntryPaid = pool.activeEntries * pool.entryFee;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:scale-102">
      <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
        <h3 className="text-2xl font-bold text-nfl-white mb-2 break-words flex items-center">
          <FaFootballBall className="mr-2 text-nfl-gold" aria-hidden="true" />
          {pool.name}
        </h3>
        <StatusBadge status={pool.status} />
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={FaCalendarAlt} label="Season" value={pool.season} />
          <InfoItem icon={FaCalendarWeek} label="Current Week" value={pool.currentWeek} />
          <InfoItem icon={FaUsers} label="Active Entries" value={pool.activeEntries} />
          <InfoItem icon={FaDollarSign} label="Entry Paid" value={`$${totalEntryPaid}`} />
        </div>
        <div>
          <Link 
            to={`/entries?poolId=${pool._id}`} 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full block text-center transition duration-300 transform hover:scale-105 hover:shadow-neon"
          >
            View Entries
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    closed: 'bg-red-500',
  };
  return (
    <span
      className={`${statusColors[status]} text-white text-sm font-semibold px-4 py-1 rounded-full inline-block`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 text-center">
      <Icon className="text-3xl mb-2 text-nfl-light-blue" aria-hidden="true" />
      <span className="font-medium text-sm text-gray-600 mb-1">{label}</span>
      <span className="text-lg font-bold text-nfl-blue">{value}</span>
    </div>
  );
}

function Button({ to, children }) {
  return (
    <Link
      to={to}
      className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full text-base sm:text-lg transition duration-300 transform hover:scale-105 hover:shadow-neon"
    >
      {children}
    </Link>
  );
}

function EmptyPoolsMessage() {
  return (
    <div className="bg-white rounded-xl p-12 shadow-lg text-center border border-gray-200">
      <FaFootballBall className="mx-auto h-24 w-24 text-nfl-gold mb-8 animate-bounce" aria-hidden="true" />
      <p className="mb-6 text-2xl text-gray-600">You're not in any pools. Ready to join the action?</p>
      <Button to="/pools">Find a Pool to Join</Button>
    </div>
  );
}

export default Dashboard;