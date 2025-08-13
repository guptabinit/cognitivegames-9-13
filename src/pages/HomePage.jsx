import { useState } from 'react';
import { PlayCircle, ChevronLeft, ChevronRight, User, Users, Brain, Headphones } from 'lucide-react';
import Footer from '../components/Footer';
import axios from 'axios';

export default function HomePage({ onStartGame }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleStartGame = async (gamePath) => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store user info in local storage for persistence
      const userData = {
        nickname: nickname.trim(),
        avatar: avatars[currentAvatar]
      };
      
      localStorage.setItem('gameUser', JSON.stringify(userData));
      
      // Call the parent's onStartGame with the user data and game path
      onStartGame(userData.nickname, userData.avatar, gamePath);
    } catch (err) {
      console.error('Error saving user data:', err);
      setError('Failed to save user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
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
              <div className="flex flex-col space-y-4 w-full max-w-sm">
                <button
                  onClick={() => handleStartGame('/game1')}
                  disabled={isLoading}
                  className="flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-6 w-6" />
                      <span>Start Game 1</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleStartGame('/game3')}
                  disabled={isLoading}
                  className="flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <Brain className="mr-2 h-6 w-6" />
                      <span>Start Memory Test</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleStartGame('/game4')}
                  disabled={isLoading}
                  className="flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <Headphones className="mr-2 h-6 w-6" />
                      <span>Start Listening Test</span>
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="text-red-400 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          )}


      <Footer />
      </div>
  );
}
