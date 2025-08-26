import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Game1 from './pages/Game1';
import Game3 from './pages/Game3';
import Game4 from './pages/Game4';
import Game5 from './pages/Game5';
import Game5Results from './pages/Game5Results';
import Game8 from './pages/Game8';
import Game7 from './pages/Game7';
import Game9 from './pages/Game9'; // Import Game9
import Game10 from './pages/Game10'; 
import Game6 from './pages/Game6';
import ArrowGame from './components/ArrowGame/ArrowGame';

// Wrapper component to handle the game state and routing
function GameWrapper() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // This function will be called when the game starts from HomePage
  const handleStartGame = (nickname, avatar, gamePath = '/game1') => {
    setPlayerData({ nickname, avatar });
    setIsGameStarted(true);
    navigate(gamePath);
  };

  // This function will be called when returning to home from Game1
  const handleReturnHome = () => {
    setIsGameStarted(false);
    navigate('/');
  };

  // Handle direct navigation to game routes
  useEffect(() => {
    const gameRoutes = ['/game1', '/game3', '/game5', '/game7', '/game8', '/game9','/game10']; // Added /game9 to the list
    if (gameRoutes.includes(location.pathname) && !isGameStarted) {
      // Set default player data for testing
      setPlayerData({ nickname: 'Test Player', avatar: { emoji: '👤', color: 'bg-blue-500' } });
      setIsGameStarted(true);
    }
  }, [location.pathname, isGameStarted]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8 flex items-center justify-center">
      <Routes>
        <Route path="/" element={
          <HomePage onStartGame={handleStartGame} />
        } />
        <Route path="/game1" element={
          <Game1 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game2" element={
          <ArrowGame onComplete={handleReturnHome} />
        } />
        <Route path="/game3" element={
          <Game3 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game4" element={
          <Game4 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game5" element={
          <Game5 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game5/results" element={
          <Game5Results onGoBack={handleReturnHome} />
        } />
        <Route path="/game8" element={
          <Game8 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game6" element={
          <Game6 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game7" element={
          <Game7 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game9" element={
          <Game9 player={playerData} onGoBack={handleReturnHome} />
        } />
        <Route path="/game10" element={
          <Game10 player={playerData} onGoBack={handleReturnHome} />
        } />
      </Routes>
    </div>
  );
}

// Main App component that wraps everything with Router
export default function App() {
  return (
    <Router>
      <GameWrapper />
    </Router>
  );
}
