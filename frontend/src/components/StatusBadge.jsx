// frontend/src/components/StatusBadge.jsx

import React from 'react';

function StatusBadge({ status }) {
  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    closed: 'bg-red-500',
  };
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`${statusColors[status]} text-white text-sm font-semibold px-4 py-1 rounded-full inline-block`}
    >
      {statusText}
    </span>
  );
}

export default StatusBadge;
