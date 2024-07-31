import React from 'react';
import Header from './Header';  // Import the Header component

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 p-8">
      <Header />  {/* Use the Header component here */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; 2024 FootballEliminator.com All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;