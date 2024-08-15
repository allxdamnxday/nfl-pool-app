import React from 'react';
import { Helmet } from 'react-helmet';

function OldBlog() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Football Eliminator Blog</title>
        <meta name="description" content="Stay updated with the latest news, insights, and stories from the Football Eliminator community." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">Football Eliminator Blog</h1>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src="https://footballeliminator.godaddysites.com/poorly-written-blog"
            title="Football Eliminator Blog"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default OldBlog;