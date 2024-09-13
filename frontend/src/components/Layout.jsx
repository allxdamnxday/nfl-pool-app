import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Layout({ children }) {
  const location = useLocation();
  // We can remove this line as we're no longer using it
  // const isPicksPage = location.pathname.includes('/entries');

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
      {/* Remove the WhatsAppWidget component */}
      {/* {!isPicksPage && <WhatsAppWidget />} */}
    </div>
  );
}

export default Layout;