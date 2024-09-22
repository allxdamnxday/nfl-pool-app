import React from 'react';
import './WeekSelector.css';

function WeekSelector({ currentWeek, setCurrentWeek, totalWeeks = 18 }) {
  return (
    <div className="week-selector">
      <label htmlFor="week-select">Select Week:</label>
      <select
        id="week-select"
        value={currentWeek}
        onChange={(e) => setCurrentWeek(Number(e.target.value))}
      >
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
          <option key={week} value={week}>
            Week {week}
          </option>
        ))}
      </select>
    </div>
  );
}

export default WeekSelector;