import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AvatarSelector = ({ avatars, currentAvatar, onPrevAvatar, onNextAvatar }) => {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onPrevAvatar}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <div className={`p-4 rounded-3xl ${avatars[currentAvatar].color} shadow-lg transition-transform transform scale-110`}>
        <div className="text-6xl text-white select-none">{avatars[currentAvatar].emoji}</div>
      </div>
      <button
        onClick={onNextAvatar}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default AvatarSelector;
