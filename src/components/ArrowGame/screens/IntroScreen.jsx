import React from 'react';

const IntroScreen = ({ onStart }) => {
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Predict the Next Arrow Test</h2>
      <p className="text-lg text-gray-600 mb-6">
        Welcome to the arrow prediction test. You will be presented with sequences of arrows. 
        Your task is to identify the pattern and select the direction of the <strong>next arrow</strong> in the sequence.
      </p>
      <div className="text-left text-gray-700 mb-8">
        <h3 className="text-xl font-semibold mb-2">Test Overview:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><span className="font-medium">Practice:</span> 3 sample arrow sequences to understand the task.</li>
          <li><span className="font-medium">Screening:</span> 5 items to determine your assessment tier.</li>
          <li><span className="font-medium">Main Assessment:</span> 15 core items, plus 5 additional items based on your screening performance.</li>
        </ul>
        <p className="mt-4">Please respond as accurately and quickly as possible.</p>
      </div>
      <button
        onClick={onStart}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Practice
      </button>
    </div>
  );
};

export default IntroScreen;
