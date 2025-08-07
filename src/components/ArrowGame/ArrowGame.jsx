import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createAssessmentItems, calculateFinalResults } from './gameUtils';
import LoadingSpinner from './LoadingSpinner';
import IntroScreen from './screens/IntroScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';

const ArrowGame = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro'); // intro, practice, screening, main, end
  const [assessmentItems, setAssessmentItems] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const startTimeRef = useRef(null);

  // Initialize assessment items
  useEffect(() => {
    setAssessmentItems(createAssessmentItems());
  }, []);

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
      } else if (phase === 'screening') {
        const screeningResponses = responses;
        const correctScreeningCount = screeningResponses.filter(r => r.isCorrect).length;

        let extraItems = [];
        if (correctScreeningCount >= 4) {
          extraItems = assessmentItems.ceiling;
        } else if (correctScreeningCount <= 2) {
          extraItems = assessmentItems.floor;
        }

        setCurrentItems([...assessmentItems.core, ...extraItems]);
        setCurrentItemIndex(0);
        setResponses([]);
        setPhase('main');
      } else if (phase === 'main') {
        const finalResults = calculateFinalResults(responses);
        setResults(finalResults);
        setPhase('end');
        
        // Notify parent component that the game is complete
        if (onComplete) {
          onComplete(finalResults);
        }
      }
    }, 1000);
  }, [phase, responses, assessmentItems, onComplete]);

  // Move to the next item or phase
  const moveToNextItem = useCallback(() => {
    if (currentItemIndex < currentItems.length - 1) {
      setCurrentItemIndex(prevIndex => prevIndex + 1);
      startTimeRef.current = Date.now();
    } else {
      handlePhaseCompletion();
    }
  }, [currentItemIndex, currentItems.length, handlePhaseCompletion]);

  // Handle user response
  const handleResponse = useCallback((chosenDirection) => {
    if (!currentItems[currentItemIndex]) return;
    
    const responseTime = Date.now() - startTimeRef.current;
    const correctNextArrow = currentItems[currentItemIndex].correctNextArrow;
    const isCorrect = chosenDirection === correctNextArrow;

    const newResponse = {
      itemId: currentItems[currentItemIndex].id,
      chosenDirection,
      correctNextArrow,
      responseTime,
      isCorrect,
      errorType: isCorrect ? null : "Incorrect Prediction",
      errorPenalty: isCorrect ? 0 : 0.5, // Using the constant from gameUtils
    };

    setResponses(prevResponses => [...prevResponses, newResponse]);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      moveToNextItem();
    }, 500);
  }, [currentItemIndex, currentItems, moveToNextItem]);

  // Start the game
  const startGame = useCallback(() => {
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
  }, []);

  // Render the current screen based on the game phase
  const renderScreen = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    switch (phase) {
      case 'intro':
        return <IntroScreen onStart={startGame} />;
        
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
        return <ResultsScreen results={results} onRestart={restartGame} />;
        
      default:
        return <p>Unknown phase.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {assessmentItems ? renderScreen() : <LoadingSpinner message="Loading game..." />}
    </div>
  );
};

export default ArrowGame;
