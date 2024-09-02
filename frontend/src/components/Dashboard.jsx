import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserPoolsWithEntries } from '../services/poolService';
import { FaFootballBall, FaCalendarAlt, FaUsers, FaCalendarWeek, FaDollarSign } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';
import BlogPromotion from './BlogPromotion';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { TwitterEmbed, FacebookEmbed } from 'react-social-media-embed';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    fetchUserPools();
  }, [user, showToast]);

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nfl-blue to-nfl-purple flex items-center justify-center">
        <div className="text-center text-white text-2xl bg-red-600 bg-opacity-75 rounded-lg p-8 shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with gradient background and responsive image */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source media="(max-width: 640px)" srcSet="/img-optimized/dashboard_plans_small.webp" />
            <source media="(max-width: 1024px)" srcSet="/img-optimized/dashboard_plans_medium.webp" />
            <source media="(min-width: 1025px)" srcSet="/img-optimized/dashboard_plans_large.webp" />
            <img
              src="/img-optimized/dashboard_plans_medium.webp"
              alt="Football playbook background"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Your <span className="text-nfl-gold">Dashboard</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Manage your pools and entries here</p>
          </div>
        </div>
      </div>

      {/* Content section with light background */}
      <div className="container mx-auto px-4 py-12">
        {/* Add the BlogPromotion component here */}
        <BlogPromotion />

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold text-nfl-blue">Your Pools</h2>
          <Link 
            to="/pools" 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 transform hover:scale-105 hover:shadow-neon"
          >
            Browse Pools
          </Link>
        </div>

        {pools.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center border border-gray-200">
            <FaFootballBall className="mx-auto h-24 w-24 text-nfl-gold mb-8 animate-bounce" />
            <p className="mb-6 text-2xl text-gray-600">You're not in any pools. Ready to join the action?</p>
            <Link 
              to="/pools" 
              className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
            >
              Find a Pool to Join
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pools.map((pool) => (
              <PoolCard key={pool._id} pool={pool} />
            ))}
          </div>
        )}

        {/* Move SocialMediaFeed to the bottom */}
        <SocialMediaFeed />
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
          <FaFootballBall className="mr-2 text-nfl-gold" />
          {pool.name}
        </h3>
        <StatusBadge status={pool.status} />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InfoItem icon={FaCalendarAlt} label="Season" value={pool.season} />
          <InfoItem icon={FaCalendarWeek} label="Current Week" value={pool.currentWeek} />
          <InfoItem icon={FaUsers} label="Active Entries" value={pool.activeEntries} />
          <InfoItem icon={FaDollarSign} label="Entry Paid" value={`$${totalEntryPaid}`} />
        </div>
        <div className="mt-6">
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
  const bgColor = status === 'active' ? 'bg-green-500' : 'bg-yellow-500';
  return (
    <span className={`${bgColor} text-white text-sm font-semibold px-4 py-1 rounded-full inline-block`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 text-center">
      <Icon className="text-2xl mb-2 text-nfl-light-blue" />
      <span className="font-medium text-sm text-gray-600 mb-1">{label}</span>
      <span className="text-lg font-bold text-nfl-blue">{value}</span>
    </div>
  );
}

function SocialMediaFeed() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mt-12">
      <h2 className="text-2xl font-semibold text-nfl-blue mb-4">Latest Updates</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EmbedWrapper title="Twitter">
          <TwitterEmbed url="https://twitter.com/ELIMINATORCREW/status/1830706194694185373" width={325} />
        </EmbedWrapper>
        <EmbedWrapper title="Facebook Video">
          <FacebookEmbed url="https://www.facebook.com/61564423130144/videos/1034796061530727/" width={325} />
        </EmbedWrapper>
        <EmbedWrapper title="Facebook Post">
          <FacebookEmbed url="https://www.facebook.com/permalink.php?story_fbid=pfbid0R854N29qpSVVwBk4fNKbWnZnLicrrdCBjihzUE61fyChMW9YqdfotBHxbg1sgghpl&id=61564423130144" width={325} />
        </EmbedWrapper>
      </div>
    </div>
  );
}

function EmbedWrapper({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ErrorBoundary fallback={<div>Error loading {title} embed</div>}>
        {children}
      </ErrorBoundary>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default Dashboard;