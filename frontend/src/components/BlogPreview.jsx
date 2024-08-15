import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BlogPreview() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://api.yourdomain.com/blog-preview')
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching blog preview:', error);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading blog posts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Latest Blog Posts</h2>
      {posts.map(post => (
        <div key={post.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
          <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
          <p className="text-gray-600 mt-2">{post.excerpt}</p>
          <a 
            href={`https://footballeliminator.godaddysites.com${post.url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 transition-colors duration-200 mt-2 inline-block"
          >
            Read More
          </a>
        </div>
      ))}
    </div>
  );
}

export default BlogPreview;