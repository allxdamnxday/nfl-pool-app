//frontend/src/components/BlogPoolList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blogService';

function BlogPostList() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await getBlogPosts();
        setBlogPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogPosts.map((post) => (
          <div key={post._id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-2">By {post.author.username}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover mb-2 rounded" />
            )}
            <Link to={`/blog/${post._id}`} className="text-blue-500 hover:underline">
              Read more
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogPostList;