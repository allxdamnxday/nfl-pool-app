// src/components/CommentCard.jsx

import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';

function CommentCard({ comment, user, onLike }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-nfl-blue">{comment.author.username}</span>
        <span className="text-sm text-gray-500">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 mb-3">{comment.content}</p>
      <div className="flex justify-end items-center">
        <button
          onClick={() => onLike(comment._id)}
          className="flex items-center text-gray-500 hover:text-nfl-purple transition-colors duration-300"
          aria-label="Like comment"
        >
          {user && comment.likes.includes(user._id) ? (
            <FaHeart className="mr-1 text-nfl-purple" />
          ) : (
            <FaRegHeart className="mr-1" />
          )}
          <span className="font-semibold">{comment.likes.length}</span>
        </button>
      </div>
    </motion.div>
  );
}

export default CommentCard;
