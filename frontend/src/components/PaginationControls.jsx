// src/components/PaginationControls.jsx

import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

function PaginationControls({ page, totalPages, onPrevious, onNext }) {
  return (
    <div className="mt-12 flex justify-center items-center space-x-4">
      <button
        onClick={onPrevious}
        disabled={page === 1}
        className={`flex items-center text-nfl-blue dark:text-nfl-white hover:text-nfl-purple transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Previous Page"
      >
        <FaArrowLeft className="mr-2 text-xl" />
        <span className="font-semibold">Previous</span>
      </button>
      <span className="text-nfl-blue dark:text-nfl-white font-bold px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-800">
        {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className={`flex items-center text-nfl-blue dark:text-nfl-white hover:text-nfl-purple transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Next Page"
      >
        <span className="font-semibold">Next</span>
        <FaArrowRight className="ml-2 text-xl" />
      </button>
    </div>
  );
}

export default PaginationControls;
