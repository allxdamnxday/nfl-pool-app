//frontend/src/components/BlogPostList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blogService';
import { FaRegComment, FaRegEye, FaRegHeart, FaEllipsisV, FaCrown, FaArrowLeft } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';

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
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-96 bg-cover bg-center" style={{backgroundImage: "url('/img/football_eliminator_erics_corner.png')"}}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-2">Eric's Corner</h1>
            <p className="text-xl text-white">Football Eliminator Blog</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200">
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <FaCrown className="text-yellow-500 mr-2" />
                  <span className="text-gray-600 text-sm">{post.author.username}</span>
                </div>
                <div className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()} • 1 min</div>
                <FaEllipsisV className="text-gray-400 cursor-pointer" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.content.substring(0, 150)}...</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-4" />
              )}
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-4 text-gray-500">
                  <span className="flex items-center"><FaRegEye className="mr-1" /> {post.views || 0} views</span>
                  <span className="flex items-center"><FaRegComment className="mr-1" /> {post.comments?.length || 0} comments</span>
                </div>
                <FaRegHeart className="text-red-500 cursor-pointer" />
              </div>
              <Link 
                to={`/blog/${post._id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 inline-block w-full text-center mt-4"
              >
                Read More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogPostList;