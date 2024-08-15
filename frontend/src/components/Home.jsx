// frontend/src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with dark background */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-purple-400">
              The Jim Thomas Football Junkie Extravaganza
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
              <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Pick one NFL team to win each week.</p>
              <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> No spreads, no BS, just straight-up victories.</p>
              <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Use each team only once... or get eliminated trying.</p>
              <p className="flex items-center"><span className="text-green-400 mr-2">✓</span> Last Survivor Takes Home the Bacon*</p>
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
      </div>

      {/* Content sections with light background */}
      <div className="container mx-auto px-4 py-16">
        {/* Winner's Circle */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-purple-600 text-center">
            JT Eliminator Winner's Circle
          </h2>
          <h3 className="text-2xl font-semibold mb-4 text-center">Past Champions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["2023", "Kirk Brancato and Lauren Porter"],
              ["2022", "Chris Friedman/John Emberton"],
              ["2021", "Evan Ridge"],
              ["2020", "Mychal Morris"],
              ["2019", "James Burbridge"],
              ["2018", "Laura Valan"],
              ["2017", "Sean Toohey/Brian Price"],
              ["2016", "Misha Freeman/Dereck Bowlen/Stan Felderman/John (Dad) Nelson"],
            ].map(([year, champions]) => (
              <div key={year} className="bg-gray-100 rounded p-4">
                <span className="font-bold text-purple-600">{year}</span> - {champions}
              </div>
            ))}
          </div>
        </div>
        
        {/* About Section */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-purple-600 text-center">
            About the Madness
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-500">The Commissioner</h3>
              <p className="text-lg leading-relaxed">
                Matthew Swartz – Eldest son of the longtime commissioner, Eric Swartz and a disgruntled Chargers fan. Known for speaking out against things he doesn't like, including Dean Spanos and all things Chiefs and Pat Mahomes (aka Kermit the Frog) related.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-500">How it All Began</h3>
              <p className="text-lg leading-relaxed">
                Founded by Jim Thomas in 2000, the original pool had 91 entrants and a total prize pool of $1,820.00. That year, it took only 7 weeks to eliminate everyone with the final 27 going out at the same time, splitting the pot and taking home a cool $67.40 each.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-500">Where the Pool is Today</h3>
              <p className="text-lg leading-relaxed">
                Growing through word-of-mouth, the pool has seen as many as 1,187 entries in 2018. In 2023, we reached a new high with 1,332 entries and a record prize pool of $53,280!!!
              </p>
            </div>
          </div>
          
          <p className="text-2xl font-bold text-center text-purple-600 mt-8">
            WE HOPE 2024 WILL BE OUR BIGGEST POOL YET!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;