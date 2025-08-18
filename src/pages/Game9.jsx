import React, { useState, useEffect, useCallback } from 'react';

// The main application component that manages the game state and renders different screens.
const App = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'goNoGo', 'stroop', 'flanker', 'results'
  const [taskData, setTaskData] = useState({
    goNoGo: { goResponses: [], noGoResponses: [] },
    stroop: { congruent: [], incongruent: [] },
    flanker: { congruent: [], incongruent: [] },
  });

  // --- Utility Functions ---
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // --- Scoring Logic ---
  const calculateScores = useCallback(() => {
    // Shared Likert scoring functions based on the user's provided table
    const getAccuracyLikert = (accuracy) => {
      if (accuracy >= 90) return 5;
      if (accuracy >= 80) return 4;
      if (accuracy >= 65) return 3;
      if (accuracy >= 50) return 2;
      return 1;
    };
    
    const getRTLikert = (rt) => {
      if (rt === 0) return 1; // Score as poor if no correct responses were made
      if (rt < 500) return 5;
      if (rt < 600) return 4;
      if (rt < 800) return 3;
      if (rt < 1000) return 2;
      return 1;
    };

    // --- Go/No-Go Scoring ---
    const goGoes = taskData.goNoGo.goResponses;
    const noGoGoes = taskData.goNoGo.noGoResponses;

    const goGoesLength = goGoes.length > 0 ? goGoes.length : 1;
    const noGoGoesLength = noGoGoes.length > 0 ? noGoGoes.length : 1;
    
    const goAccuracy = (goGoes.filter(r => r.correct).length / goGoesLength) * 100;
    const noGoAccuracy = (noGoGoes.filter(r => r.correct).length / noGoGoesLength) * 100;
    
    const goAccuracyLikert = getAccuracyLikert(goAccuracy);
    const noGoAccuracyLikert = getAccuracyLikert(noGoAccuracy);
    
    const commissionErrors = 100 - noGoAccuracy;
    const omissionErrors = 100 - goAccuracy;
    
    const correctGoes = goGoes.filter(r => r.correct);
    const goRTAverage = correctGoes.length > 0 ? correctGoes.reduce((sum, r) => sum + r.rt, 0) / correctGoes.length : 0;
    const goRTLikert = getRTLikert(goRTAverage);
    
    // --- Stroop Scoring ---
    const stroopC = taskData.stroop.congruent;
    const stroopI = taskData.stroop.incongruent;
    const stroopCLength = stroopC.length > 0 ? stroopC.length : 1;
    const stroopILength = stroopI.length > 0 ? stroopI.length : 1;

    const stroopCAcc = (stroopC.filter(r => r.correct).length / stroopCLength) * 100;
    const stroopIAcc = (stroopI.filter(r => r.correct).length / stroopILength) * 100;

    const stroopCAccLikert = getAccuracyLikert(stroopCAcc);
    const stroopIAccLikert = getAccuracyLikert(stroopIAcc);

    const correctStroopC = stroopC.filter(r => r.correct);
    const correctStroopI = stroopI.filter(r => r.correct);
    const stroopC_RT_Avg = correctStroopC.length > 0 ? correctStroopC.reduce((sum, r) => sum + r.rt, 0) / correctStroopC.length : 0;
    const stroopI_RT_Avg = correctStroopI.length > 0 ? correctStroopI.reduce((sum, r) => sum + r.rt, 0) / correctStroopI.length : 0;

    const stroopC_RT_Likert = getRTLikert(stroopC_RT_Avg);
    const stroopI_RT_Likert = getRTLikert(stroopI_RT_Avg);

    // --- Flanker Scoring ---
    const flankerC = taskData.flanker.congruent;
    const flankerI = taskData.flanker.incongruent;
    const flankerCLength = flankerC.length > 0 ? flankerC.length : 1;
    const flankerILength = flankerI.length > 0 ? flankerI.length : 1;

    const flankerCAcc = (flankerC.filter(r => r.correct).length / flankerCLength) * 100;
    const flankerIAcc = (flankerI.filter(r => r.correct).length / flankerILength) * 100;

    const flankerCAccLikert = getAccuracyLikert(flankerCAcc);
    const flankerIAccLikert = getAccuracyLikert(flankerIAcc);

    const correctFlankerC = flankerC.filter(r => r.correct);
    const correctFlankerI = flankerI.filter(r => r.correct);
    const flankerC_RT_Avg = correctFlankerC.length > 0 ? correctFlankerC.reduce((sum, r) => sum + r.rt, 0) / correctFlankerC.length : 0;
    const flankerI_RT_Avg = correctFlankerI.length > 0 ? correctFlankerI.reduce((sum, r) => sum + r.rt, 0) / correctFlankerI.length : 0;

    const flankerC_RT_Likert = getRTLikert(flankerC_RT_Avg);
    const flankerI_RT_Likert = getRTLikert(flankerI_RT_Avg);

    // --- Interference / Conflict Index ---
    const stroopAccuracyCost = stroopCAcc - stroopIAcc;
    const stroopRTCost = stroopI_RT_Avg - stroopC_RT_Avg;
    const flankerAccuracyCost = flankerCAcc - flankerIAcc;
    const flankerRTCost = flankerI_RT_Avg - flankerC_RT_Avg;

    // --- Inhibition Efficiency Score (Composite) ---
    const allLikerts = [
      goAccuracyLikert,
      noGoAccuracyLikert,
      goRTLikert,
      stroopCAccLikert,
      stroopIAccLikert,
      stroopC_RT_Likert,
      stroopI_RT_Likert,
      flankerCAccLikert,
      flankerIAccLikert,
      flankerC_RT_Likert,
      flankerI_RT_Likert
    ];
    const compositeScore = allLikerts.reduce((sum, score) => sum + score, 0) / allLikerts.length;

    let compositeDescriptor = 'Poor';
    if (compositeScore >= 4.5) compositeDescriptor = 'Excellent';
    else if (compositeScore >= 3.5) compositeDescriptor = 'Above Average';
    else if (compositeScore >= 2.5) compositeDescriptor = 'Average';
    else if (compositeScore >= 1.5) compositeDescriptor = 'Below Average';
    
    return {
      goNoGo: {
        goAccuracy, noGoAccuracy,
        goRTAverage,
        goAccuracyLikert, noGoAccuracyLikert, goRTLikert,
        omissionErrors: omissionErrors.toFixed(2),
        commissionErrors: commissionErrors.toFixed(2),
      },
      stroop: {
        stroopCAcc, stroopIAcc,
        stroopC_RT_Avg, stroopI_RT_Avg,
        stroopCAccLikert, stroopIAccLikert,
        stroopC_RT_Likert, stroopI_RT_Likert,
        accuracyCost: stroopAccuracyCost.toFixed(2),
        rtCost: stroopRTCost.toFixed(2),
      },
      flanker: {
        flankerCAcc, flankerIAcc,
        flankerC_RT_Avg, flankerI_RT_Avg,
        flankerCAccLikert, flankerIAccLikert,
        flankerC_RT_Likert, flankerI_RT_Likert,
        accuracyCost: flankerAccuracyCost.toFixed(2),
        rtCost: flankerRTCost.toFixed(2),
      },
      composite: {
        score: compositeScore.toFixed(2),
        descriptor: compositeDescriptor,
      },
    };
  }, [taskData]);

  // --- Screen Components ---
  const StartScreen = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-3xl text-center animate-fade-in border border-slate-700">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#02c082] mb-4">Cognitive Assessment</h1>
      <p className="text-gray-300 mb-6 text-lg">
        This assessment measures your inhibitory control and cognitive flexibility through three tasks.
      </p>
      <ul className="text-left list-disc list-inside space-y-2 mb-8 text-gray-300">
        <li>**Go/No-Go:** Respond to some cues, but resist the urge to respond to others.</li>
        <li>**Stroop:** Name the color of the text, not the word itself.</li>
        <li>**Flanker:** Identify the direction of the middle arrow, ignoring the outer arrows.</li>
      </ul>
      <button
        onClick={() => setGameState('goNoGo')}
        className="px-8 py-4 bg-[#02c082] text-slate-900 font-bold text-xl rounded-full shadow-lg hover:bg-[#03a06c] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        Start Assessment
      </button>
    </div>
  );

  const GoNoGoTask = () => {
    const [trialIndex, setTrialIndex] = useState(0);
    const [isGoTrial, setIsGoTrial] = useState(false);
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
    const [goTrials, setGoTrials] = useState([]);
    const [startTime, setStartTime] = useState(null);

    // Generate trial sequence once
    useEffect(() => {
      const goTrials = new Array(75).fill(true);
      const noGoTrials = new Array(25).fill(false);
      setGoTrials(shuffleArray([...goTrials, ...noGoTrials]));
    }, []);

    // Effect to handle trial progression and game state transition
    useEffect(() => {
      if (trialIndex >= 100) {
        setGameState('stroop');
        return;
      }
      
      setIsGoTrial(goTrials[trialIndex]);
      setStartTime(performance.now());
      setIsAwaitingResponse(true);
      
      // Auto-advance for No-Go trials if no response is given
      if (!goTrials[trialIndex]) {
        const timeout = setTimeout(() => {
          handleNoGoResponse();
        }, 1500);
        return () => clearTimeout(timeout);
      }
    }, [trialIndex, goTrials, setGameState]);

    const handleGoResponse = () => {
      if (isAwaitingResponse) {
        const rt = performance.now() - startTime;
        
        if (isGoTrial) {
          // Correct Go response
          setTaskData(prev => ({
            ...prev,
            goNoGo: {
              ...prev.goNoGo,
              goResponses: [...prev.goNoGo.goResponses, { correct: true, rt }],
            },
          }));
        } else {
          // Incorrect response on a No-Go trial (commission error)
          setTaskData(prev => ({
            ...prev,
            goNoGo: {
              ...prev.goNoGo,
              noGoResponses: [...prev.goNoGo.noGoResponses, { correct: false, rt }],
            },
          }));
        }
        
        setIsAwaitingResponse(false);
        setTrialIndex(prev => prev + 1);
      }
    };

    const handleNoGoResponse = () => {
      if (isAwaitingResponse) {
        // Correct no-response on a No-Go trial
        setTaskData(prev => ({
          ...prev,
          goNoGo: {
            ...prev.goNoGo,
            noGoResponses: [...prev.goNoGo.noGoResponses, { correct: true }],
          },
        }));
        setIsAwaitingResponse(false);
        setTrialIndex(prev => prev + 1);
      }
    };
    
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-3xl text-center animate-fade-in border border-slate-700">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Go/No-Go Task</h2>
        <p className="text-gray-300 mb-8 text-lg">
          Trial {trialIndex + 1} of 100. Press the button for a <span className="text-[#02c082] font-bold">Go</span> trial. Do nothing for a <span className="text-red-500 font-bold">No-Go</span> trial.
        </p>
        <div className="w-40 h-40 md:w-60 md:h-60 bg-gray-600/20 border-4 border-gray-600 rounded-2xl flex items-center justify-center p-4 mb-8 text-center text-5xl font-extrabold text-white">
          {isGoTrial ? 'GO' : 'NO-GO'}
        </div>
        <button
          onClick={handleGoResponse}
          disabled={!isAwaitingResponse}
          className={`px-8 py-4 rounded-full font-bold text-xl shadow-lg transition-all duration-300 ${
            isAwaitingResponse
              ? 'bg-[#02c082] text-slate-900 hover:bg-[#03a06c] transform hover:scale-105 active:scale-95'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Respond
        </button>
      </div>
    );
  };
  
  const StroopTask = () => {
    const [trialIndex, setTrialIndex] = useState(0);
    const [currentTrial, setCurrentTrial] = useState(null);
    const [startTime, setStartTime] = useState(null);

    const colors = ['red', 'blue', 'green', 'yellow'];
    const words = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    
    // Generate trials with a fixed count of 30 congruent and 30 incongruent.
    useEffect(() => {
        let congruentTrials = [];
        let incongruentTrials = [];

        // Generate 30 congruent trials
        for (let i = 0; i < 30; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            congruentTrials.push({ word: color.toUpperCase(), color: color });
        }

        // Generate 30 incongruent trials
        for (let i = 0; i < 30; i++) {
            let color = colors[Math.floor(Math.random() * colors.length)];
            let word;
            do {
                word = words[Math.floor(Math.random() * words.length)];
            } while (word.toLowerCase() === color);
            incongruentTrials.push({ word: word, color: color });
        }
        
        setCurrentTrial(shuffleArray([...congruentTrials, ...incongruentTrials]));
    }, []);

    const handleResponse = (selectedColor) => {
      if (currentTrial && trialIndex < currentTrial.length) {
        const rt = performance.now() - startTime;
        const correct = selectedColor === currentTrial[trialIndex].color;
        
        const response = { correct, rt, trial: currentTrial[trialIndex] };
        
        if (currentTrial[trialIndex].word.toLowerCase() === currentTrial[trialIndex].color) {
          setTaskData(prev => ({
            ...prev,
            stroop: { ...prev.stroop, congruent: [...prev.stroop.congruent, response] }
          }));
        } else {
          setTaskData(prev => ({
            ...prev,
            stroop: { ...prev.stroop, incongruent: [...prev.stroop.incongruent, response] }
          }));
        }

        setTrialIndex(prev => prev + 1);
      }
    };
    
    // Effect to handle trial progression and game state transition
    useEffect(() => {
      if (trialIndex >= 60) {
        setGameState('flanker');
        return;
      }
      setStartTime(performance.now());
    }, [trialIndex, setGameState]);

    if (!currentTrial || trialIndex >= currentTrial.length) {
      return null;
    }

    const trial = currentTrial[trialIndex];

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-3xl text-center animate-fade-in border border-slate-700">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stroop Task</h2>
        <p className="text-gray-300 mb-8 text-lg">
          Trial {trialIndex + 1} of 60. Click the button that matches the <span className="font-bold">ink color</span> of the word.
        </p>
        <div className="w-full text-center mb-8">
          <p className={`text-6xl md:text-8xl font-extrabold`} style={{ color: trial.color }}>
            {trial.word}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleResponse(color)}
              className={`p-4 rounded-full font-bold text-xl shadow-lg transition-all duration-300 text-slate-900 bg-[#02c082] hover:bg-[#03a06c]`}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const FlankerTask = () => {
    const [trialIndex, setTrialIndex] = useState(0);
    const [currentTrial, setCurrentTrial] = useState(null);
    const [startTime, setStartTime] = useState(null);
    
    const directions = ['left', 'right'];

    // Generate trials with a fixed count of 30 congruent and 30 incongruent.
    useEffect(() => {
      const congruent = directions.flatMap(dir =>
        Array(15).fill({ direction: dir, type: 'congruent' })
      );
      const incongruent = directions.flatMap(dir =>
        Array(15).fill({ direction: dir, type: 'incongruent' })
      );
      setCurrentTrial(shuffleArray([...congruent, ...incongruent]));
    }, []);
    
    const handleResponse = (selectedDirection) => {
      if (currentTrial && trialIndex < currentTrial.length) {
        const rt = performance.now() - startTime;
        const correct = selectedDirection === currentTrial[trialIndex].direction;
        
        const response = { correct, rt, trial: currentTrial[trialIndex] };
        
        if (currentTrial[trialIndex].type === 'congruent') {
          setTaskData(prev => ({
            ...prev,
            flanker: { ...prev.flanker, congruent: [...prev.flanker.congruent, response] }
          }));
        } else {
          setTaskData(prev => ({
            ...prev,
            flanker: { ...prev.flanker, incongruent: [...prev.flanker.incongruent, response] }
          }));
        }

        setTrialIndex(prev => prev + 1);
        setStartTime(performance.now());
      }
    };
    
    useEffect(() => {
      if (trialIndex === 60) {
        setGameState('results');
      }
    }, [trialIndex]);

    if (!currentTrial || trialIndex >= currentTrial.length) {
      return null;
    }

    const trial = currentTrial[trialIndex];
    const middleArrow = trial.direction === 'left' ? '←' : '→';
    const outerArrows = trial.direction === 'left' ? '→' : '←';
    const displayArrows = trial.type === 'congruent' ? 
      `${middleArrow}${middleArrow}${middleArrow}${middleArrow}${middleArrow}` :
      `${outerArrows}${outerArrows}${middleArrow}${outerArrows}${outerArrows}`;
      
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-3xl text-center animate-fade-in border border-slate-700">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Flanker Task</h2>
        <p className="text-gray-300 mb-8 text-lg">
          Trial {trialIndex + 1} of 60. Click the button that matches the direction of the <span className="font-bold">middle arrow</span>.
        </p>
        <div className="w-full text-center mb-8">
          <p className="text-6xl md:text-8xl font-mono text-gray-300">
            {displayArrows}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleResponse('left')}
            className="px-8 py-4 bg-[#02c082] text-slate-900 font-bold text-xl rounded-full shadow-lg hover:bg-[#03a06c] transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Left
          </button>
          <button
            onClick={() => handleResponse('right')}
            className="px-8 py-4 bg-[#02c082] text-slate-900 font-bold text-xl rounded-full shadow-lg hover:bg-[#03a06c] transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Right
          </button>
        </div>
      </div>
    );
  };
  
  const ResultsScreen = () => {
    const scores = calculateScores();
    return (
      <div className="flex flex-col items-center p-6 md:p-10 bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-4xl animate-fade-in border border-slate-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#02c082] mb-4">Assessment Complete!</h1>
        <p className="text-xl text-gray-300 mb-8">Here is your detailed score breakdown.</p>
        
        {scores && (
          <div className="w-full">
            <div className="bg-slate-700 p-6 rounded-2xl shadow-inner mb-8 text-center border border-slate-600">
              <h3 className="text-2xl font-bold text-[#02c082] mb-2">Inhibition Efficiency Score</h3>
              <p className="text-5xl font-extrabold text-white">{scores.composite.score}</p>
              <p className="text-2xl mt-2 text-gray-300">
                Rating: <span className="font-extrabold text-[#02c082]">{scores.composite.descriptor}</span>
              </p>
            </div>
            
            <table className="min-w-full bg-slate-800 rounded-xl shadow-lg mb-8 text-left border border-slate-700">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">C/Go Accuracy</th>
                  <th className="py-3 px-4">I/No-Go Accuracy</th>
                  <th className="py-3 px-4">C/Go RT</th>
                  <th className="py-3 px-4">I/No-Go RT</th>
                  <th className="py-3 px-4">Subscores</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 text-gray-300 hover:bg-slate-700">
                  <td className="py-3 px-4 font-bold">Go/No-Go</td>
                  <td className="py-3 px-4">{scores.goNoGo.goAccuracy.toFixed(2)}%</td>
                  <td className="py-3 px-4">{scores.goNoGo.noGoAccuracy.toFixed(2)}%</td>
                  <td className="py-3 px-4">{scores.goNoGo.goRTAverage.toFixed(0)}ms</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">Go Acc: {scores.goNoGo.goAccuracyLikert} | No-Go Acc: {scores.goNoGo.noGoAccuracyLikert} | Go RT: {scores.goNoGo.goRTLikert}</td>
                </tr>
                <tr className="border-b border-gray-700 text-gray-300 hover:bg-slate-700">
                  <td className="py-3 px-4 font-bold">Stroop</td>
                  <td className="py-3 px-4">{scores.stroop.stroopCAcc.toFixed(2)}%</td>
                  <td className="py-3 px-4">{scores.stroop.stroopIAcc.toFixed(2)}%</td>
                  <td className="py-3 px-4">{scores.stroop.stroopC_RT_Avg.toFixed(0)}ms</td>
                  <td className="py-3 px-4">{scores.stroop.stroopI_RT_Avg.toFixed(0)}ms</td>
                  <td className="py-3 px-4">C Acc: {scores.stroop.stroopCAccLikert} | I Acc: {scores.stroop.stroopIAccLikert} | C RT: {scores.stroop.stroopC_RT_Likert} | I RT: {scores.stroop.stroopI_RT_Likert}</td>
                </tr>
                <tr className="hover:bg-slate-700 text-gray-300">
                  <td className="py-3 px-4 font-bold">Flanker</td>
                  <td className="py-3 px-4">{scores.flanker.flankerCAcc.toFixed(2)}%</td>
                  <td className="py-3 px-4">{scores.flanker.flankerIAcc.toFixed(2)}%</td>
                  <td className="py-3 px-4">{scores.flanker.flankerC_RT_Avg.toFixed(0)}ms</td>
                  <td className="py-3 px-4">{scores.flanker.flankerI_RT_Avg.toFixed(0)}ms</td>
                  <td className="py-3 px-4">C Acc: {scores.flanker.flankerCAccLikert} | I Acc: {scores.flanker.flankerIAccLikert} | C RT: {scores.flanker.flankerC_RT_Likert} | I RT: {scores.flanker.flankerI_RT_Likert}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg mt-8 text-left w-full border border-slate-700">
              <h3 className="text-2xl font-bold text-[#02c082] mb-2">Interference / Conflict Index</h3>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold">Stroop:</span> Accuracy Cost: {scores.stroop.accuracyCost}% | RT Cost: {scores.stroop.rtCost}ms
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Flanker:</span> Accuracy Cost: {scores.flanker.accuracyCost}% | RT Cost: {scores.flanker.rtCost}ms
              </p>
            </div>

            <button
              onClick={() => {
                setTaskData({ goNoGo: { goResponses: [], noGoResponses: [] }, stroop: { congruent: [], incongruent: [] }, flanker: { congruent: [], incongruent: [] } });
                setGameState('start');
              }}
              className="mt-8 px-8 py-4 bg-[#02c082] text-slate-900 font-bold text-xl rounded-full shadow-lg hover:bg-[#03a06c] transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Retake Assessment
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a2430] font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {gameState === 'start' && <StartScreen />}
      {gameState === 'goNoGo' && <GoNoGoTask />}
      {gameState === 'stroop' && <StroopTask />}
      {gameState === 'flanker' && <FlankerTask />}
      {gameState === 'results' && <ResultsScreen />}
    </div>
  );
};

export default App;
