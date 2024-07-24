// frontend/src/components/AdminPanel.jsx

import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AdminRequests from './AdminRequests';
import AdminDashboard from './AdminDashboard';

function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="flex mb-6">
        <Link to="/admin/requests" className="mr-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Manage Requests
        </Link>
        <Link to="/admin/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Data Management
        </Link>
      </div>
      <Routes>
        <Route path="requests" element={<AdminRequests />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default AdminPanel;