// src/components/BlogPostDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getBlogPost, likeBlogPost, getBlogComments, createComment, likeComment } from '../services/blogService';
import { FaRegComment, FaRegEye, FaRegHeart, FaHeart, FaArrowLeft, FaCrown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { LogoSpinner } from './CustomComponents';
import Header from './Header';
import CommentCard from './CommentCard';
import ShareButtons from './ShareButtons';
import CommentForm from './CommentForm';
import Footer from './Footer'; // Optional

function BlogPostDetail() {
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();

  const fetchBlogPost = useCallback(async () => {
    try {
      const response = await getBlogPost(id);
      setBlogPost(response.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await getBlogComments(id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBlogPost(), fetchComments()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchBlogPost, fetchComments]);

  const handleLike = async () => {
    try {
      const response = await likeBlogPost(id);
      setBlogPost(prevPost => ({ ...prevPost, likes: response.data.likes }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (content) => {
    try {
      await createComment(id, { content });
      fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await likeComment(id, commentId);
      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Get the current URL for sharing
  const currentUrl = window.location.href;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LogoSpinner size={40} />
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Blog post not found.</p>
        <Link to="/blogs" className="mt-4 text-nfl-purple hover:text-nfl-blue transition-colors duration-200 font-semibold">
          Back to Blog List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>{blogPost.title} | Football Eliminator</title>
        <meta name="description" content={blogPost.content.substring(0, 160)} />
        <meta property="og:title" content={blogPost.title} />
        <meta property="og:description" content={blogPost.content.substring(0, 160)} />
        <meta property="og:image" content={blogPost.imageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Header Section */}
      <Header />

      {/* Banner Section */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-24">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/img/football_eliminator_erics_corner.png"
            alt="Eric's Corner Banner"
            className="w-full h-full object-cover object-center opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 drop-shadow-lg">
              {blogPost.title}
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">
              {blogPost.subtitle || 'Insights and Updates'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/blogs"
          className="inline-flex items-center text-nfl-purple hover:text-nfl-blue transition-colors duration-200 mb-8 font-bold"
        >
          <FaArrowLeft className="mr-2" />
          Back to Blog List
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6 transition duration-300 ease-in-out hover:shadow-xl">
          {/* Image Section */}
          {blogPost.imageUrl && (
            <div className="mb-6 flex justify-center">
              <div
                className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-gray-200"
                style={{ aspectRatio: '3 / 2' }}
              >
                <img
                  src={blogPost.imageUrl}
                  alt={blogPost.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Author and Date */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <FaCrown className="text-nfl-gold mr-2" />
              <span className="text-nfl-blue font-semibold">{blogPost.author.username}</span>
            </div>
            <div className="text-gray-500 text-sm">
              {new Date(blogPost.createdAt).toLocaleDateString()} • {blogPost.readTimeMinutes} min read
            </div>
          </div>

          {/* Content Section */}
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: blogPost.content }} />

          {/* Actions Section */}
          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <div className="flex space-x-4 text-gray-600 text-sm">
              <span className="flex items-center">
                <FaRegEye className="mr-1" /> {blogPost.views}
              </span>
              <span className="flex items-center">
                <FaRegComment className="mr-1" /> {comments.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ShareButtons url={currentUrl} title={blogPost.title} />
              <button
                onClick={handleLike}
                className="flex items-center bg-transparent text-gray-500 hover:text-nfl-purple transition duration-300"
                aria-label="Like post"
              >
                {user && blogPost.likes.includes(user._id) ? (
                  <FaHeart className="mr-1 text-xl text-nfl-purple" />
                ) : (
                  <FaRegHeart className="mr-1 text-xl" />
                )}
                <span className="font-semibold">{blogPost.likes.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-nfl-blue">Comments</h2>
          {user ? (
            <CommentForm onSubmit={handleCommentSubmit} />
          ) : (
            <p className="mb-6 text-gray-600">Please log in to leave a comment.</p>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                user={user}
                onLike={handleCommentLike}
              />
            ))
          ) : (
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default BlogPostDetail;
