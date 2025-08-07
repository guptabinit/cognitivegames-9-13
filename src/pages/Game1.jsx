import React from 'react';
export default function Game1({ player, onGoBack }) {
  return (
    <div className="bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-4xl">
      <div className="text-center">
        <div className="flex justify-between items-center mb-6">
          {player && (
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${player.avatar.color} text-2xl`}>
                {player.avatar.emoji}
              </div>
              <span className="text-xl font-medium text-gray-200">{player.nickname}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-emerald-400 flex-grow text-center">Memory Game</h1>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>
        
        <div className="bg-gray-700 p-8 rounded-xl mb-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">Game content will go here</p>
            <p className="text-gray-400">Player: {player?.nickname || 'Guest'}</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onGoBack}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
          
          <button
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            Start Game
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}