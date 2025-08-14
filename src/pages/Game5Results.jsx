import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Clock, Award, AlertCircle } from 'lucide-react';

const Game5Results = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const apiUrl = 'http://localhost/cognative-games/OGgames/backend/getGame5Results.php';
        console.log('Fetching results from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Fetched results:', data);
        setResults(data);
      } catch (err) {
        console.error('Error in fetchResults:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700">No results found. Complete the game to see your results.</p>
        </div>
      </div>
    );
  }

  // Calculate additional metrics
  const accuracy = (results.correct_answers / results.total_questions) * 100;
  const avgResponseTime = results.avg_response_time / 1000; // Convert to seconds

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Game
          </button>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Your Game 5 Results</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Accuracy</h3>
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{accuracy.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {results.correct_answers} out of {results.total_questions} correct
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Avg. Response Time</h3>
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgResponseTime.toFixed(2)}s</p>
            <p className="text-sm text-gray-500 mt-1">
              {avgResponseTime < 3 ? 'Fast!' : avgResponseTime < 6 ? 'Good pace' : 'Take your time'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Performance</h3>
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Practice'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {accuracy >= 80 
                ? 'Outstanding performance!'
                : accuracy >= 60 
                ? 'Good job! Keep improving!'
                : 'Keep practicing to improve!'}
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Analysis</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Accuracy by Emotion</h3>
              <div className="space-y-2">
                {results.emotion_accuracy && Object.entries(results.emotion_accuracy).map(([emotion, acc]) => (
                  <div key={emotion} className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-600">{emotion}</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${acc >= 70 ? 'bg-green-500' : acc >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${acc}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 w-12 text-sm font-medium text-gray-700">{acc}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Response Time by Emotion (seconds)</h3>
              <div className="space-y-2">
                {results.emotion_response_time && Object.entries(results.emotion_response_time).map(([emotion, time]) => (
                  <div key={emotion} className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-600">{emotion}</span>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(100, (time / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 w-12 text-sm font-medium text-gray-700">{(time / 1000).toFixed(2)}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/game5')}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game5Results;
