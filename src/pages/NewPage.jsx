import { PlayCircle } from 'lucide-react';

export default function NewPage({ onGoBack }) {
  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-emerald-400">Welcome to the Game!</h1>
      <p className="text-gray-300 text-lg mb-8">This is the new page after you clicked the start button. You can add your game logic here.</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onGoBack}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
        >
          Go Back to Home
        </button>
        <button
          onClick={() => alert('Starting the game!')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-105 flex items-center"
        >
          <PlayCircle className="mr-2 h-5 w-5" /> Start Game
        </button>
      </div>
    </div>
  );
}
