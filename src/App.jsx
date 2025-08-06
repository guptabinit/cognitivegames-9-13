import React, { useState } from 'react';
import { PlayCircle, User, Users, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';
import AvatarSelector from './components/AvatarSelector'; // Import the new component
import NicknameInput from './components/NicknameInput'; // Import NicknameInput
import StartButton from './components/StartButton'; // Import StartButton

// Main App component that handles the page state
export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  // This function will be called when the "Start" button is clicked
  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  // Conditionally render either the home page or the new page
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex items-center justify-center">
      {isGameStarted ? (
        <NewPage onGoBack={() => setIsGameStarted(false)} />
      ) : (
        <HomePage onStartGame={handleStartGame} />
      )}
    </div>
  );
}

// Component for the "new page" that is displayed after clicking "Start"
const NewPage = ({ onGoBack }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-emerald-400">Welcome to the Game!</h1>
      <p className="text-gray-300 text-lg mb-8">This is the new page after you clicked the start button. You can add your game logic here.</p>
      <button
        onClick={onGoBack}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
      >
        Go Back to Home
      </button>
    </div>
  );
};

// Component for the main home page
const HomePage = ({ onStartGame }) => {
  const [selectedTab, setSelectedTab] = useState('anonymous');
  const [nickname, setNickname] = useState('CoolNickname');
  const [currentAvatar, setCurrentAvatar] = useState(0); // Index for the avatar array

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
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-700">
      </header>
      {/* Main content area */}
     <div className="min-h-screen flex items-center justify-center bg-[#0b1221] px-4">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
    {/* Left/Center column */}
    <div className="md:col-span-3">
      {/* Avatar and Nickname section */}
      {selectedTab === 'anonymous' && (
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <p className="text-gray-300 text-lg">CHOOSE A CHARACTER AND A NICKNAME</p>
          {/* Avatar Selector Component */}
          <AvatarSelector
            avatars={avatars}
            currentAvatar={currentAvatar}
            onPrevAvatar={handlePrevAvatar}
            onNextAvatar={handleNextAvatar}
          />
          {/* Nickname Input Component */}
          <NicknameInput nickname={nickname} setNickname={setNickname} />
          {/* Start Button Component */}
          <StartButton onClick={onStartGame} />
        </div>
      )}
    </div>
  </div>
</div>
      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-500">
        <p>© 2025 Gartic. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
          <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
          <a href="#" className="hover:text-white transition-colors">BLOG</a>
        </div>
      </footer>
    </div>
  );
};