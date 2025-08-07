import React, { useState, useEffect, useCallback } from 'react';

// --- HELPER FUNCTION ---
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// --- DATA SETUP ---
const rawTriads = [
    // Taxonomic
    { target: 'Water', categoryChoice: 'Juice', unrelatedChoice: 'Quince', category: 'Beverages' },
    { target: 'Buttermilk', categoryChoice: 'Tea', unrelatedChoice: 'Orange', category: 'Beverages' },
    { target: 'Cookie', categoryChoice: 'Bagel', unrelatedChoice: 'Yoghurt', category: 'Grains' },
    { target: 'Cake', categoryChoice: 'Savoury pastry', unrelatedChoice: 'Green bean', category: 'Grains' },
    { target: 'Pudding', categoryChoice: 'Milk', unrelatedChoice: 'Tea', category: 'Dairy' },
    { target: 'Milk', categoryChoice: 'Yoghurt', unrelatedChoice: 'Mushroom', category: 'Dairy' },
    { target: 'Watermelon', categoryChoice: 'Orange', unrelatedChoice: 'Chips', category: 'Fruits' },
    { target: 'Plum', categoryChoice: 'Banana', unrelatedChoice: 'Savoury pastry', category: 'Fruits' },
    { target: 'Fish', categoryChoice: 'Kebab', unrelatedChoice: 'Cherry', category: 'Meats' },
    { target: 'Chicken', categoryChoice: 'Sausage', unrelatedChoice: 'Cheese', category: 'Meats' },
    { target: 'Green bean', categoryChoice: 'Tomato', unrelatedChoice: 'Egg', category: 'Vegetables' },
    { target: 'Green Pepper', categoryChoice: 'Eggplant', unrelatedChoice: 'Wafer', category: 'Vegetables' },
    // Script
    { target: 'Cheese', categoryChoice: 'Olive', unrelatedChoice: 'Peach', category: 'Breakfast Foods' },
    { target: 'Sausage', categoryChoice: 'Egg', unrelatedChoice: 'Rice', category: 'Breakfast Foods' },
    { target: 'Meatball', categoryChoice: 'Macaroni', unrelatedChoice: 'Cake', category: 'Lunch and Dinner' },
    { target: 'Rice', categoryChoice: 'Meatball', unrelatedChoice: 'Chocolate', category: 'Lunch and Dinner' },
    { target: 'Soda pop', categoryChoice: 'Biscuit', unrelatedChoice: 'Eggplant', category: 'Birthday Foods' },
    { target: 'Cake', categoryChoice: 'Cola', unrelatedChoice: 'Cucumber', category: 'Birthday Foods' },
    { target: 'Wafer', categoryChoice: 'Ice-cream', unrelatedChoice: 'Chicken', category: 'Snacks' },
    { target: 'Chocolate', categoryChoice: 'Chips', unrelatedChoice: 'Yoghurt', category: 'Snacks' },
    // Evaluative
    { target: 'Grapes', categoryChoice: 'Spinach', unrelatedChoice: 'Candy', category: 'Healthy Foods' },
    { target: 'Buttermilk', categoryChoice: 'Apple', unrelatedChoice: 'Chips', category: 'Healthy Foods' },
    { target: 'Fish', categoryChoice: 'Strawberry', unrelatedChoice: 'Wafer', category: 'Healthy Foods' },
    { target: 'Egg', categoryChoice: 'Watermelon', unrelatedChoice: 'Chocolate', category: 'Healthy Foods' },
    { target: 'Wafer', categoryChoice: 'Chips', unrelatedChoice: 'Orange', category: 'Junk Foods' },
    { target: 'Chocolate', categoryChoice: 'Candy', unrelatedChoice: 'Banana', category: 'Junk Foods' },
    { target: 'Soft Candy', categoryChoice: 'Soda pop', unrelatedChoice: 'Milk', category: 'Junk Foods' },
    { target: 'Cola', categoryChoice: 'Sweet', unrelatedChoice: 'Pear', category: 'Junk Foods' },
    // Cross-Classification
    { target: 'Milk', categoryChoice: 'Pudding (Diary)', unrelatedChoice: 'Watermelon', category: 'Dairy' },
    { target: 'Milk', categoryChoice: 'Olive (Breakfast)', unrelatedChoice: 'Eggplant', category: 'Breakfast' },
    { target: 'Cheese', categoryChoice: 'Buttermilk (Diary)', unrelatedChoice: 'Kola', category: 'Dairy' },
    { target: 'Cheese', categoryChoice: 'Egg (Breakfast)', unrelatedChoice: 'Spinach', category: 'Breakfast' },
    { target: 'Chicken', categoryChoice: 'Fish (Meats)', unrelatedChoice: 'Apple', category: 'Meats' },
    { target: 'Chicken', categoryChoice: 'Rice (Lunch / Dinner)', unrelatedChoice: 'Cake', category: 'Lunch / Dinner' },
    { target: 'Sausage', categoryChoice: 'Meatball (Meats)', unrelatedChoice: 'Ice-cream', category: 'Meats' },
    { target: 'Sausage', categoryChoice: 'Egg (Breakfast)', unrelatedChoice: 'Sweet', category: 'Breakfast' },
];

const processTriads = (triads) => {
  return triads.map((triad, index) => {
    const words = [triad.target, triad.categoryChoice, triad.unrelatedChoice];
    return {
      id: `triad_${index}`,
      words: shuffleArray(words),
      correctWord: triad.unrelatedChoice,
      reasonOptions: [{
        code: 2, // All are categorical
        text: `${triad.unrelatedChoice} is the odd one out because the others are ${triad.category.toLowerCase()}.`
      }],
      correctReasonCode: 2,
      closeMeaningErrorWords: [triad.target, triad.categoryChoice],
    };
  });
};

const allProcessedTriads = shuffleArray(processTriads(rawTriads));

const TRIAD_SETS = {
  practice: allProcessedTriads.slice(0, 2),
  screening: allProcessedTriads.slice(2, 6),
  core: allProcessedTriads.slice(6, 18),
  simplified: allProcessedTriads.slice(18, 22),
  abstract: allProcessedTriads.slice(22, 26),
};


// --- SCORING TABLES ---
const getAccuracyScore = (correctCount) => {
  if (correctCount >= 11) return 5;
  if (correctCount >= 9) return 4;
  if (correctCount >= 7) return 3;
  if (correctCount >= 4) return 2;
  return 1;
};
const getReasoningScore = (avgCode) => {
  if (avgCode >= 2.6) return 5;
  if (avgCode >= 2.1) return 4;
  if (avgCode >= 1.6) return 3;
  if (avgCode >= 1.1) return 2;
  return 1;
};
const getSpeedScore = (avgTime) => {
    if (avgTime <= 5) return 5;
    if (avgTime <= 10) return 4;
    if (avgTime <= 15) return 3;
    if (avgTime <= 20) return 2;
    return 1;
};
const getErrorPatternScore = (closeMeaningErrors) => {
  if (closeMeaningErrors === 0) return 5;
  if (closeMeaningErrors === 1) return 4;
  if (closeMeaningErrors === 2) return 3;
  if (closeMeaningErrors === 3) return 2;
  return 1;
};


// --- MAIN GAME COMPONENT ---
export default function Game1({ player, onGoBack }) {
  const [gameState, setGameState] = useState('age_select'); // age_select, instructions, practice, screening, main, results
  const [playerAgeGroup, setPlayerAgeGroup] = useState(null);
  const [currentTriads, setCurrentTriads] = useState([]);
  const [triadIndex, setTriadIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [screeningResponses, setScreeningResponses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [choiceChangeCount, setChoiceChangeCount] = useState(0);
  const [isWordConfirmed, setIsWordConfirmed] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, correct: false });
  const [difficultyTier, setDifficultyTier] = useState('core');
  const [finalScores, setFinalScores] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showScreeningDetails, setShowScreeningDetails] = useState(false);

  const handleAgeSelect = (ageGroup) => {
      setPlayerAgeGroup(ageGroup);
      setGameState('instructions');
  }

  const startGame = (phase) => {
    setTriadIndex(0);
    if (phase === 'main') {
        setResponses([]);
    } else {
        setScreeningResponses([]);
    }
    setFeedback({ show: false, correct: false });
    setGameState(phase);
    
    if (phase === 'practice') {
      setCurrentTriads(TRIAD_SETS.practice);
    } else if (phase === 'screening') {
      setCurrentTriads(TRIAD_SETS.screening);
    }
  };

  const currentTriad = currentTriads[triadIndex];

  useEffect(() => {
    if (currentTriad) {
      setStartTime(Date.now());
      setSelectedWord(null);
      setChoiceChangeCount(0);
      setIsWordConfirmed(false);
      setFeedback({ show: false, correct: false });
    }
  }, [currentTriad]);

  const handleWordSelect = (word) => {
    if (!isWordConfirmed) {
      if(selectedWord && selectedWord !== word) {
        setChoiceChangeCount(prev => prev + 1);
      }
      setSelectedWord(word);
    }
  };
  
  const handleConfirmWord = () => {
    if (selectedWord) {
      setIsWordConfirmed(true);
    }
  };

  const handleReasonSelect = (reasonCode) => {
    if (!currentTriad || !selectedWord) return;

    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = selectedWord === currentTriad.correctWord;
    const errorType = !isCorrect && currentTriad.closeMeaningErrorWords.includes(selectedWord) ? 'close_meaning' : 'random';

    const newResponse = {
      triadId: currentTriad.id,
      triadData: currentTriad,
      userAnswer: selectedWord,
      choiceChanges: choiceChangeCount,
      isCorrect,
      reasonCode: isCorrect ? currentTriad.correctReasonCode : 1,
      timeTaken,
      errorType: !isCorrect ? errorType : null,
    };
    
    if (gameState === 'screening') {
        setScreeningResponses(prev => [...prev, newResponse]);
    } else {
        setResponses(prev => [...prev, newResponse]);
    }

    if (gameState === 'practice') {
      setFeedback({ show: true, correct: isCorrect });
      setTimeout(() => proceedToNextTriad(), 1500);
    } else {
      proceedToNextTriad();
    }
  };

  const proceedToNextTriad = useCallback(() => {
    if (triadIndex < currentTriads.length - 1) {
      setTriadIndex(prev => prev + 1);
    } else {
      if (gameState === 'practice') {
        startGame('screening');
      } else if (gameState === 'screening') {
        const correctScreeningAnswers = screeningResponses.filter(r => r.isCorrect).length;
        
        if (correctScreeningAnswers >= 3) {
          setDifficultyTier('core_abstract');
        } else {
          setDifficultyTier('core_simplified');
        }
        
        setGameState('main');
      } else if (gameState === 'main') {
        setGameState('results');
      }
    }
  }, [triadIndex, currentTriads.length, gameState, screeningResponses]);

  useEffect(() => {
    if (gameState === 'main') {
      let assessmentTriads = [...TRIAD_SETS.core];
      if (difficultyTier === 'core_simplified') {
        assessmentTriads = [...assessmentTriads, ...TRIAD_SETS.simplified];
      } else if (difficultyTier === 'core_abstract') {
        assessmentTriads = [...assessmentTriads, ...TRIAD_SETS.abstract];
      }
      setCurrentTriads(shuffleArray(assessmentTriads));
      setTriadIndex(0);
      setResponses([]);
    }
  }, [gameState, difficultyTier]);

  // Function to save game results to the backend
  const saveGameResults = useCallback(async (scores) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/saveResults.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: {
            nickname: player?.nickname || 'Guest',
            avatar: player?.avatar?.emoji || '👤',
          },
          ageGroup: playerAgeGroup,
          difficultyTier: difficultyTier,
          responses: responses.map(r => ({
            triadId: r.triadId,
            words: [r.triadData.words[0], r.triadData.words[1], r.triadData.words[2]],
            correctWord: r.triadData.correctWord,
            userAnswer: r.userAnswer,
            isCorrect: r.isCorrect,
            timeTaken: r.timeTaken,
            choiceChanges: r.choiceChanges,
            errorType: r.errorType
          })),
          scores: scores
        }),
      });

      const result = await response.json();
      if (result.status !== 'success') {
        console.error('Failed to save results:', result.message);
      }
      return result;
    } catch (error) {
      console.error('Error saving results:', error);
      return { status: 'error', message: error.message };
    }
  }, [responses, player, playerAgeGroup, difficultyTier]);

  useEffect(() => {
    if (gameState === 'results' && !finalScores) {
      const coreResponses = responses.filter(r => TRIAD_SETS.core.some(ct => ct.id === r.triadId));
      const correctCoreCount = coreResponses.filter(r => r.isCorrect).length;
      const accuracyScore = getAccuracyScore(correctCoreCount);
      const totalReasonCode = responses.reduce((sum, r) => sum + r.reasonCode, 0);
      const avgReasonCode = responses.length > 0 ? totalReasonCode / responses.length : 0;
      const reasoningScore = getReasoningScore(avgReasonCode);
      const totalTime = responses.reduce((sum, r) => sum + r.timeTaken, 0);
      const avgTime = responses.length > 0 ? totalTime / responses.length : 0;
      const speedScore = getSpeedScore(avgTime);
      const closeMeaningErrors = responses.filter(r => r.errorType === 'close_meaning').length;
      const errorPatternScore = getErrorPatternScore(closeMeaningErrors);
      
      const scores = {
        accuracy: { score: accuracyScore, value: `${correctCoreCount}/12` },
        reasoning: { score: reasoningScore, value: `${avgReasonCode.toFixed(1)} avg` },
        speed: { score: speedScore, value: `${avgTime.toFixed(1)}s avg` },
        errorPattern: { score: errorPatternScore, value: `${closeMeaningErrors} close-meaning errors` },
      };
      
      const overallScore = Math.round((scores.accuracy.score + scores.reasoning.score + scores.speed.score + scores.errorPattern.score) / 4);
      scores.overall = { score: overallScore, value: 'Overall Rating' };
      
      // Save results to backend
      saveGameResults(scores).then(() => {
        console.log('Game results saved successfully');
      });
      
      setFinalScores(scores);
    }
  }, [gameState, responses, playerAgeGroup, saveGameResults]);

  const renderAgeSelect = () => (
      <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Select Your Age Group</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              This will help tailor the assessment criteria.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleAgeSelect('9-10')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                9 - 10 years
            </button>
            <button onClick={() => handleAgeSelect('11-13')} className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
                11 - 13 years
            </button>
          </div>
      </div>
  );

  const renderInstructions = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Word Triad Challenge</h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
        In each round, you will see three words. Your task is to tap the word that <strong className="text-emerald-400">doesn't belong</strong>, confirm your choice, and then choose the best reason why.
      </p>
      <button onClick={() => startGame('practice')} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
        Start Practice
      </button>
    </div>
  );

  const renderGame = () => {
    if (!currentTriad) return <div className="text-white">Loading...</div>;

    return (
      <div className="w-full">
        <div className="text-sm text-gray-400 mb-4 text-center">
          {gameState.charAt(0).toUpperCase() + gameState.slice(1)} Round: {triadIndex + 1} / {currentTriads.length}
        </div>
        <div className="mb-6">
          <p className="text-center text-xl text-gray-300 mb-6">Which word doesn't belong?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentTriad.words.map(word => {
              const isSelected = selectedWord === word;
              const baseStyle = "w-full p-6 rounded-xl text-2xl font-bold transition-all duration-200 cursor-pointer text-center shadow-md";
              const selectedStyle = isSelected ? "bg-indigo-600 text-white ring-4 ring-indigo-400 scale-105" : "bg-gray-700 hover:bg-gray-600 text-white";
              const confirmedStyle = isWordConfirmed && !isSelected ? "bg-gray-800 text-gray-500 opacity-60" : "";
              return (
                <button key={word} onClick={() => handleWordSelect(word)} disabled={isWordConfirmed} className={`${baseStyle} ${selectedStyle} ${confirmedStyle}`}>
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {!isWordConfirmed && (
          <div className="mt-8 text-center">
            <button onClick={handleConfirmWord} disabled={!selectedWord} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
              Confirm Answer
            </button>
          </div>
        )}

        {isWordConfirmed && (
          <div className="animate-fade-in mt-8">
            <p className="text-center text-xl text-gray-300 mb-6">Why doesn't <strong className="text-indigo-400">{selectedWord}</strong> belong?</p>
            <div className="space-y-3">
              {currentTriad.reasonOptions.map(reason => (
                <button key={reason.code} onClick={() => handleReasonSelect(reason.code)} className="w-full p-4 rounded-xl text-lg text-left bg-gray-600 hover:bg-emerald-700 text-white transition-colors duration-200">
                  {reason.text}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {feedback.show && (
          <div className={`mt-6 text-center text-2xl font-bold ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>
            {feedback.correct ? 'Correct!' : 'Not quite, let\'s try another.'}
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!finalScores) return <div className="text-white">Calculating scores...</div>;
    
    const ScoreCard = ({ title, score, value }) => (
      <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-gray-400">{value}</p>
        </div>
        <div className="text-4xl font-bold text-emerald-400">{score}</div>
      </div>
    );
    
    const screeningCorrectCount = screeningResponses.filter(r => r.isCorrect).length;
    const screeningOutcomeText = difficultyTier === 'core_abstract' 
        ? `Your score of ${screeningCorrectCount}/4 assigned you to the Core + Abstract set.`
        : `Your score of ${screeningCorrectCount}/4 assigned you to the Core + Simplified set.`;


    return (
      <div className="w-full">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
            <p className="text-gray-400 mb-6">Here's your performance profile for age group: <strong>{playerAgeGroup}</strong></p>
            <div className="bg-gray-800 p-6 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreCard title="Accuracy" score={finalScores.accuracy.score} value={finalScores.accuracy.value} />
              <ScoreCard title="Reasoning Level" score={finalScores.reasoning.score} value={finalScores.reasoning.value} />
              <ScoreCard title="Speed" score={finalScores.speed.score} value={finalScores.speed.value} />
              <ScoreCard title="Error Pattern" score={finalScores.errorPattern.score} value={finalScores.errorPattern.value} />
            </div>
            <div className="bg-indigo-800 p-6 rounded-xl mb-8">
                <ScoreCard title={finalScores.overall.value} score={finalScores.overall.score} value="Based on all metrics" />
            </div>
            <div className="flex justify-center space-x-4 mb-8">
              <button onClick={onGoBack} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300">
                Back to Home
              </button>
              <button onClick={() => setGameState('age_select')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300">
                Play Again
              </button>
            </div>
        </div>

        <div className="space-y-4">
            <div className="text-center">
                <button 
                    onClick={() => setShowScreeningDetails(!showScreeningDetails)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300"
                >
                    {showScreeningDetails ? 'Hide' : 'Show'} Screening Details
                </button>
            </div>
            {showScreeningDetails && (
                 <div className="animate-fade-in bg-gray-800 p-4 rounded-xl">
                    <p className="text-center text-white mb-4">{screeningOutcomeText}</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-4 py-3">#</th>
                                    <th scope="col" className="px-4 py-3">Your Answer</th>
                                    <th scope="col" className="px-4 py-3">Correct Answer</th>
                                    <th scope="col" className="px-4 py-3">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {screeningResponses.map((res, index) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-600">
                                        <td className="px-4 py-4 font-medium text-white">{index + 1}</td>
                                        <td className={`px-4 py-4 font-bold ${res.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{res.userAnswer}</td>
                                        <td className="px-4 py-4 text-gray-300">{res.triadData.correctWord}</td>
                                        <td className="px-4 py-4">{res.isCorrect ? '✅' : '❌'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="text-center">
                <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-300"
                >
                    {showDetails ? 'Hide' : 'Show'} Main Test Details
                </button>
            </div>
            {showDetails && (
                <div className="animate-fade-in bg-gray-800 p-4 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-4 py-3">#</th>
                                    <th scope="col" className="px-4 py-3">Your Answer</th>
                                    <th scope="col" className="px-4 py-3">Correct Answer</th>
                                    <th scope="col" className="px-4 py-3">Result</th>
                                    <th scope="col" className="px-4 py-3">Time</th>
                                    <th scope="col" className="px-4 py-3">Changes</th>
                                    <th scope="col" className="px-4 py-3">Error Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responses.map((res, index) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-600">
                                        <td className="px-4 py-4 font-medium text-white">{index + 1}</td>
                                        <td className={`px-4 py-4 font-bold ${res.isCorrect ? 'text-green-400' : 'text-red-400'}`}>{res.userAnswer}</td>
                                        <td className="px-4 py-4 text-gray-300">{res.triadData.correctWord}</td>
                                        <td className="px-4 py-4">{res.isCorrect ? '✅' : '❌'}</td>
                                        <td className="px-4 py-4">{res.timeTaken.toFixed(1)}s</td>
                                        <td className="px-4 py-4">{res.choiceChanges}</td>
                                        <td className="px-4 py-4 capitalize">{res.errorType ? res.errorType.replace('_', ' ') : '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (gameState) {
      case 'age_select': return renderAgeSelect();
      case 'instructions': return renderInstructions();
      case 'practice':
      case 'screening':
      case 'main': return renderGame();
      case 'results': return renderResults();
      default: return renderAgeSelect();
    }
  };

  return (
    <div className="bg-gray-900 p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        {player && (
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${player.avatar.color} text-2xl`}>
              {player.avatar.emoji}
            </div>
            <span className="text-xl font-medium text-gray-200 hidden sm:block">{player.nickname}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 flex-grow text-center">Verbal Reasoning</h1>
        <div className="w-24 sm:w-32"></div> {/* Spacer for alignment */}
      </div>
      <div className="bg-gray-800 p-6 sm:p-8 rounded-xl min-h-[450px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);
