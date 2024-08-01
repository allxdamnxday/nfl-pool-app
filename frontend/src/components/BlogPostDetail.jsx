//frontend/src/components/BlogPostDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogPost } from '../services/blogService';

function BlogPostDetail() {
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await getBlogPost(id);
        setBlogPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blogPost) {
    return <div>Blog post not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
      <p className="text-gray-600 mb-4">By {blogPost.author.username} on {new Date(blogPost.createdAt).toLocaleDateString()}</p>
      {blogPost.imageUrl && (
        <img src={blogPost.imageUrl} alt={blogPost.title} className="w-full max-w-2xl h-64 object-cover mb-4 rounded" />
      )}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
    </div>
  );
}

export default BlogPostDetail;