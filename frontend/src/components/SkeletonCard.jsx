// src/components/SkeletonCard.jsx

import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-nfl-white dark:bg-gray-900 rounded-2xl shadow-card animate-pulse flex flex-col overflow-hidden">
      {/* Image Placeholder */}
      <div className="w-full h-56 bg-gray-300 dark:bg-gray-700"></div>
      
      {/* Content Placeholder */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="flex items-center justify-between mt-auto">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="mt-4 h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;
