import { useState } from 'react';
import HomePage from './pages/HomePage';
import Game1 from './pages/Game1';

// Main App component that handles the page state
export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  // This function will be called when the game starts from HomePage
  const handleStartGame = (nickname, avatar) => {
    setPlayerData({ nickname, avatar });
    setIsGameStarted(true);
  };

  // This function will be called when returning to home from Game1
  const handleReturnHome = () => {
    setIsGameStarted(false);
  };

  // Conditionally render either the home page or the game page
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex items-center justify-center">
      {isGameStarted ? (
        <Game1 player={playerData} onGoBack={handleReturnHome} />
      ) : (
        <HomePage onStartGame={handleStartGame} />
      )}
    </div>
  );
}
