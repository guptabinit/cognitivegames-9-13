import { useState } from 'react';
import { PlayCircle, User, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowToPlay from '../components/HowToPlay';

export default function HomePage({ onStartGame }) {
  const [selectedTab, setSelectedTab] = useState('anonymous');
  const [nickname, setNickname] = useState('CoolNickname');
  const [currentAvatar, setCurrentAvatar] = useState(0);

  const avatars = [
    { name: 'Owl', emoji: '🦉', color: 'bg-purple-600' },
    { name: 'Cat', emoji: '🐱', color: 'bg-yellow-500' },
    { name: 'Dog', emoji: '🐶', color: 'bg-blue-500' },
    { name: 'Rabbit', emoji: '🐰', color: 'bg-pink-500' },
  ];

  const handleNextAvatar = () => {
    setCurrentAvatar((prev) => (prev + 1) % avatars.length);
  };

  const handlePrevAvatar = () => {
    setCurrentAvatar((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-2xl max-w-4xl w-full">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setSelectedTab('anonymous')}
              className={`flex-1 px-4 py-2 text-center rounded-l-full font-semibold transition-colors duration-300 ${
                selectedTab === 'anonymous' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="flex items-center justify-center"><User className="mr-2 h-4 w-4" /> ANONYMOUS</span>
            </button>
            <button
              onClick={() => setSelectedTab('authenticated')}
              className={`flex-1 px-4 py-2 text-center rounded-r-full font-semibold transition-colors duration-300 ${
                selectedTab === 'authenticated' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="flex items-center justify-center"><Users className="mr-2 h-4 w-4" /> AUTHENTICATED</span>
            </button>
          </div>

          {selectedTab === 'anonymous' && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <p className="text-gray-300 text-lg">CHOOSE A CHARACTER AND A NICKNAME</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrevAvatar}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <div className={`p-4 rounded-3xl ${avatars[currentAvatar].color} shadow-lg transition-transform transform scale-110`}>
                  <div className="text-6xl text-white select-none">{avatars[currentAvatar].emoji}</div>
                </div>
                <button
                  onClick={handleNextAvatar}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-gray-700 text-white text-center text-lg rounded-full px-6 py-3 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                placeholder="Enter your nickname"
              />
              <button
                onClick={onStartGame}
                className="flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <PlayCircle className="mr-2 h-6 w-6" /> START
              </button>
            </div>
          )}
        </div>
        <HowToPlay />
      </div>

      <Footer />
    </div>
  );
}
