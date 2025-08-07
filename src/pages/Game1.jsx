import React, { useState } from 'react';
import ArrowGame from '../components/ArrowGame/ArrowGame';
import { saveGameScore } from '../utils/api';

export default function Game1({ onGoBack, onGameComplete }) {
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameComplete = async (results) => {
    console.log('Game completed with results:', results);
    
    try {
      // Save the score to the database
      await saveGameScore(results.finalScore, {
        // You can pass additional options here like user ID when you implement authentication
        // userId: 1,
        // gameId: 1
      });
      console.log('Score saved successfully');
    } catch (error) {
      console.error('Failed to save score:', error);
      // You can add error handling here (e.g., show a toast notification)
    }

    // Notify parent component if needed
    if (onGameComplete) {
      onGameComplete(results);
    }
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-2xl w-full max-w-6xl">
      <div className="text-center">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-400">Arrow Prediction Game</h1>
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm sm:text-base font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
        
        {!gameStarted ? (
          <div className="bg-gray-700 p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to the Arrow Prediction Test</h2>
            <p className="text-gray-300 mb-6 text-lg">
              Test your pattern recognition skills by predicting the next arrow in the sequence.
              The test includes practice rounds and a main assessment that adapts to your skill level.
            </p>
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <ArrowGame onComplete={handleGameComplete} />
          </div>
        )}
      </div>
    </div>
  );
}
