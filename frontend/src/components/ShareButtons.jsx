import React from 'react';
import { FaFacebookF, FaTwitter } from 'react-icons/fa';

const ShareButtons = ({ shareUrls }) => {
  if (!shareUrls) return null;

  return (
    <>
      <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
        <FaFacebookF className="text-xl" />
      </a>
      <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
        <FaTwitter className="text-xl" />
      </a>
    </>
  );
};

export default ShareButtons;