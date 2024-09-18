// src/components/CommentForm.jsx

import React, { useState } from 'react';

function CommentForm({ onSubmit }) {
  const [commentContent, setCommentContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentContent.trim() === '') return;
    onSubmit(commentContent);
    setCommentContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-nfl-purple focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-700"
        rows="4"
        placeholder="Write a comment..."
        required
      />
      <button
        type="submit"
        className="mt-3 bg-nfl-purple hover:bg-nfl-blue text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 shadow-neon"
      >
        Post Comment
      </button>
    </form>
  );
}

export default CommentForm;
