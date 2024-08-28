// frontend/src/components/BlogPostDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { TwitterShareButton, FacebookShareButton, TwitterIcon, FacebookIcon } from 'react-share';
import { getBlogPost, likeBlogPost, getBlogComments, createComment, likeComment } from '../services/blogService';
import { FaRegComment, FaRegEye, FaRegHeart, FaHeart, FaArrowLeft, FaCrown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { LogoSpinner } from './CustomComponents';

function BlogPostDetail() {
  const [blogPost, setBlogPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComment(id, { content: commentContent });
      setCommentContent('');
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
      <div className="flex justify-center items-center h-screen">
        <LogoSpinner size={20} />
      </div>
    );
  }

  if (!blogPost) {
    return <div>Blog post not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>{blogPost.title} | Eric's Corner</title>
        <meta name="description" content={blogPost.content.substring(0, 160)} />
        <meta property="og:title" content={blogPost.title} />
        <meta property="og:description" content={blogPost.content.substring(0, 160)} />
        <meta property="og:image" content={blogPost.imageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

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
              {blogPost.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Link to="/blogs" className="inline-flex items-center text-nfl-purple hover:text-purple-700 mb-8 transition-colors duration-200 font-bold">
          <FaArrowLeft className="mr-2" />
          Back to Blog List
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6 transition duration-300 ease-in-out hover:shadow-xl">
          {blogPost.imageUrl && (
            <div className="mb-6 flex justify-center">
              <div 
                className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-gray-200"
                style={{ aspectRatio: 'var(--aspect-ratio, 3/2)' }}
              >
                <img 
                  src={blogPost.imageUrl} 
                  alt={blogPost.title} 
                  className="absolute inset-0 w-full h-full object-contain"
                  onLoad={(e) => {
                    const img = e.target;
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    img.parentElement.style.setProperty('--aspect-ratio', aspectRatio);
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <FaCrown className="text-nfl-gold mr-2" />
              <span className="text-nfl-blue font-semibold">{blogPost.author.username}</span>
            </div>
            <div className="text-gray-500 text-sm">
              {new Date(blogPost.createdAt).toLocaleDateString()} • {blogPost.readTimeMinutes} min read
            </div>
          </div>
          
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
          
          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <div className="flex space-x-4 text-gray-600">
              <span className="flex items-center"><FaRegEye className="mr-1" /> {blogPost.views}</span>
              <span className="flex items-center"><FaRegComment className="mr-1" /> {comments.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TwitterShareButton url={currentUrl} title={blogPost.title}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <FacebookShareButton url={currentUrl} quote={blogPost.title}>
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <button 
                onClick={handleLike} 
                className="flex items-center bg-transparent text-gray-500 hover:text-nfl-purple transition duration-300 hover:bg-transparent"
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

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-nfl-blue">Comments</h2>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-nfl-purple focus:border-transparent"
                rows="4"
                placeholder="Write a comment..."
                required
              />
              <button type="submit" className="mt-3 bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-neon">
                Post Comment
              </button>
            </form>
          ) : (
            <p className="mb-6 text-gray-600">Please log in to leave a comment.</p>
          )}

          {comments.map((comment) => (
            <div key={comment._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-nfl-blue">{comment.author.username}</span>
                <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mb-3 text-gray-700">{comment.content}</p>
              <div className="flex justify-end items-center">
                <button 
                  onClick={() => handleCommentLike(comment._id)} 
                  className="flex items-center bg-transparent text-gray-500 hover:text-nfl-purple transition duration-300 hover:bg-transparent"
                >
                  {user && comment.likes.includes(user._id) ? (
                    <FaHeart className="mr-1 text-nfl-purple" />
                  ) : (
                    <FaRegHeart className="mr-1" />
                  )}
                  <span className="font-semibold">{comment.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogPostDetail;