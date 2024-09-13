// frontend/src/components/InfoItem.jsx

import React from 'react';

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-3 text-center">
      <Icon className="text-3xl mb-2 text-nfl-light-blue" aria-hidden="true" />
      <span className="font-medium text-sm text-gray-600 mb-1">{label}</span>
      <span className="text-lg font-bold text-nfl-blue">{value}</span>
    </div>
  );
}

export default InfoItem;
