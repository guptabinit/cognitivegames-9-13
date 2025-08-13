import React, { useEffect, useState, useMemo } from 'react';

const ResultsScreen = ({ results, onRestart, onGoBack, playerName = 'Guest' }) => {
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    const saveResults = async () => {
      if (!results || saveStatus.loading || saveStatus.success) return;
      
      setSaveStatus({ loading: true, error: null, success: false });
      
      try {
        const response = await fetch('http://localhost/OGgames/backend/saveResults.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameType: 'arrow_game',
            playerName,
            results: {
              ...results,
              // Ensure all required fields are included
              score: results.score || 0,
              interpretation: results.interpretation || 'Not Available',
              baseScore: results.baseScore || 0,
              avgTimingScore: results.avgTimingScore || 0,
              totalErrors: results.totalErrors || 0,
              errorBreakdown: results.errorBreakdown || {}
            }
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save results');
        }
        
        setSaveStatus({ loading: false, error: null, success: true });
      } catch (error) {
        console.error('Error saving results:', error);
        setSaveStatus({ 
          loading: false, 
          error: error.message || 'Failed to save results. Please try again.',
          success: false 
        });
      }
    };
    
    saveResults();
  }, [results, playerName]);
  // Calculate final score breakdown
  const scoreBreakdown = useMemo(() => {
    if (!results) return null;
    
    const baseScore = results.baseScore || 0;
    const timingScore = results.avgTimingScore || 0;
    const totalErrors = results.totalErrors || 0;
    const errorResponses = results.errorResponses || [];
    
    // Calculate average error penalty
    const errorPenalties = errorResponses.map(r => r.errorPenalty || 0);
    const meanErrorPenalty = errorPenalties.length > 0 
      ? errorPenalties.reduce((sum, penalty) => sum + penalty, 0) / errorPenalties.length 
      : 0;
    
    // Calculate frequency severity penalty
    let frequencySeverityPenalty;
    if (totalErrors <= 2) frequencySeverityPenalty = 1;
    else if (totalErrors <= 5) frequencySeverityPenalty = 2;
    else frequencySeverityPenalty = 3;
    
    // Calculate final score using the formula
    const averageScore = (baseScore + timingScore) / 2;
    const finalScore = Math.max(1, Math.min(5, 
      averageScore - meanErrorPenalty - frequencySeverityPenalty
    ));
    
    return {
      baseScore: baseScore.toFixed(1),
      timingScore: timingScore.toFixed(1),
      averageScore: averageScore.toFixed(1),
      meanErrorPenalty: meanErrorPenalty.toFixed(1),
      frequencySeverityPenalty,
      finalScore: finalScore.toFixed(1),
      interpretation: results.interpretation || 'Not Available'
    };
  }, [results]);

  if (!results || !scoreBreakdown) return null;

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md w-full max-w-3xl">
      <h2 className="text-3xl font-bold text-black mb-4">Assessment Complete!</h2>
      <p className="text-xl text-black mb-8">Thank you for participating.</p>

      <div className="text-left space-y-4">
        <h3 className="text-2xl font-bold text-black border-b pb-2 mb-4">Your Results:</h3>
        
        {/* Final Score Card */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-semibold text-black">Final Score</h4>
              <p className="text-4xl font-bold text-blue-600">{scoreBreakdown.finalScore} <span className="text-lg text-black">/ 5.0</span></p>
              <p className="text-lg text-black mt-1">
                <span className="font-medium">Interpretation:</span> {scoreBreakdown.interpretation}
              </p>
            </div>
          </div>
        </div>
        
        {/* Scoring Breakdown */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
          <h4 className="text-xl font-semibold text-black mb-3">Scoring Breakdown</h4>
          
          {/* Base Score */}
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Base Accuracy Score</span>
              <span className="font-medium text-black">{scoreBreakdown.baseScore} / 5.0</span>
            </div>
          </div>
          
          {/* Timing Score */}
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Timing Score</span>
              <span className="font-medium text-black">{scoreBreakdown.timingScore} / 5.0</span>
            </div>
          </div>
          
          {/* Average Score */}
          <div className="border-t border-gray-200 my-3 pt-2">
            <div className="flex justify-between font-medium text-black">
              <span>Average Score (Base + Timing) / 2</span>
              <span>{scoreBreakdown.averageScore}</span>
            </div>
          </div>
          
          {/* Penalties */}
          <div className="border-t border-gray-200 mt-4 pt-3">
            <h5 className="font-medium text-black mb-2">Penalties</h5>
            
            <div className="mb-1">
              <div className="flex justify-between">
                <span>Mean Error Penalty</span>
                <span className="text-red-600">-{scoreBreakdown.meanErrorPenalty}</span>
              </div>
            </div>
            
            <div className="mb-1">
              <div className="flex justify-between">
                <span>Frequency Severity Penalty</span>
                <span className="text-red-600">-{scoreBreakdown.frequencySeverityPenalty}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-3 pt-2 font-medium">
              <div className="flex justify-between">
                <span>Total Penalties</span>
                <span className="text-red-600">-{(parseFloat(scoreBreakdown.meanErrorPenalty) + scoreBreakdown.frequencySeverityPenalty).toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          {/* Final Calculation */}
          <div className="bg-blue-50 p-3 rounded mt-4 border border-blue-100">
            <div className="text-center">
              <div className="text-sm text-black mb-1">Final Score = </div>
              <div className="text-lg font-medium">
                ({scoreBreakdown.baseScore} + {scoreBreakdown.timingScore})/2 - {scoreBreakdown.meanErrorPenalty} - {scoreBreakdown.frequencySeverityPenalty} = 
                <span className="text-blue-700 font-bold ml-1">{scoreBreakdown.finalScore}/5.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          {/* Error Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold text-black mb-2">Error Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Incorrect Predictions:</span>
                <span className="font-medium text-black">{results.totalErrors || 0}</span>
              </div>
              
              {results.errorBreakdown && Object.keys(results.errorBreakdown).length > 0 && (
                <div>
                  <div className="font-medium text-black mb-1">Error Type Distribution:</div>
                  <div className="space-y-1">
                    {Object.entries(results.errorBreakdown).map(([errorType, count]) => (
                      <div key={errorType} className="flex justify-between">
                        <span>{errorType}:</span>
                        <span className="font-medium text-black">{count} {count === 1 ? 'time' : 'times'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {results.errorResponses && results.errorResponses.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-black mb-1">Error Penalties:</div>
                  <div className="space-y-1">
                    {results.errorResponses.map((error, index) => (
                      <div key={index} className="text-sm text-black">
                        Question {error.questionNumber}: 
                        <span className="font-medium text-black">{error.errorType}</span> 
                        <span className="text-red-600 ml-2">(-{error.errorPenalty || 0})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold text-black mb-2">Penalty Analysis:</h4>
            <ul className="list-disc list-inside text-black space-y-1">
              <li>Frequency Severity Penalty: {results.frequencySeverity}</li>
            </ul>
          </div>
        </div>

        <p className="text-md text-black mt-8">
          <span className="font-semibold">Diagnostic Insights:</span> This report highlights your performance across accuracy, timing, and the frequency of incorrect predictions.
        </p>
      </div>
      
      {/* Save status message */}
      {saveStatus.loading && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded">
          Saving your results...
        </div>
      )}
      {saveStatus.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {saveStatus.error}
        </div>
      )}
      {saveStatus.success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          Results saved successfully!
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <button
          onClick={onRestart}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start New Assessment
        </button>
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;