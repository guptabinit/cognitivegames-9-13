import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, Clock, Gauge, TrendingUp, TrendingDown, AlertCircle, Award, Star, Smile, Frown, Angry, Meh, SmilePlus, Eye, Check, RefreshCcw, Sliders, X } from 'lucide-react';

// Import all images
import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img3.png';
import img4 from '../assets/img4.png';
import img5 from '../assets/img5.png';
import img6 from '../assets/img6.png';

// The data for questions 1-25
const originalQuestions = [
  // Floor items (high-intensity)
  { id: 1, correctEmotion: 'Happy', intensity: 'high', ageGroup: 'adult' },
  { id: 2, correctEmotion: 'Sad', intensity: 'high', ageGroup: 'adult' },
  { id: 3, correctEmotion: 'Angry', intensity: 'high', ageGroup: 'adult' },
  { id: 4, correctEmotion: 'Fear', intensity: 'high', ageGroup: 'adult' },
  { id: 5, correctEmotion: 'Surprise', intensity: 'high', ageGroup: 'adult' },
  { id: 6, correctEmotion: 'Disgust', intensity: 'high', ageGroup: 'adult' },
  { id: 7, correctEmotion: 'Happy', intensity: 'high', ageGroup: 'child' },
  { id: 8, correctEmotion: 'Sad', intensity: 'high', ageGroup: 'child' },
  { id: 9, correctEmotion: 'Angry', intensity: 'high', ageGroup: 'child' },
  { id: 10, correctEmotion: 'Fear', intensity: 'high', ageGroup: 'child' },

  // Core items (medium-intensity)
  { id: 11, correctEmotion: 'Happy', intensity: 'medium', ageGroup: 'adult' },
  { id: 12, correctEmotion: 'Sad', intensity: 'medium', ageGroup: 'adult' },
  { id: 13, correctEmotion: 'Angry', intensity: 'medium', ageGroup: 'adult' },
  { id: 14, correctEmotion: 'Fear', intensity: 'medium', ageGroup: 'adult' },
  { id: 15, correctEmotion: 'Surprise', intensity: 'medium', ageGroup: 'adult' },
  { id: 16, correctEmotion: 'Disgust', intensity: 'medium', ageGroup: 'adult' },
  { id: 17, correctEmotion: 'Happy', intensity: 'medium', ageGroup: 'adult' },
  { id: 18, correctEmotion: 'Sad', intensity: 'medium', ageGroup: 'adult' },
  { id: 19, correctEmotion: 'Angry', intensity: 'medium', ageGroup: 'adult' },
  { id: 20, correctEmotion: 'Fear', intensity: 'medium', ageGroup: 'adult' },
  { id: 21, correctEmotion: 'Surprise', intensity: 'medium', ageGroup: 'adult' },
  { id: 22, correctEmotion: 'Disgust', intensity: 'medium', ageGroup: 'adult' },
  { id: 23, correctEmotion: 'Happy', intensity: 'medium', ageGroup: 'adult' },
  { id: 24, correctEmotion: 'Sad', intensity: 'medium', ageGroup: 'adult' },
  { id: 25, correctEmotion: 'Angry', intensity: 'medium', ageGroup: 'child' }
];

// Map emotions to their corresponding imported images
const emotionImageMapping = {
  Happy: [img3, img5, img6],
  Sad: [img2],
  Angry: [img4],
  Fear: [img1, img3],
  Surprise: [img2, img4],
  Disgust: [img5, img6],
};

// Map emotion names to their corresponding icons
const emotionIcons = {
  'Happy': Smile,
  'Sad': Frown,
  'Angry': Angry,
  'Fear': Meh,
  'Surprise': SmilePlus,
  'Disgust': Frown
};

const questions = originalQuestions.map((question) => {
  const images = emotionImageMapping[question.correctEmotion];
  if (!images) {
    return { ...question, imageFile: 'img1.png' }; // Default image
  }
  const imageFile = images[question.id % images.length];
  return { ...question, imageFile };
});

// Helper function to calculate scores
const calculateScores = (responses) => {
  // Step 1 - Accuracy Score
  const correctCount = responses.filter(r => r.isCorrect).length;
  let accuracyLikert = 1;
  if (correctCount >= 45) accuracyLikert = 5;
  else if (correctCount >= 38) accuracyLikert = 4;
  else if (correctCount >= 30) accuracyLikert = 3;
  else if (correctCount >= 23) accuracyLikert = 2;

  // Step 2 - Speed Score
  const totalTime = responses.reduce((acc, r) => acc + r.reactionTime, 0);
  const avgTime = totalTime / responses.length;
  let speedLikert = 1;
  if (avgTime < 2) speedLikert = 5;
  else if (avgTime >= 2 && avgTime < 3) speedLikert = 4;
  else if (avgTime >= 3 && avgTime < 5) speedLikert = 3;
  else if (avgTime >= 5 && avgTime < 8) speedLikert = 2;

  // Step 3 - Confidence Calibration Score
  const wellCalibrated = responses.filter(r => 
    (r.confidence > 3 && r.isCorrect) || (r.confidence <= 3 && !r.isCorrect)
  ).length;
  const calibrationPercent = (wellCalibrated / responses.length) * 100;
  let calibrationLikert = 1;
  if (calibrationPercent >= 80) calibrationLikert = 5;
  else if (calibrationPercent >= 65) calibrationLikert = 4;
  else if (calibrationPercent >= 50) calibrationLikert = 3;
  else if (calibrationPercent >= 35) calibrationLikert = 2;

  // Step 4 - Error Pattern Penalties
  let penalties = 0;
  let happySurpriseConfusion = 0;
  let sadFearConfusion = 0;
  let angryDisgustConfusion = 0;
  
  responses.forEach(r => {
    const correct = r.question.correctEmotion;
    const guess = r.emotionGuess;
    if ((correct === 'Happy' && guess === 'Surprise') || (correct === 'Surprise' && guess === 'Happy')) happySurpriseConfusion++;
    if ((correct === 'Sad' && guess === 'Fear') || (correct === 'Fear' && guess === 'Sad')) sadFearConfusion++;
    if ((correct === 'Angry' && guess === 'Disgust') || (correct === 'Disgust' && guess === 'Angry')) angryDisgustConfusion++;
  });

  if (happySurpriseConfusion > 5) penalties += 0.5;
  if (sadFearConfusion > 3) penalties += 0.5;
  if (angryDisgustConfusion > 3) penalties += 0.5;

  const lowIntensityResponses = responses.filter(r => r.question.intensity === 'low');
  const lowIntensityAccuracy = lowIntensityResponses.length > 0 ? (lowIntensityResponses.filter(r => r.isCorrect).length / lowIntensityResponses.length) * 100 : 100;
  if (lowIntensityAccuracy < 30) penalties += 1.0;

  const highIntensityResponses = responses.filter(r => r.question.intensity === 'high');
  const highIntensityAccuracy = highIntensityResponses.length > 0 ? (highIntensityResponses.filter(r => r.isCorrect).length / highIntensityResponses.length) * 100 : 100;
  if (highIntensityAccuracy < 70) penalties += 0.5;

  const childResponses = responses.filter(r => r.question.ageGroup === 'child');
  const adultResponses = responses.filter(r => r.question.ageGroup === 'adult');
  const childAccuracy = childResponses.length > 0 ? (childResponses.filter(r => r.isCorrect).length / childResponses.length) * 100 : 100;
  const adultAccuracy = adultResponses.length > 0 ? (adultResponses.filter(r => r.isCorrect).length / adultResponses.length) * 100 : 100;
  if (Math.abs(childAccuracy - adultAccuracy) > 20) penalties += 0.5;

  // Step 5 - Final Composite Score
  const subtotal = (accuracyLikert * 0.50) + (speedLikert * 0.25) + (calibrationLikert * 0.25);
  const finalScore = subtotal - penalties;

  // Step 6 - Rating Conversion
  let finalRating = 'Poor';
  if (finalScore >= 4.5) finalRating = 'Excellent';
  else if (finalScore >= 3.5) finalRating = 'Above Average';
  else if (finalScore >= 2.5) finalRating = 'Average';
  else if (finalScore >= 1.5) finalRating = 'Below Average';

  return {
    correctCount,
    avgTime,
    accuracyLikert,
    speedLikert,
    calibrationLikert,
    penalties,
    subtotal,
    finalScore,
    finalRating,
    calibrationPercent,
    happySurpriseConfusion,
    sadFearConfusion,
    angryDisgustConfusion,
    lowIntensityAccuracy,
    highIntensityAccuracy,
    ageGroupAccuracyGap: Math.abs(childAccuracy - adultAccuracy)
  };
};

const App = () => {
  const [gameState, setGameState] = useState('intro'); // 'intro', 'playing', 'calculating', 'results'
  const [isSaving, setIsSaving] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [responses, setResponses] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedConfidence, setSelectedConfidence] = useState(null);

  useEffect(() => {
    if (gameState === 'playing') {
      setStartTime(performance.now());
    }
  }, [gameState, currentQuestionIndex]);

  const handleStartGame = () => {
    setResponses([]);
    setCurrentQuestionIndex(0);
    setGameState('playing');
  };

  const saveResults = async (responses, scores) => {
    try {
      setIsSaving(true);
      
      const response = await fetch('http://localhost/cognative-games/OGgames/backend/saveGame5Results.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: {
            nickname: 'Player', // You might want to get this from user input or context
            avatar: 'default.png' // Default avatar
          },
          responses: responses.map(res => ({
            questionId: res.question.id,
            correctEmotion: res.question.correctEmotion,
            selectedEmotion: res.emotionGuess,
            responseTime: Math.round(res.reactionTime * 1000), // Convert to ms
            intensity: res.question.intensity,
            ageGroup: res.question.ageGroup
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save results');
      }

      const result = await response.json();
      console.log('Results saved:', result);
      setGameState('results');
    } catch (error) {
      console.error('Error saving results:', error);
      // Still show results even if save fails
      setGameState('results');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextQuestion = () => {
    // Prevent moving to next question if selections are not made
    if (!selectedEmotion || !selectedConfidence) {
      return;
    }

    const endTime = performance.now();
    const reactionTime = (endTime - startTime) / 1000;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedEmotion === currentQuestion.correctEmotion;

    const newResponse = {
      question: currentQuestion,
      emotionGuess: selectedEmotion,
      confidence: selectedConfidence,
      reactionTime,
      isCorrect,
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Reset selection for next question
    setSelectedEmotion(null);
    setSelectedConfidence(null);

    // Check if we're at the end
    if (currentQuestionIndex >= questions.length - 1) {
      setGameState('calculating');
      setTimeout(() => {
        const scores = calculateScores(updatedResponses);
        setScoreData(scores);
        saveResults(updatedResponses, scores);
      }, 1000);
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  }

  const renderGameScreen = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
    
    return (
      <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Emotion Recognition Task</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xl font-semibold text-gray-700 mb-6">Question {currentQuestionIndex + 1} of 50</p>
        
        {/* Placeholder for the image with a loading state */}
        <div className="relative w-full max-w-sm h-96 bg-gray-100 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
            <img 
                    src={currentQuestion.imageFile}
                    alt="A face showing an emotion"
                    className="w-full h-full object-cover rounded-lg transition-opacity duration-300 animate-fade-in"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/94a3b8/e2e8f0?text=Image+Not+Found'}}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-mono bg-white bg-opacity-70 px-2 py-1 rounded">
                    Intensity: {currentQuestion.intensity} | Age: {currentQuestion.ageGroup}
                </div>
        </div>
        
        <div className="w-full mb-6">
            <p className="text-lg font-bold text-gray-800 mb-2">What emotion do you see?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(emotionIcons).map(([emotion, Icon]) => (
                <button
                    key={emotion}
                    onClick={() => setSelectedEmotion(emotion)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 font-semibold transition-all duration-200
                        ${selectedEmotion === emotion ? 'bg-purple-600 text-white border-purple-800 shadow-md' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                >
                    <Icon size={24} className="text-gray-600" /> {emotion}
                </button>
            ))}
            </div>
        </div>

        <div className="w-full mb-6">
            <p className="text-lg font-bold text-gray-800 mb-2">How confident are you? (1-5)</p>
            <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map(confidence => (
                    <button
                        key={confidence}
                        onClick={() => setSelectedConfidence(confidence)}
                        className={`flex-1 p-3 rounded-lg border-2 font-bold transition-all duration-200
                            ${selectedConfidence === confidence ? 'bg-purple-600 text-white border-purple-800 shadow-md' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                    >
                        {confidence}
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Not sure at all</span>
                <span>Completely certain</span>
            </div>
        </div>
        
        <button
            onClick={handleNextQuestion}
            disabled={!selectedEmotion || !selectedConfidence}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200
                ${selectedEmotion && selectedConfidence ? 'bg-purple-600 hover:bg-purple-700 shadow-lg' : 'bg-gray-400 cursor-not-allowed'}`}
        >
            Next Face
        </button>
      </div>
    );
  };
  
  const renderResultsScreen = () => {
      if (!scoreData) return null;
      
      const {
          correctCount,
          avgTime,
          accuracyLikert,
          speedLikert,
          calibrationLikert,
          penalties,
          subtotal,
          finalScore,
          finalRating,
          calibrationPercent,
          happySurpriseConfusion,
          sadFearConfusion,
          angryDisgustConfusion,
          lowIntensityAccuracy,
          highIntensityAccuracy,
          ageGroupAccuracyGap
      } = scoreData;

      if (isSaving) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg w-full max-w-4xl min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Saving your results...</p>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Emotion Recognition Assessment</h2>
                <div className="flex items-center justify-center gap-4">
                    <span className="px-4 py-2 rounded-full text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500">
                        {finalRating} ({finalScore.toFixed(1)}/5.0)
                    </span>
                    <span className="text-gray-600">
                        {correctCount} out of {responses.length} correct
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                {/* Accuracy Card */}
                <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Check size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Accuracy</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-2xl font-bold">{correctCount}</span>
                            <span className="text-gray-500 ml-1">/ {responses.length}</span>
                        </div>
                        <span className="text-lg font-semibold text-green-600">
                            {Math.round((correctCount / responses.length) * 100)}%
                        </span>
                    </div>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${(correctCount / responses.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Speed Card */}
                <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Clock size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Avg. Time</span>
                    </div>
                    <div className="flex items-end">
                        <span className="text-2xl font-bold">{avgTime.toFixed(1)}</span>
                        <span className="text-gray-500 ml-1">seconds</span>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-1">
                            Speed Rating: <span className="font-semibold">{speedLikert}/5</span>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-2 flex-1 rounded-full ${i < speedLikert ? 'bg-blue-500' : 'bg-gray-200'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calibration Card */}
                <div className="flex flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                            <Gauge size={24} />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Calibration</span>
                    </div>
                    <div className="flex items-end">
                        <span className="text-2xl font-bold">{calibrationPercent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-1">
                            Confidence: <span className="font-semibold">{calibrationLikert}/5</span>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-2 flex-1 rounded-full ${i < calibrationLikert ? 'bg-yellow-500' : 'bg-gray-200'}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="w-full mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Detailed Performance Analysis</h3>
                
                <div className="space-y-6">
                    {/* Accuracy Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Target size={20} />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">Accuracy Breakdown</h4>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                {accuracyLikert}/5
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Correct Answers</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{correctCount}</span>
                                    <span className="text-gray-500 mb-1">out of {responses.length}</span>
                                </div>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-green-500 rounded-full" 
                                        style={{ width: `${(correctCount / responses.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Accuracy Rating</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={20} 
                                                className={i < accuracyLikert ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                                fill={i < accuracyLikert ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {['Poor', 'Below Average', 'Average', 'Good', 'Excellent'][accuracyLikert - 1]}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {accuracyLikert >= 4 ? 'Great job! ' : accuracyLikert >= 3 ? 'Good work! ' : 'Keep practicing! '}
                                    {Math.round((correctCount / responses.length) * 100)}% of your answers were correct.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Speed Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Clock size={20} />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">Reaction Time</h4>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                {speedLikert}/5
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Average Time per Question</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-bold text-gray-900">{avgTime.toFixed(1)}</span>
                                    <span className="text-gray-500 mb-1">seconds</span>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Fast</span>
                                        <span>Slow</span>
                                    </div>
                                    <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-white bg-opacity-30 border-r-2 border-white"
                                            style={{ 
                                                left: `${Math.min(avgTime / 10 * 100, 100)}%`,
                                                position: 'relative'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0s</span>
                                        <span>5s</span>
                                        <span>10s</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Speed Rating</p>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-4 h-4 rounded-full ${i < speedLikert ? 'bg-blue-500' : 'bg-gray-200'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {speedLikert >= 4 ? 'Excellent! ' : speedLikert >= 3 ? 'Good! ' : 'You can improve! '}
                                    {speedLikert >= 4 ? 'Your response time is very fast.' : speedLikert >= 3 ? 'Your response time is good.' : 'Try to respond more quickly while maintaining accuracy.'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Calibration Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                    <Gauge size={20} />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">Confidence Calibration</h4>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                {calibrationLikert}/5
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Calibration Score</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{calibrationPercent.toFixed(1)}</span>
                                    <span className="text-gray-500 mb-1">% calibrated</span>
                                </div>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-500 rounded-full" 
                                        style={{ width: `${calibrationPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {calibrationLikert >= 4 ? 'Excellent! ' : calibrationLikert >= 3 ? 'Good! ' : 'Needs work! '}
                                    {calibrationLikert >= 4 ? 'You have great self-awareness of your knowledge.' : calibrationLikert >= 3 ? 'You have good self-awareness of your knowledge.' : 'Try to better understand your confidence levels.'}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Calibration Rating</p>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'].map((label, i) => (
                                            <div 
                                                key={i} 
                                                className={`text-xs px-2 py-1 rounded-full mr-1 ${i + 1 === calibrationLikert ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {calibrationLikert >= 4 ? 'Your confidence matches your accuracy well.' : calibrationLikert >= 3 ? 'Your confidence is somewhat aligned with your accuracy.' : 'Your confidence doesn\'t always match your actual knowledge.'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Penalties Section */}
                    {penalties > 0 && (
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <AlertCircle size={20} />
                                </div>
                                <h4 className="text-lg font-semibold text-red-800">Areas for Improvement</h4>
                                <span className="ml-auto px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                                    -{penalties.toFixed(2)} points
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {happySurpriseConfusion > 5 && (
                                    <div className="flex items-center gap-3">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">
                                            Confused Happy and Surprise {happySurpriseConfusion} times (-0.5)
                                        </p>
                                    </div>
                                )}
                                {sadFearConfusion > 3 && (
                                    <div className="flex items-center gap-3">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">
                                            Confused Sad and Fear {sadFearConfusion} times (-0.5)
                                        </p>
                                    </div>
                                )}
                                {angryDisgustConfusion > 3 && (
                                    <div className="flex items-center gap-3">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">
                                            Confused Angry and Disgust {angryDisgustConfusion} times (-0.5)
                                        </p>
                                    </div>
                                )}
                                {lowIntensityAccuracy < 30 && (
                                    <div className="flex items-center gap-3">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">
                                            Low-intensity accuracy below 30% (-1.0)
                                        </p>
                                    </div>
                                )}
                                {highIntensityAccuracy < 70 && (
                                    <div className="flex items-center gap-3">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">
                                            High-intensity accuracy below 70% (-0.5)
                                        </p>
                                    </div>
                                )}
                                {ageGroupAccuracyGap > 20 && (
                                    <div className="flex items-center gap-3">
                                        <X size={16} className="text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">
                                            Large accuracy gap between age groups (-0.5)
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 p-3 bg-white rounded-lg border border-red-100">
                                <p className="text-sm font-medium text-gray-800 mb-1">Tip for improvement:</p>
                                <p className="text-xs text-gray-600">
                                    Focus on the specific areas where you lost points. Practice with our training modules to improve your emotion recognition skills.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-purple-200 rounded-lg flex items-center justify-between mt-6">
                        <div className="flex items-center gap-4">
                            <RefreshCcw size={24} className="text-purple-800" />
                            <p className="font-bold text-gray-900 text-lg">Final Composite Score</p>
                        </div>
                        <span className="text-2xl font-extrabold text-purple-800">{finalScore.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <p>Happy-Surprise Confusions: <span className="font-semibold">{scoreData.happySurpriseConfusion}</span></p>
                <p>Sad-Fear Confusions: <span className="font-semibold">{scoreData.sadFearConfusion}</span></p>
                <p>Angry-Disgust Confusions: <span className="font-semibold">{scoreData.angryDisgustConfusion}</span></p>
                <p>Low Intensity Accuracy: <span className="font-semibold">{(scoreData.lowIntensityAccuracy * 100).toFixed(1)}%</span></p>
                <p>High Intensity Accuracy: <span className="font-semibold">{(scoreData.highIntensityAccuracy * 100).toFixed(1)}%</span></p>
                <p>Final Score: <span className="font-bold text-3xl text-purple-600">{scoreData.finalScore}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200"
                >
                    Start Over
                </button>
            </div>
        </div>
      );
  };

  const renderIntroScreen = () => (
    <div className="flex flex-col items-center p-8 bg-gray-700 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-xl text-center animate-fade-in border border-slate-700">
      <h1 className="text-4xl font-extrabold text-[#02c082] mb-4">Emotion Recognition Activity</h1>
      <p className="text-lg text-gray-300 mb-6">
        This game measures your ability to recognize emotions and your confidence in doing so.
        You will be shown 50 faces, one at a time.
      </p>
      <div className="w-full text-left bg-slate-700/50 p-4 rounded-lg mb-6 border border-slate-600">
        <h3 className="text-xl font-bold text-[#02c082] mb-2">How It Works:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>For each of the 50 faces, select the emotion you see.</li>
          <li>Rate your confidence from 1 ("not sure at all") to 5 ("completely certain").</li>
          <li>Your accuracy, speed, and confidence calibration will be scored.</li>
        </ul>
      </div>
      <button
        onClick={handleStartGame}
        className="px-8 py-4 bg-[#02c082] text-slate-900 font-bold rounded-full text-xl shadow-lg hover:bg-[#03a06c] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        Start Activity
      </button>
    </div>
  );
  
  
  const renderCalculatingScreen = () => {
    // Provide a default value if scoreData or finalRating is not available
    const finalRating = scoreData?.finalRating || 'Calculating...';
    
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg w-full max-w-xl text-center min-h-[300px]">
        <RefreshCcw size={64} className="animate-spin text-purple-600 mb-4" />
        <p className="text-2xl font-bold text-gray-800">{finalRating}</p>
        <p className="text-lg text-gray-600 mt-2">Calculating your scores...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="w-full flex items-center justify-center ">
        {gameState === 'intro' && renderIntroScreen()}
        {gameState === 'playing' && renderGameScreen()}
        {gameState === 'calculating' && renderCalculatingScreen()}
        {gameState === 'results' && renderResultsScreen()}
      </div>
    </div>
  );
};

export default App;
