//frontend/src/components/BlogPostEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogPost, updateBlogPost } from '../services/blogService';
import { useToast } from '../contexts/ToastContext';

function BlogPostEdit() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await getBlogPost(id);
        const { title, content, imageUrl } = response.data;
        setTitle(title);
        setContent(content);
        setImageUrl(imageUrl || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Failed to fetch blog post');
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBlogPost(id, { title, content, imageUrl });
      showToast('Blog post updated successfully', 'success');
      navigate('/admin/blog');
    } catch (error) {
      setError('Failed to update blog post. Please try again.');
      console.error('Error updating blog post:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Edit Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            rows="10"
          ></textarea>
        </div>
        <div>
          <label htmlFor="imageUrl" className="block mb-1">Image URL (optional)</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update Post
        </button>
      </form>
    </div>
  );
}

export default BlogPostEdit;