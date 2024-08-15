import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPoolDetails } from '../services/poolService';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';
import { FaArrowLeft, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

function JoinPool() {
  const [pool, setPool] = useState(null);
  const [numberOfEntries, setNumberOfEntries] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { poolId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    const fetchPoolDetails = async () => {
      try {
        const poolData = await getPoolDetails(poolId);
        setPool(poolData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pool details. Please try again later.');
        showToast('Failed to load pool details. Please try again later.', 'error');
        setLoading(false);
      }
    };

    fetchPoolDetails();
  }, [poolId, showToast]);

  const handleJoinRequest = (e) => {
    e.preventDefault();
    logger.info(`Initiating join request for pool ${poolId} with ${numberOfEntries} entries`);
    navigate('/payment', { 
      state: { 
        poolId, 
        numberOfEntries, 
        entryFee: pool?.entryFee, 
        totalAmount: numberOfEntries * (pool?.entryFee || 0) 
      } 
    });
  };

  if (loading) {
    return <LogoSpinner size={128} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center border border-gray-200 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <Link 
            to="/pools" 
            className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-block transform hover:scale-105 hover:shadow-neon"
          >
            Return to Pools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-16">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Join <span className="text-nfl-gold">{pool?.name}</span>
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">
              Start your journey in this exciting pool!
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <Link to="/pools" className="inline-flex items-center text-nfl-purple hover:text-purple-700 mb-8 transition-colors duration-200">
          <FaArrowLeft className="mr-2" />
          Back to Pools
        </Link>
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoItem icon={FaDollarSign} label="Entry Fee" value={`$${pool?.entryFee}`} />
            <InfoItem icon={FaCalendarAlt} label="Season" value={pool?.season} />
          </div>
          <form onSubmit={handleJoinRequest} className="space-y-6">
            <div>
              <label htmlFor="numberOfEntries" className="block text-lg font-medium text-gray-700 mb-2">
                Number of Entries (1-3):
              </label>
              <input
                type="number"
                id="numberOfEntries"
                value={numberOfEntries}
                onChange={(e) => setNumberOfEntries(Number(e.target.value))}
                min="1"
                max="3"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-nfl-purple focus:border-nfl-purple text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-nfl-purple hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold text-lg transition duration-300 transform hover:scale-105 hover:shadow-neon"
            >
              Submit Join Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
      <Icon className="text-3xl mb-2 text-nfl-light-blue" />
      <span className="font-medium text-sm text-gray-600 mb-1">{label}</span>
      <span className="text-xl font-bold text-nfl-blue">{value}</span>
    </div>
  );
}

export default JoinPool;