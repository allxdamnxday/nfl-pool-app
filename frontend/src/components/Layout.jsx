import React from 'react';
import Header from './Header';
import Footer from './Footer';  // Import the Footer component

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />  {/* Use the Footer component here */}
    </div>
  );
}

export default Layout;