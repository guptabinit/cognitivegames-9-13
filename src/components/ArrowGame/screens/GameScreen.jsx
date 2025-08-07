import React from 'react';
import Arrow from '../Arrow';

const GameScreen = ({
  currentItem,
  phase,
  currentItemIndex,
  totalItems,
  onArrowClick,
  showHint
}) => {
  const arrowDirections = ['up', 'down', 'left', 'right'];

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{phase} Phase</h2>
      <p className="text-lg text-gray-700 mb-6">
        Item {currentItemIndex + 1} of {totalItems}
      </p>
      
      <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-8 h-20 md:h-24">
        {currentItem.sequence.map((dir, idx) => (
          <Arrow key={idx} direction={dir} />
        ))}
      </div>
      
      <p className="text-xl font-semibold text-gray-800 mb-6">
        Predict the next arrow in the sequence:
      </p>
      
      <div className="flex justify-center space-x-3 md:space-x-4 mb-8">
        {arrowDirections.map(direction => (
          <button
            key={direction}
            onClick={() => onArrowClick(direction)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-5 md:py-4 md:px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-lg md:text-xl"
            aria-label={`Select ${direction} arrow`}
          >
            <Arrow direction={direction} />
          </button>
        ))}
      </div>
      
      {showHint && (
        <p className="text-sm text-gray-500 mt-4">
          (For practice, the correct next arrow is <Arrow direction={currentItem.correctNextArrow} />. Try to understand the pattern!)
        </p>
      )}
    </div>
  );
};

export default GameScreen;
