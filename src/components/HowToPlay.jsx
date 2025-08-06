import React from 'react';
import { PenTool } from 'lucide-react';

const HowToPlay = () => {
  return (
    <div className="bg-gray-700 p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <PenTool className="mr-2 h-5 w-5 text-emerald-400" /> HOW TO PLAY
      </h3>
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start">
          <span className="text-emerald-400 mr-2">1.</span>
          <span>Choose an avatar and enter a nickname</span>
        </li>
        <li className="flex items-start">
          <span className="text-emerald-400 mr-2">2.</span>
          <span>Click "START" to begin the game</span>
        </li>
        <li className="flex items-start">
          <span className="text-emerald-400 mr-2">3.</span>
          <span>Draw the given word or guess what others are drawing</span>
        </li>
        <li className="flex items-start">
          <span className="text-emerald-400 mr-2">4.</span>
          <span>Earn points for correct guesses and good drawings</span>
        </li>
      </ul>
      <div className="mt-6 pt-4 border-t border-gray-600">
        <p className="text-sm text-gray-400">
          <span className="font-semibold text-emerald-400">Tip:</span> Be creative with your drawings and quick with your guesses!
        </p>
      </div>
    </div>
  );
};

export default HowToPlay;
