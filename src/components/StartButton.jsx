import React from 'react';
import { PlayCircle } from 'lucide-react';

const StartButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <PlayCircle className="mr-2 h-6 w-6" /> START
    </button>
  );
};

export default StartButton;
