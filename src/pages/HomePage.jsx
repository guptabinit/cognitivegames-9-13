import { useState } from 'react';
import { 
  PlayCircle, ChevronLeft, ChevronRight, User, Users, Brain, Headphones, 
  Heart, Activity, Eye, Smile, MessageSquare, Zap, Clock, ArrowRight, 
  ArrowLeft, CheckCircle, XCircle, Volume2, VolumeX, ChevronUp, ChevronDown
} from 'lucide-react';
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Game 1: Triads */}
                  <button
                    onClick={() => handleStartGame('/game1')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    <span>Word Triads</span>
                  </button>
                  
                  {/* Game 2: Arrow Game */}
                  <button
                    onClick={() => handleStartGame('/game2')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    <span>Arrow Game</span>
                  </button>
                  
                  {/* Game 3: Memory Span */}
                  <button
                    onClick={() => handleStartGame('/game3')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    <span>Memory Test</span>
                  </button>
                  
                  {/* Game 4: Listening Recall */}
                  <button
                    onClick={() => handleStartGame('/game4')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Headphones className="mr-2 h-5 w-5" />
                    <span>Listening Test</span>
                  </button>
                  
                  {/* Game 5: Emotion Recognition */}
                  <button
                    onClick={() => handleStartGame('/game5')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Smile className="mr-2 h-5 w-5" />
                    <span>Emotion Recognition</span>
                  </button>
                  
                  {/* Game 6: Social Cognition */}
                  <button
                    onClick={() => handleStartGame('/game6')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    <span>Social Cognition</span>
                  </button>
                  
                  {/* Game 7: Emotional Understanding */}
                  <button
                    onClick={() => handleStartGame('/game7')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    <span>Emotional Understanding</span>
                  </button>
                  
                  {/* Game 8: Social & Emotional Context */}
                  <button
                    onClick={() => handleStartGame('/game8')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Activity className="mr-2 h-5 w-5" />
                    <span>Social Context</span>
                  </button>
                  
                  {/* Game 9: Cognitive Assessment */}
                  <button
                    onClick={() => handleStartGame('/game9')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Activity className="mr-2 h-5 w-5" />
                    <span>Cognitive Assessment</span>
                  </button>
                  
                  {/* Game 10: Delayed Gratification */}
                  <button
                    onClick={() => handleStartGame('/game10')}
                    disabled={isLoading}
                    className="flex items-center justify-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    <span>Start Playing</span>
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => window.location.href = '/game1'}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105 mt-4 w-full max-w-sm"
                  >
                    <span>Next: Word Triads</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
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
