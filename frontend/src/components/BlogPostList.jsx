//frontend/src/components/BlogPostList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TwitterShareButton, FacebookShareButton, TwitterIcon, FacebookIcon } from 'react-share';
import { getBlogPosts, getFeaturedBlogPosts, likeBlogPost } from '../services/blogService';
import { FaRegComment, FaRegEye, FaRegHeart, FaHeart, FaCrown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { LogoSpinner } from './CustomComponents';
import { useAuth } from '../contexts/AuthContext';

function BlogPostList() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const [postsResponse, featuredResponse] = await Promise.all([
          getBlogPosts(page),
          getFeaturedBlogPosts()
        ]);
        setBlogPosts(postsResponse.data);
        setFeaturedPosts(featuredResponse.data);
        setTotalPages(postsResponse.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [page]);

  const handleLike = async (postId) => {
    if (!user) {
      console.log('User must be logged in to like posts');
      return;
    }
    try {
      const response = await likeBlogPost(postId);
      const updatedPosts = blogPosts.map(post => 
        post._id === postId ? { ...post, likes: response.data.likes } : post
      );
      setBlogPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const stripHtmlAndTruncate = (html, maxLength) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const renderBlogPost = (post) => {
    const postUrl = `${window.location.origin}/blog/${post._id}`;
    
    return (
      <div key={post._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition duration-300 ease-in-out hover:shadow-xl hover:scale-102 flex flex-col h-full">
        <div className="p-6 flex flex-col h-full">
          <div className="flex-none mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <FaCrown className="text-nfl-gold mr-2" />
                <span className="text-nfl-blue font-semibold">{post.author.username}</span>
              </div>
              <div className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleDateString()} • {post.readTimeMinutes} min read</div>
            </div>
            <h3 className="text-xl font-bold text-nfl-blue line-clamp-2 h-14">{post.title}</h3>
          </div>
          
          <div className="flex-grow mb-4">
            {post.imageUrl && (
              <div className="aspect-w-16 aspect-h-9">
                <img src={post.imageUrl} alt={post.title} className="object-cover rounded-lg w-full h-full" />
              </div>
            )}
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-3">{stripHtmlAndTruncate(post.content, 150)}</p>
          
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4 text-gray-600 text-sm">
                <span className="flex items-center"><FaRegEye className="mr-1" /> {post.views}</span>
                <span className="flex items-center"><FaRegComment className="mr-1" /> {post.comments?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TwitterShareButton url={postUrl} title={post.title}>
                  <TwitterIcon size={24} round />
                </TwitterShareButton>
                <FacebookShareButton url={postUrl} quote={post.title}>
                  <FacebookIcon size={24} round />
                </FacebookShareButton>
                <button 
                  onClick={() => handleLike(post._id)} 
                  className="flex items-center bg-transparent text-gray-500 hover:text-nfl-purple transition duration-300 hover:bg-transparent"
                >
                  {user && post.likes.includes(user._id) ? (
                    <FaHeart className="mr-1 text-lg text-nfl-purple" />
                  ) : (
                    <FaRegHeart className="mr-1 text-lg" />
                  )}
                  <span className="font-semibold text-sm">{post.likes.length}</span>
                </button>
              </div>
            </div>
            <Link 
              to={`/blog/${post._id}`}
              className="w-full bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 inline-block text-center text-sm transform hover:scale-105 hover:shadow-neon"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-24">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/img/football_eliminator_erics_corner.png"
            alt="Eric's Corner Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              Eric's Corner
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Football Eliminator Blog</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-nfl-purple hover:text-purple-700 mb-8 transition-colors duration-200 font-bold">
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-8 text-nfl-blue">Featured Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map(renderBlogPost)}
            </div>
          </div>
        )}

        <h2 className="text-4xl font-bold mb-8 text-nfl-blue">Latest Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(renderBlogPost)}
        </div>

        <div className="mt-12 flex justify-center items-center space-x-4">
          <button 
            onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
            disabled={page === 1}
            className="flex items-center text-nfl-blue hover:text-nfl-purple transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent hover:bg-transparent"
          >
            <FaArrowLeft className="mr-2 text-xl" />
            <span className="font-semibold">Previous</span>
          </button>
          <span className="text-nfl-blue font-bold px-4 py-2 rounded-full bg-gray-200">
            {page} of {totalPages}
          </span>
          <button 
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={page === totalPages}
            className="flex items-center text-nfl-blue hover:text-nfl-purple transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent hover:bg-transparent"
          >
            <span className="font-semibold">Next</span>
            <FaArrowRight className="ml-2 text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlogPostList;