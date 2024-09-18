// src/components/ShareButtons.jsx

import React from 'react';
import { TwitterShareButton, FacebookShareButton, TwitterIcon, FacebookIcon } from 'react-share';

function ShareButtons({ url, title }) {
  return (
    <div className="flex space-x-2">
      <TwitterShareButton url={url} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      {/* Add more share buttons as needed */}
    </div>
  );
}

export default ShareButtons;
