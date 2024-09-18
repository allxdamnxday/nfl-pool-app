// src/components/BlogPostList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts, getFeaturedBlogPosts, likeBlogPost } from '../services/blogService';
import { FaArrowLeft } from 'react-icons/fa';
import FeaturedPostSlider from './FeaturedPostSlider';
import PostCard from './PostCard';
import PaginationControls from './PaginationControls';
import SkeletonCard from './SkeletonCard';
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
      setLoading(true);
      try {
        const [postsResponse, featuredResponse] = await Promise.all([
          getBlogPosts(page),
          getFeaturedBlogPosts()
        ]);
        setBlogPosts(postsResponse.data);
        setFeaturedPosts(featuredResponse.data);
        setTotalPages(postsResponse.totalPages);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [page]);

  const handleLike = async (postId) => {
    if (!user) {
      alert('You must be logged in to like posts.');
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-nfl-purple dark:text-nfl-white hover:text-nfl-blue transition-colors duration-200 mb-8 font-bold"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        {/* Featured Posts Slider */}
        {featuredPosts.length > 0 && (
          <FeaturedPostSlider
            featuredPosts={featuredPosts}
            user={user}
            onLike={handleLike}
          />
        )}

        {/* Latest Posts */}
        <h2 className="text-4xl font-bold mb-8 text-nfl-blue dark:text-nfl-white">Latest Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : blogPosts.map(post => (
                <PostCard key={post._id} post={post} user={user} onLike={handleLike} />
              ))
          }
        </div>

        {/* Pagination Controls */}
        {!loading && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage(prev => Math.max(prev - 1, 1))}
            onNext={() => setPage(prev => Math.min(prev + 1, totalPages))}
          />
        )}
      </div>

      {/* Optional Footer */}
      {/* <Footer /> */}
    </div>
  );
}

export default BlogPostList;
