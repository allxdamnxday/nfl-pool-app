// frontend/src/components/AdminPanel.jsx

import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AdminRequests from './AdminRequests';
import AdminDashboard from './AdminDashboard';
import BlogManagement from './BlogManagement';
import BlogPostCreate from './BlogPostCreate';
import BlogPostEdit from './BlogPostEdit';
import { FaClipboardList, FaChartBar, FaBlog } from 'react-icons/fa';

function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-gray-900">Admin Panel</h1>
        <div className="flex flex-wrap gap-4 mb-8">
          <Link 
            to="/admin/requests" 
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-300 ease-in-out"
          >
            <FaClipboardList className="mr-2" />
            Manage Requests
          </Link>
          <Link 
            to="/admin/dashboard" 
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            <FaChartBar className="mr-2" />
            Data Management
          </Link>
          <Link 
            to="/admin/blog" 
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition duration-300 ease-in-out"
          >
            <FaBlog className="mr-2" />
            Manage Blog Posts
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <Routes>
            <Route path="requests" element={<AdminRequests />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="blog/create" element={<BlogPostCreate />} />
            <Route path="blog/edit/:id" element={<BlogPostEdit />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;