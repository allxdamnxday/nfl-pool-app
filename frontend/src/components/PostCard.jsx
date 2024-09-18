// src/components/PostCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegComment, FaRegEye, FaCrown } from 'react-icons/fa';
import { TwitterShareButton, FacebookShareButton, TwitterIcon, FacebookIcon } from 'react-share';
import { motion } from 'framer-motion';

function PostCard({ post, user, onLike }) {
  const postUrl = `${window.location.origin}/blog/${post._id}`;

  // Utility function to strip HTML and truncate text
  const stripHtmlAndTruncate = (html, maxLength) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <motion.div
      className="bg-nfl-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden"
      whileHover={{ scale: 1.02 }}
    >
      {/* Image Section */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
      )}

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <Link
          to={`/blog/${post._id}`}
          className="text-2xl font-bold text-nfl-blue dark:text-nfl-white hover:underline mb-4"
        >
          {post.title}
        </Link>

        {/* Author and Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaCrown className="text-nfl-gold mr-2" />
            <span className="text-nfl-blue dark:text-nfl-white font-semibold">{post.author.username}</span>
          </div>
          <div className="text-gray-650 dark:text-gray-500 text-xs">
            {new Date(post.createdAt).toLocaleDateString()} • {post.readTimeMinutes} min read
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          {stripHtmlAndTruncate(post.content, 150)}
        </p>

        {/* Actions Section */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex space-x-4 text-gray-600 dark:text-gray-400 text-sm">
            <span className="flex items-center">
              <FaRegEye className="mr-1" /> {post.views}
            </span>
            <span className="flex items-center">
              <FaRegComment className="mr-1" /> {post.comments?.length || 0}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TwitterShareButton url={postUrl} title={post.title}>
              <TwitterIcon size={24} round />
            </TwitterShareButton>
            <FacebookShareButton url={postUrl} quote={post.title}>
              <FacebookIcon size={24} round />
            </FacebookShareButton>
            <button
              onClick={() => onLike(post._id)}
              className="flex items-center bg-transparent text-gray-600 dark:text-gray-400 hover:text-nfl-purple transition-colors duration-300"
              aria-label="Like post"
            >
              {user && post.likes.includes(user._id) ? (
                <FaHeart className="mr-1 text-nfl-purple" />
              ) : (
                <FaRegHeart className="mr-1 text-lg" />
              )}
              <span className="font-semibold text-sm">{post.likes.length}</span>
            </button>
          </div>
        </div>

        {/* Read More Button */}
        <Link
          to={`/blog/${post._id}`}
          className="mt-4 inline-block bg-nfl-purple hover:bg-nfl-blue text-nfl-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 shadow-neon hover:shadow-lg"
        >
          Read More
        </Link>
      </div>
    </motion.div>
  );
}

export default PostCard;
