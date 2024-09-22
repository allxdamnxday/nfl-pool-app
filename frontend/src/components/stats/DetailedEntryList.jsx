import React, { useState, useEffect, useMemo } from 'react';
import { getDetailedEntryList } from '../../services/statsService';
import { useToast } from '../../contexts/ToastContext';
import logger from '../../utils/logger';
import './DetailedEntryList.css';

function DetailedEntryList({ poolId, currentWeek }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 100;

  useEffect(() => {
    fetchEntries();
  }, [poolId, currentWeek]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await getDetailedEntryList(poolId, currentWeek);
      if (response.success) {
        setEntries(response.entries || []);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      logger.error('Error fetching detailed entry list:', err);
      setError('Failed to fetch entries. Please try again.');
      showToast('error', 'Failed to load entries');
    }
    setIsLoading(false);
  };

  const handleSort = (key) => {
    setSortOrder(sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(key);
  };

  const sortedAndFilteredEntries = useMemo(() => {
    let result = [...entries];
    
    if (filterTeam) {
      result = result.filter(entry => 
        entry.weekPick?.team?.toLowerCase().includes(filterTeam.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(entry => entry.status?.toLowerCase() === filterStatus);
    }
    
    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'username':
          aValue = a.userDetails?.username?.toLowerCase() || '';
          bValue = b.userDetails?.username?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'pick':
          aValue = a.weekPick?.team?.toLowerCase() || '';
          bValue = b.weekPick?.team?.toLowerCase() || '';
          break;
        case 'result':
          aValue = a.weekPick?.result?.toLowerCase() || '';
          bValue = b.weekPick?.result?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [entries, sortBy, sortOrder, filterTeam, filterStatus]);

  const pageCount = Math.ceil(sortedAndFilteredEntries.length / entriesPerPage);
  const paginatedEntries = sortedAndFilteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterTeam, filterStatus]);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="detailed-entry-list">
      <h2 className="title">Entries for Week {currentWeek}</h2>
      
      <div className="filters">
        <input 
          type="text" 
          placeholder="Filter by team" 
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        />
        <div className="status-filters">
          <button 
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={filterStatus === 'active' ? 'active' : ''}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </button>
          <button 
            className={filterStatus === 'eliminated' ? 'active' : ''}
            onClick={() => setFilterStatus('eliminated')}
          >
            Eliminated
          </button>
        </div>
      </div>

      <div className="entry-count">
        Total Entries: {sortedAndFilteredEntries.length}
      </div>

      {paginatedEntries.length > 0 ? (
        <>
          <table className="entries-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('username')}>Username {sortBy === 'username' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('status')}>Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('pick')}>Pick {sortBy === 'pick' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                <th onClick={() => handleSort('result')}>Result {sortBy === 'result' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.userDetails?.username}</td>
                  <td>
                    <span className={`status ${entry.status?.toLowerCase()}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td>{entry.weekPick?.team || 'No Pick'}</td>
                  <td>
                    <span className={`result ${entry.weekPick?.result?.toLowerCase() || 'pending'}`}>
                      {entry.weekPick?.result || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {pageCount}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="no-entries">No entries found for this week.</p>
      )}
    </div>
  );
}

export default DetailedEntryList;