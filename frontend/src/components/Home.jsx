// frontend/src/components/Home.jsx
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with gradient background */}
      <div className="relative bg-gradient-to-br from-nfl-blue to-nfl-purple text-white py-24">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source media="(max-width: 640px)" srcSet="/img-optimized/hero_eyes_small.webp" />
            <source media="(max-width: 1024px)" srcSet="/img-optimized/hero_eyes_medium.webp" />
            <source media="(min-width: 1025px)" srcSet="/img-optimized/hero_eyes_large.webp" />
            <img
              src="/img-optimized/hero_eyes_medium.webp"
              alt="Football player's eyes"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </div>
        {/* Adjusted overlay opacity */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-nfl-white drop-shadow-lg">
              The Jim Thomas <span className="text-nfl-gold">Football Junkie</span> Extravaganza
            </h1>
            <p className="text-2xl sm:text-3xl mb-8 drop-shadow-lg">Think you can outlast 1,300+ football fanatics?</p>
            <p className="text-3xl sm:text-4xl font-bold mb-10 drop-shadow-lg">Prove it or lose your $60 buy-in trying!</p>
            
            {/* Call to Action */}
            <Link 
              to="/register" 
              className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 inline-block mb-8 transform hover:scale-105 hover:shadow-neon"
            >
              Join Now
            </Link>
            
            <p className="text-3xl font-semibold mb-10 drop-shadow-lg">$53,280 Prize Pool Last Year - Let&apos;s Make It Bigger!</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto bg-black bg-opacity-50 p-8 rounded-xl">
              {[
                "Pick one NFL team to win each week.",
                "No spreads, no BS, just straight-up victories.",
                "Use each team only once... or get eliminated trying.",
                "Last Survivor Takes Home the Bacon*",
              ].map((item, index) => (
                <p key={index} className="flex items-center text-left text-lg">
                  <span className="text-nfl-gold mr-3 text-2xl">✓</span> {item}
                </p>
              ))}
            </div>
            
            <p className="text-sm italic mt-6">*Unless you all get knocked out in week 3. Then you split the pot and cry together.</p>
            
            <Link 
              to="/rules" 
              className="bg-nfl-white text-nfl-purple hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-xl transition duration-300 inline-block mt-8 transform hover:scale-105"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      {/* Content sections with light background */}
      <div className="container mx-auto px-4 py-24">
        {/* Blog Preview Banner */}
        <div className="bg-gradient-to-br from-nfl-purple to-nfl-blue text-white p-8 rounded-xl mb-12 shadow-lg transform hover:scale-102 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-nfl-gold opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-nfl-light-blue opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-6 flex-1">
                <h2 className="text-4xl font-extrabold mb-4 text-nfl-gold">Eric&apos;s Corner: The Blog Lives On!</h2>
                <p className="text-xl mb-6 text-nfl-white leading-relaxed">
                  Good news, football junkies! Eric Swartz is still gracing us with his... unique writing style. 
                  Brace yourselves for more questionable takes and grammar adventures!
                </p>
              </div>
              <div className="flex-shrink-0">
                <a 
                  href="https://footballeliminator.godaddysites.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-nfl-gold text-nfl-blue hover:bg-yellow-400 font-bold py-4 px-8 rounded-full text-xl transition duration-300 inline-block transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                >
                  Read Eric&apos;s Blog
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Winner's Circle */}
        <div className="bg-white shadow-lg rounded-xl p-12 mb-24">
          <h2 className="text-4xl sm:text-5xl font-bold mb-10 text-nfl-blue text-center">
            JT Eliminator Winner&apos;s Circle
          </h2>
          <h3 className="text-3xl font-semibold mb-8 text-center text-nfl-purple">Past Champions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div key={year} className="bg-gray-100 rounded-lg p-6 shadow-card hover:shadow-lg transition duration-300">
                <span className="font-bold text-nfl-blue text-xl block mb-2">{year}</span>
                <span className="text-gray-700">{champions}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* About Section */}
        <div className="bg-white shadow-lg rounded-xl p-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-10 text-nfl-blue text-center">
            About the Madness
          </h2>
          
          <div className="space-y-12">
            {[
              {
                title: "The Commissioner",
                content: "Matthew Swartz – Eldest son of the longtime commissioner, Eric Swartz and a disgruntled Chargers fan. Known for speaking out against things he doesn't like, including Dean Spanos and all things Chiefs and Pat Mahomes (aka Kermit the Frog) related.",
                icon: "👑"
              },
              {
                title: "How it All Began",
                content: "Founded by Jim Thomas in 2000, the original pool had 91 entrants and a total prize pool of $1,820.00. That year, it took only 7 weeks to eliminate everyone with the final 27 going out at the same time, splitting the pot and taking home a cool $67.40 each.",
                icon: "🏈"
              },
              {
                title: "Where the Pool is Today",
                content: "Growing through word-of-mouth, the pool has seen as many as 1,187 entries in 2018. In 2023, we reached a new high with 1,332 entries and a record prize pool of $53,280!!!",
                icon: "📈"
              }
            ].map((section, index) => (
              <div key={index} className="flex items-start">
                <span className="text-4xl mr-6">{section.icon}</span>
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-nfl-purple">{section.title}</h3>
                  <p className="text-lg leading-relaxed text-gray-700">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-3xl font-bold text-center text-nfl-blue mt-12 animate-pulse-slow">
            WE HOPE 2024 WILL BE OUR BIGGEST POOL YET!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;