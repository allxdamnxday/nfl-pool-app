import React from 'react';
import { Link } from 'react-router-dom';
import { FaBlog, FaComments, FaThumbsUp } from 'react-icons/fa';

function BlogPromotion() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
      <h3 className="text-2xl font-bold text-nfl-blue mb-4 flex items-center">
        <FaBlog className="mr-2 text-nfl-purple" />
        Eric's ready for the limelight!
      </h3>
      <p className="text-gray-600 mb-4">
        Dive into Eric's latest ramblings about football, life, and everything in between. Share your thoughts and join the conversation!
      </p>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-nfl-blue">
          <FaComments className="mr-1" />
          <span>Comment</span>
        </div>
        <div className="flex items-center text-nfl-blue">
          <FaThumbsUp className="mr-1" />
          <span>Like</span>
        </div>
      </div>
      <Link 
        to="/blogs" 
        className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 inline-block"
      >
        Read Eric's Blog
      </Link>
    </div>
  );
}

export default BlogPromotion;