// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {/* Hero Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('/path/to/your/football-field-image.jpg')"
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-purple-400">
          Football Eliminator: Where Gridiron Glory Meets Survivor
        </h1>
        <p className="text-xl sm:text-2xl mb-6">Think you can outlast 1,300+ football fanatics?</p>
        <p className="text-2xl sm:text-3xl font-bold mb-8">Prove it or lose your $60 buy-in trying!</p>
        
        {/* Call to Action */}
        <Link 
          to="/register" 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 inline-block mb-8"
        >
          Join Now
        </Link>
        
        <p className="text-2xl font-semibold mb-8">$53,280 Prize Pool Last Year - Let's Make It Bigger!</p>
        
        <div className="space-y-4 mb-8 text-left max-w-2xl mx-auto">
          <p>✅ Pick one NFL team to win each week.</p>
          <p>✅ No spreads, no BS, just straight-up victories.</p>
          <p>✅ Use each team only once... or get eliminated trying.</p>
          <p>✅ Last Survivor Takes Home the Bacon*</p>
        </div>
        
        <p className="text-sm italic mb-8">*Unless you all get knocked out in week 3. Then you split the pot and cry together.</p>
        
        <Link 
          to="/rules" 
          className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-xl transition duration-300 inline-block"
        >
          How It Works
        </Link>
      </div>
    </div>
  );
}

export default Home;