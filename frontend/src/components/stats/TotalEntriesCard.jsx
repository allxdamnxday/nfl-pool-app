import React from 'react';
import './TotalEntriesCard.css';

function TotalEntriesCard({ stats }) {
  if (!stats) return null;

  return (
    <div className="total-entries-card">
      <h2 className="card-title">Total Entries</h2>
      <div className="entry-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{stats.totalEntries}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active:</span>
          <span className="stat-value active">{stats.activeEntries}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Eliminated:</span>
          <span className="stat-value eliminated">{stats.eliminatedEntries}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Elimination Rate:</span>
          <span className="stat-value">{stats.eliminationRate}</span>
        </div>
      </div>
    </div>
  );
}

export default TotalEntriesCard;