import React from 'react';

export default function Game1({ onGoBack }) {
  return (
    <div className="bg-gray-800 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-4xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-emerald-400 mb-4">Game 1</h1>
        <p className="text-gray-300 mb-6">Game content will go here</p>
        
        <div className="bg-gray-700 p-6 rounded-xl mb-6">
          <p className="text-white text-lg">Game area will be here</p>
        </div>
        
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
