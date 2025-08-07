import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import Game1 from './pages/Game1';
import Header from './components/Header';

// Main App component that handles the page state
export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [finalScore, setFinalScore] = useState(undefined);

  // This function will be called when the "Start" button is clicked
  const handleStartGame = () => {
    setFinalScore(undefined); // Reset score when starting a new game
    setIsGameStarted(true);
  };

  // Handle game completion
  const handleGameComplete = (results) => {
    setFinalScore(results.finalScore);
  };

  // Conditionally render either the home page or the game page
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header finalScore={finalScore} />
      <div className="container mx-auto p-4 sm:p-8 flex items-center justify-center">
        {isGameStarted ? (
          <Game1 
            onGoBack={() => setIsGameStarted(false)}
            onGameComplete={handleGameComplete}
          />
        ) : (
          <HomePage onStartGame={handleStartGame} />
        )}
      </div>
    </div>
  );
}