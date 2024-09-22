import React from 'react';
import './OverallKillRatioCard.css';

function OverallKillRatioCard({ stats }) {
  return (
    <div className="overall-kill-ratio-card">
      <h2 className="card-title">Overall Kill Ratio</h2>
      <div className="kill-ratio-stats">
        <div className="stat-item">
          <span className="stat-label">Total Picks:</span>
          <span className="stat-value">{stats.totalPicks}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Eliminations:</span>
          <span className="stat-value">{stats.totalEliminations}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Kill Ratio:</span>
          <span className="stat-value">{(stats.overallKillRatio * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

export default OverallKillRatioCard;