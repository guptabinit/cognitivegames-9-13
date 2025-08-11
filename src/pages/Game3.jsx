import React, { useState, useEffect, useCallback } from 'react';

// --- SCORING LOGIC ---

const getForwardScore = (maxSpan) => {
  if (maxSpan >= 7) return 5;
  if (maxSpan === 6) return 4;
  if (maxSpan === 5) return 3;
  if (maxSpan === 4) return 2;
  return 1;
};

const getBackwardScore = (maxSpan) => {
  if (maxSpan >= 6) return 5;
  if (maxSpan === 5) return 4;
  if (maxSpan === 4) return 3;
  if (maxSpan === 3) return 2;
  return 1;
};

const getSpeedAdjustment = (avgTime) => {
  if (avgTime > 6000) return -1.0;
  if (avgTime > 4000) return -0.5;
  return 0;
};

const getFinalRating = (forwardScore, backwardScore, adjustment) => {
    if ((forwardScore === 5 && backwardScore === 5 && adjustment === 0) || (forwardScore === 5 && backwardScore === 4 && adjustment === 0)) {
        return 5;
    }
    if ((forwardScore === 5 && backwardScore === 4 && adjustment === -0.5) || (forwardScore >= 4 && backwardScore >= 3 && adjustment === 0)) {
        return 4;
    }
    if ((forwardScore >= 4 && backwardScore >= 3 && adjustment < 0) || (forwardScore >= 3 && backwardScore === 3)) {
        return 3;
    }
    if (forwardScore >= 2 && backwardScore >= 1) {
        return 2;
    }
    return 1;
};


// --- MAIN GAME COMPONENT ---
export default function Game3({ player, onGoBack }) {
  const [gameState, setGameState] = useState('instructions'); // instructions, forward_start, forward_play, forward_feedback, break, backward_start, backward_play, backward_feedback, results
  const [sequence, setSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [currentSpan, setCurrentSpan] = useState(2);
  const [attempts, setAttempts] = useState(0);
  const [maxForwardSpan, setMaxForwardSpan] = useState(0);
  const [maxBackwardSpan, setMaxBackwardSpan] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [lastResult, setLastResult] = useState({ correct: false, message: '' });
  const [finalScores, setFinalScores] = useState(null);
  const [allTrials, setAllTrials] = useState([]);

  // Function to generate a new number sequence
  const generateSequence = useCallback((length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 10));
    }
    setSequence(newSequence);
  }, []);

  // Effect to display numbers one by one
  useEffect(() => {
    if (gameState === 'forward_play' || gameState === 'backward_play') {
      if (displayIndex < sequence.length) {
        const timer = setTimeout(() => {
          setDisplayIndex(displayIndex + 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [displayIndex, sequence, gameState]);

  const startPhase = (phase) => {
    setGameState(phase + '_start');
    setCurrentSpan(2);
    setAttempts(0);
  }
  
  const startTrial = () => {
    generateSequence(currentSpan);
    setUserInput('');
    setDisplayIndex(0);
    const currentPhase = gameState.split('_')[0];
    setGameState(currentPhase + '_play');
    setResponseTimes(prev => [...prev, Date.now()]);
  }

  const handleSubmit = () => {
    const phase = gameState.split('_')[0];
    const correctSequence = phase === 'forward' ? sequence.join('') : sequence.slice().reverse().join('');
    const isCorrect = userInput === correctSequence;

    const trialData = {
        phase: phase,
        span: currentSpan,
        sequence: sequence.join(' '),
        expected: correctSequence,
        userAnswer: userInput,
        isCorrect: isCorrect,
        time: (Date.now() - responseTimes[responseTimes.length - 1])
    };
    setAllTrials(prev => [...prev, trialData]);
    
    setLastResult({ correct: isCorrect, message: isCorrect ? "Correct!" : "Incorrect." });
    setGameState(phase + '_feedback');

    if (isCorrect) {
      if(phase === 'forward') setMaxForwardSpan(currentSpan);
      else setMaxBackwardSpan(currentSpan);
      
      setCurrentSpan(prev => prev + 1);
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
    }
  };

  const nextStep = () => {
      const phase = gameState.split('_')[0];
      if (attempts >= 2 || currentSpan > 8) { // End condition
          if (phase === 'forward') {
              setGameState('break');
          } else {
              setGameState('results');
          }
      } else {
          startTrial();
      }
  }

  // Calculate final scores when game ends and save results
  useEffect(() => {
    if (gameState === 'results' && !finalScores) {
        const forwardScore = getForwardScore(maxForwardSpan);
        const backwardScore = getBackwardScore(maxBackwardSpan);
        const validTimes = allTrials.map(t => t.time).filter(t => t > 0);
        const avgTime = validTimes.reduce((a, b) => a + b, 0) / (validTimes.length || 1);
        const speedAdjustment = getSpeedAdjustment(avgTime);
        const finalRating = getFinalRating(forwardScore, backwardScore, speedAdjustment);

        const scores = {
            forward: { score: forwardScore, span: maxForwardSpan },
            backward: { score: backwardScore, span: maxBackwardSpan },
            speed: { adjustment: speedAdjustment, avgTime: (avgTime / 1000).toFixed(2) },
            finalRating: finalRating
        };
        
        setFinalScores(scores);
        
        // Save results to backend
        saveResults(scores);
    }
  }, [gameState, maxForwardSpan, maxBackwardSpan, allTrials, finalScores]);


  const renderInstructions = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Digit Span Test</h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-4">This activity tests your memory. You will see a sequence of numbers, one at a time. Your task is to repeat them back.</p>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">First, you'll repeat them in the <strong className="text-emerald-400">same order</strong> (Forward Span). After a short break, you'll repeat them in <strong className="text-emerald-400">reverse order</strong> (Backward Span).</p>
      <button onClick={() => startPhase('forward')} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105">
        Start Forward Test
      </button>
    </div>
  );
  
  const renderStartScreen = (phase) => (
      <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{phase.charAt(0).toUpperCase() + phase.slice(1)} Digit Span</h2>
          <p className="text-gray-300 text-lg mb-8">Get ready to memorize the sequence. The first sequence has {currentSpan} digits.</p>
          <button onClick={startTrial} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
              Begin
          </button>
      </div>
  );

  const renderPlayScreen = () => (
      <div className="text-center w-full">
          {displayIndex < sequence.length ? (
              <div className="text-8xl font-bold text-white h-24 flex items-center justify-center animate-flash" key={displayIndex}>
                  {sequence[displayIndex]}
              </div>
          ) : (
              <div className="w-full max-w-sm mx-auto">
                  <p className="text-xl text-gray-300 mb-4">Enter the sequence:</p>
                  <input 
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full p-4 text-3xl text-center bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                  />
                  <button onClick={handleSubmit} className="mt-6 w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xl font-semibold shadow-lg">
                      Submit
                  </button>
              </div>
          )}
      </div>
  );
  
  const renderFeedbackScreen = () => (
      <div className="text-center">
          <h2 className={`text-5xl font-bold mb-6 ${lastResult.correct ? 'text-green-400' : 'text-red-400'}`}>{lastResult.message}</h2>
          {!lastResult.correct && <p className="text-xl text-gray-300">Expected: {gameState.startsWith('forward') ? sequence.join('') : sequence.slice().reverse().join('')}</p>}
          <button onClick={nextStep} className="mt-8 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
              Continue
          </button>
      </div>
  );
  
  const renderBreakScreen = () => (
      <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Forward Test Complete!</h2>
          <p className="text-gray-300 text-lg mb-8">Great job. Take a short break. Next, you'll repeat the numbers in reverse order.</p>
          <button onClick={() => startPhase('backward')} className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xl font-semibold shadow-lg">
              Start Backward Test
          </button>
      </div>
  );

  const saveResults = async (scores) => {
    if (!player) {
      console.error('No player data available');
      return;
    }
    
    try {
      const forwardTrials = allTrials.filter(t => t.phase === 'forward');
      const backwardTrials = allTrials.filter(t => t.phase === 'backward');
      
      const gameData = {
        player: {
          nickname: player.nickname,
          avatar: player.avatar.name
        },
        forwardTrials: forwardTrials.map(trial => ({
          spanLength: trial.span,
          sequence: trial.sequence,
          userAnswer: trial.userAnswer,
          isCorrect: trial.isCorrect,
          responseTimeMs: trial.time
        })),
        backwardTrials: backwardTrials.map(trial => ({
          spanLength: trial.span,
          sequence: trial.sequence,
          userAnswer: trial.userAnswer,
          isCorrect: trial.isCorrect,
          responseTimeMs: trial.time
        })),
        processingSpeed: {
          avgResponseTimeMs: parseFloat(scores.speed.avgTime) * 1000,
          adjustmentValue: scores.speed.adjustment
        },
        memoryRating: {
          forwardSpan: scores.forward.span,
          backwardSpan: scores.backward.span,
          forwardScore: scores.forward.score,
          backwardScore: scores.backward.score,
          speedAdjustment: scores.speed.adjustment,
          finalRating: scores.finalRating
        }
      };
      
      // Add gameType to the data
      const dataToSend = {
        ...gameData,
        gameType: 'game3' // Add game type identifier
      };
      
      console.log('Sending game data to server:', JSON.stringify(dataToSend, null, 2));
      
      // Use the unified saveResults.php endpoint with the correct base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/backend';
      const response = await fetch(`${apiBaseUrl}/saveResults.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });
      
      const responseText = await response.text();
      console.log('Server response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Results saved successfully:', result);
      } catch (e) {
        console.error('Failed to parse server response:', e);
        console.log('Raw response:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      return result;
      
    } catch (error) {
      console.error('Error saving results:', {
        message: error.message,
        stack: error.stack,
        data: error.response ? await error.response.text() : 'No response data'
      });
      throw error; // Re-throw to be handled by the caller
    }
  };

  const renderResultsScreen = () => {
      if (!finalScores) return <div className="text-white">Calculating scores...</div>;
      
      return (
          <div className="w-full text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Working Memory Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-emerald-400 mb-2">Forward Span</h3>
                      <p className="text-5xl font-bold text-white">{finalScores.forward.span}</p>
                      <p className="text-gray-400">Score: {finalScores.forward.score} / 5</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-purple-400 mb-2">Backward Span</h3>
                      <p className="text-5xl font-bold text-white">{finalScores.backward.span}</p>
                      <p className="text-gray-400">Score: {finalScores.backward.score} / 5</p>
                  </div>
              </div>
               <div className="bg-gray-800 p-6 rounded-xl mb-8">
                  <h3 className="text-xl font-semibold text-sky-400 mb-2">Processing Speed</h3>
                  <p className="text-2xl font-bold text-white">Avg. Recall: {finalScores.speed.avgTime}s</p>
                  <p className="text-gray-400">Score Adjustment: {finalScores.speed.adjustment}</p>
              </div>
              <div className="bg-indigo-800 p-6 rounded-xl mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-2">Final Working Memory Rating</h3>
                  <p className="text-6xl font-bold text-white">{finalScores.finalRating} <span className="text-4xl text-gray-300">/ 5</span></p>
              </div>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setGameState('instructions')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md">
                    Play Again
                </button>
              </div>
          </div>
      );
  }

  const renderContent = () => {
    switch (gameState) {
      case 'instructions': return renderInstructions();
      case 'forward_start': return renderStartScreen('forward');
      case 'forward_play': return renderPlayScreen();
      case 'forward_feedback': return renderFeedbackScreen();
      case 'break': return renderBreakScreen();
      case 'backward_start': return renderStartScreen('backward');
      case 'backward_play': return renderPlayScreen();
      case 'backward_feedback': return renderFeedbackScreen();
      case 'results': return renderResultsScreen();
      default: return renderInstructions();
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
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 flex-grow text-center">Memory Span Test</h1>
        <div className="w-24 sm:w-32"></div> {/* Spacer for alignment */}
      </div>
      <div className="bg-gray-800 p-6 sm:p-8 rounded-xl min-h-[450px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}

// Add style for the new animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes flash-number {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
  }
  .animate-flash {
    animation: flash-number 1s ease-in-out;
  }
`;
document.head.appendChild(style);
