//frontend/src/components/BlogManagement.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts, deleteBlogPost } from '../services/blogService';
import { useToast } from '../contexts/ToastContext';

function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await getBlogPosts();
      setBlogPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
      showToast('Failed to fetch blog posts', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlogPost(id);
        showToast('Blog post deleted successfully', 'success');
        fetchBlogPosts();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        showToast('Failed to delete blog post', 'error');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Manage Blog Posts</h1>
      <Link to="/admin/blog/create" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 inline-block">
        Create New Post
      </Link>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map((post) => (
              <tr key={post._id}>
                <td className="border px-4 py-2">{post.title}</td>
                <td className="border px-4 py-2">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="border px-4 py-2">
                  <Link to={`/admin/blog/edit/${post._id}`} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BlogManagement;