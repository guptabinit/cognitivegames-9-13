import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createAssessmentItems, calculateFinalResults, analyzeErrorType } from './gameUtils';
import LoadingSpinner from './LoadingSpinner';
import IntroScreen from './screens/IntroScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';

// Constants for timing (in milliseconds)
const AGE_9_10_MEDIAN_TIME = 30000; // 30s per item
const AGE_11_13_MEDIAN_TIME = 20000; // 20s per item

// Error types
const ERROR_TYPES = {
  RANDOM: 'Random Selection',
  SYSTEMATIC: 'Systematic Rule Error',
  PARTIAL: 'Partial Pattern',
  BIAS: 'Direction/Position Bias',
  CARELESS: 'Careless Error'
};

const ArrowGame = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro, practice, screening, main, end
  const [assessmentItems, setAssessmentItems] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [ageGroup, setAgeGroup] = useState(null);
  const [medianTime, setMedianTime] = useState(0);
  const startTimeRef = useRef(null);

  // Initialize assessment items
  useEffect(() => {
    setAssessmentItems(createAssessmentItems());
  }, []);

  // Calculate final score based on responses
  const calculateFinalScore = (responses) => {
    const screeningResponses = responses.filter(r => r.phase === 'screening');
    const mainResponses = responses.filter(r => r.phase === 'main');
    
    // Base accuracy score (5-point scale)
    const correctCount = mainResponses.filter(r => r.isCorrect).length;
    let baseScore;
    
    if (correctCount >= 14) baseScore = 5;
    else if (correctCount >= 11) baseScore = 4;
    else if (correctCount >= 8) baseScore = 3;
    else if (correctCount >= 5) baseScore = 2;
    else baseScore = 1;
    
    // Average timing score (5-point scale)
    const timingScores = mainResponses.map(r => r.timingScore || 3);
    const avgTimingScore = timingScores.reduce((a, b) => a + b, 0) / timingScores.length;
    
    // Error penalties
    const errorResponses = mainResponses.filter(r => !r.isCorrect);
    const errorPenalty = errorResponses.reduce((sum, r) => sum + (r.errorPenalty || 0), 0);
    
    // Frequency severity penalty
    let frequencyPenalty;
    if (errorResponses.length <= 2) frequencyPenalty = 1;
    else if (errorResponses.length <= 5) frequencyPenalty = 2;
    else frequencyPenalty = 3;
    
    // Calculate final score (clamped between 1 and 5)
    const rawScore = ((baseScore + avgTimingScore) / 2) - (errorPenalty / errorResponses.length || 0) - frequencyPenalty;
    const finalScore = Math.max(1, Math.min(5, rawScore));
    
    // Determine interpretation
    let interpretation;
    if (finalScore >= 4.5) interpretation = 'Excellent';
    else if (finalScore >= 3.5) interpretation = 'Above Average';
    else if (finalScore >= 2.5) interpretation = 'Average';
    else if (finalScore >= 1.5) interpretation = 'Below Average';
    else interpretation = 'Poor';
    
    return {
      score: finalScore,
      interpretation,
      baseScore,
      avgTimingScore,
      totalErrors: errorResponses.length,
      errorBreakdown: errorResponses.reduce((acc, curr) => {
        acc[curr.errorType] = (acc[curr.errorType] || 0) + 1;
        return acc;
      }, {})
    };
  };

  // Handle completion of a phase
  const handlePhaseCompletion = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (phase === 'practice') {
        setPhase('screening');
        setCurrentItems(assessmentItems.screening);
        setCurrentItemIndex(0);
        setResponses([]);
        startTimeRef.current = Date.now();
      } else if (phase === 'screening') {
        const screeningResponses = responses.filter(r => r.phase === 'screening');
        const correctScreeningCount = screeningResponses.filter(r => r.isCorrect).length;
        
        // Determine tier based on screening results
        let extraItems = [];
        if (correctScreeningCount >= 4) {
          extraItems = assessmentItems.ceiling; // Higher difficulty
        } else if (correctScreeningCount <= 2) {
          extraItems = assessmentItems.floor; // Lower difficulty
        }
        // If exactly 3 correct, no extra items (standard difficulty)

        setCurrentItems([...assessmentItems.core, ...extraItems]);
        setCurrentItemIndex(0);
        setResponses(responses); // Keep screening responses for final analysis
        setPhase('main');
        startTimeRef.current = Date.now();
      } else if (phase === 'main') {
        const finalResults = calculateFinalScore(responses);
        setResults(finalResults);
        setPhase('end');
        
        // Only notify parent component if we have an onComplete handler
        // but don't automatically navigate away
        if (onComplete) {
          // We'll let the ResultsScreen handle navigation via a button
          // instead of automatically calling onComplete
        }
      }
    }, 1000);
  }, [phase, responses, assessmentItems, onComplete, ageGroup]);

  // Move to the next item or phase
  const moveToNextItem = useCallback(() => {
    if (currentItemIndex < currentItems.length - 1) {
      setCurrentItemIndex(prevIndex => prevIndex + 1);
      startTimeRef.current = Date.now();
    } else {
      handlePhaseCompletion();
    }
  }, [currentItemIndex, currentItems.length, handlePhaseCompletion]);

  // Analyze response time score
  const calculateTimingScore = (responseTime, ageGroup) => {
    const median = ageGroup === '9-10' ? AGE_9_10_MEDIAN_TIME : AGE_11_13_MEDIAN_TIME;
    const percentage = (responseTime / median) * 100;
    
    if (percentage <= 50) return 5;
    if (percentage <= 75) return 4;
    if (percentage <= 100) return 3;
    if (percentage <= 125) return 2;
    return 1;
  };

  // Calculate error penalty
  const calculateErrorPenalty = (errorType) => {
    switch(errorType) {
      case ERROR_TYPES.RANDOM: return 3;
      case ERROR_TYPES.SYSTEMATIC: 
      case ERROR_TYPES.PARTIAL:
      case ERROR_TYPES.BIAS: return 2;
      case ERROR_TYPES.CARELESS: return 1;
      default: return 0;
    }
  };

  // Handle user response
  const handleResponse = useCallback((chosenDirection) => {
    if (!currentItems[currentItemIndex]) return;
    
    const responseTime = Date.now() - startTimeRef.current;
    const correctNextArrow = currentItems[currentItemIndex].correctNextArrow;
    const isCorrect = chosenDirection === correctNextArrow;
    
    // Analyze error type if incorrect
    let errorType = null;
    if (!isCorrect) {
      const previousResponses = responses.slice(-3);
      errorType = analyzeErrorType(
        chosenDirection, 
        correctNextArrow, 
        previousResponses,
        currentItems[currentItemIndex].sequence
      );
    }

    const timingScore = calculateTimingScore(responseTime, ageGroup);
    const errorPenalty = isCorrect ? 0 : calculateErrorPenalty(errorType);

    const newResponse = {
      itemId: currentItems[currentItemIndex].id,
      chosenDirection,
      correctNextArrow,
      responseTime,
      isCorrect,
      errorType,
      errorPenalty,
      timingScore,
      phase,
      difficulty: currentItems[currentItemIndex].difficulty
    };

    setResponses(prevResponses => [...prevResponses, newResponse]);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      moveToNextItem();
    }, 500);
  }, [currentItemIndex, currentItems, moveToNextItem, phase, responses, ageGroup]);

  // Start the game
  const startGame = useCallback((selectedAgeGroup) => {
    setAgeGroup(selectedAgeGroup);
    setMedianTime(selectedAgeGroup === '9-10' ? AGE_9_10_MEDIAN_TIME : AGE_11_13_MEDIAN_TIME);
    setPhase('practice');
    setCurrentItems(assessmentItems.practice);
    setCurrentItemIndex(0);
    setResponses([]);
    startTimeRef.current = Date.now();
  }, [assessmentItems]);

  // Restart the game
  const restartGame = useCallback(() => {
    const newAssessmentItems = createAssessmentItems();
    setAssessmentItems(newAssessmentItems);
    setPhase('intro');
    setResults(null);
    
    // If we have an onComplete handler, call it to navigate back to home
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);
  
  // Get player name from URL or use a default
  const getPlayerName = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('player') || 'Guest';
  };

  // Render the current screen based on the game phase
  const renderScreen = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    switch (phase) {
      case 'intro':
        return (
          <div className="bg-gray-800 p-6 sm:p-8 rounded-xl min-h-[450px] flex items-center justify-center text-center">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 flex-grow text-center mb-4">Predict the Next Arrow Test</h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                Select your age group to begin.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => startGame('9-10')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                9 - 10 years
              </button>
              <button onClick={() => startGame('11-13')} className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                11 - 13 years
              </button>
            </div>
          </div>
        );
        
      case 'practice':
      case 'screening':
      case 'main':
        if (currentItems.length === 0 || !currentItems[currentItemIndex]) {
          return <LoadingSpinner />;
        }
        return (
          <GameScreen
            currentItem={currentItems[currentItemIndex]}
            phase={phase}
            currentItemIndex={currentItemIndex}
            totalItems={currentItems.length}
            onArrowClick={handleResponse}
            showHint={phase === 'practice'}
          />
        );
        
      case 'end':
        return (
          <ResultsScreen 
            results={results} 
            onRestart={restartGame} 
            onGoBack={onComplete}
            playerName={getPlayerName()}
          />
        );
        
      default:
        return <p>Unknown phase.</p>;
    }
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-700 flex items-center justify-center">
      {assessmentItems ? renderScreen() : <LoadingSpinner message="Loading game..." />}
    </div>
  );
};

export default ArrowGame;
