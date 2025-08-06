import { useState } from 'react';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage({ onStartGame }) {
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
    <div className="bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
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
          className="bg-gray-700 text-white text-center text-lg rounded-full px-6 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
          placeholder="Enter your nickname"
        />
        <button
          onClick={onStartGame}
          className="flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs"
        >
          <PlayCircle className="mr-2 h-6 w-6" /> START
        </button>
      </div>
    </div>
  );
}
