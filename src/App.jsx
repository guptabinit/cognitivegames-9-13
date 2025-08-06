import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import Game1 from './pages/Game1';

// Main App component that handles the page state
export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  // This function will be called when the "Start" button is clicked
  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  // Conditionally render either the home page or the game page
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex items-center justify-center">
      {isGameStarted ? (
        <Game1 onGoBack={() => setIsGameStarted(false)} />
      ) : (
        <HomePage onStartGame={handleStartGame} />
      )}
    </div>
  );
}