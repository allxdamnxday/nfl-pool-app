import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const WeekSelector = ({ currentWeek, onWeekChange }) => {
  return (
    <div className="week-selector flex items-center justify-center">
      <button 
        onClick={() => onWeekChange(currentWeek - 1)} 
        disabled={currentWeek === 1}
        className="bg-nfl-gold text-nfl-blue font-bold py-2 px-4 rounded-l-full disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 hover:bg-yellow-400"
      >
        <FaChevronLeft />
      </button>
      <span className="bg-white text-nfl-blue font-bold py-2 px-6 text-xl">Week {currentWeek}</span>
      <button 
        onClick={() => onWeekChange(currentWeek + 1)} 
        disabled={currentWeek === 18}
        className="bg-nfl-gold text-nfl-blue font-bold py-2 px-4 rounded-r-full disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 hover:bg-yellow-400"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default WeekSelector;
