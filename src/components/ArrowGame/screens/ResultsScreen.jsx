import React from 'react';

const ResultsScreen = ({ results, onRestart }) => {
  if (!results) return null;

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md w-full max-w-3xl">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">Assessment Complete!</h2>
      <p className="text-xl text-gray-700 mb-8">Thank you for participating.</p>

      <div className="text-left space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Your Results:</h3>
        <p className="text-lg"><span className="font-semibold">Final Score:</span> {results.finalScore} / 5.0</p>
        <p className="text-lg"><span className="font-semibold">Interpretation:</span> {results.interpretation}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Performance Metrics:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Base Accuracy Score: {results.baseAccuracy}</li>
              <li>Timing Score: {results.timingScore.toFixed(2)}</li>
              <li>Total Items Attempted: {results.totalItems}</li>
              <li>Total Incorrect Predictions: {results.totalErrors}</li>
              <li>Average Response Time: {(results.averageResponseTime / 1000).toFixed(2)} seconds</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Penalty Analysis:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Frequency Severity Penalty: {results.frequencySeverity}</li>
            </ul>
          </div>
        </div>

        <p className="text-md text-gray-600 mt-8">
          <span className="font-semibold">Diagnostic Insights:</span> This report highlights your performance across accuracy, timing, and the frequency of incorrect predictions.
        </p>
      </div>
      
      <button
        onClick={onRestart}
        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start New Assessment
      </button>
    </div>
  );
};

export default ResultsScreen;
