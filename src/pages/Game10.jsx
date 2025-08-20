import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
  // State variables to manage the game flow and data
  const [screen, setScreen] = useState('welcome');
  const [ageGroup, setAgeGroup] = useState(null);
  const [rewardType, setRewardType] = useState({});
  const [timer, setTimer] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [choice, setChoice] = useState(null); // 'immediate' or 'delayed'
  const [waitDuration, setWaitDuration] = useState(0);
  const [reasoning, setReasoning] = useState('');
  const [score, setScore] = useState(null);
  const [choiceMatrixAnswers, setChoiceMatrixAnswers] = useState({});

  // Configuration based on age group
  const configs = {
    '10-11': {
      waitTime: 180, // 3 minutes in seconds
      smallReward: 'A piece of candy 🍬',
      bigReward: 'A small gift card 💳',
      reasoningQuestions: [
        {
          id: 1,
          question: 'You can have a small toy now, or wait 10 minutes for a bigger, better toy. What do you do?',
          options: ['Take the small toy now', 'Wait for the bigger toy'],
          futureOriented: 'Wait for the bigger toy'
        },
        {
          id: 2,
          question: 'You can get one sticker now, or wait until the end of the day for 5 stickers. What do you do?',
          options: ['Get one sticker now', 'Wait for the 5 stickers'],
          futureOriented: 'Wait for the 5 stickers'
        }
      ],
    },
    '12-13': {
      waitTime: 300, // 5 minutes in seconds
      smallReward: '5 minutes of free time ⏰',
      bigReward: '15 minutes of free time 🎮',
      reasoningQuestions: [
        {
          id: 1,
          question: 'You can go to the movies with friends this weekend, or wait until next month to go to a concert with a band you love. What do you do?',
          options: ['Go to the movies this weekend', 'Wait for the concert next month'],
          futureOriented: 'Wait for the concert next month'
        },
        {
          id: 2,
          question: 'You can spend your entire allowance now on a video game you want, or save half for a bigger game bundle later. What do you do?',
          options: ['Spend it all now', 'Save half for a bigger bundle later'],
          futureOriented: 'Save half for a bigger bundle later'
        }
      ],
    },
  };

  // Timer logic using useEffect
  useEffect(() => {
    if (screen === 'game' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (screen === 'game' && timer === 0) {
      handleDelayedChoice();
    }
  }, [screen, timer]);

  // Handle the start of the game
  const startGame = (age) => {
    setAgeGroup(age);
    setRewardType(configs[age]);
    setTimer(configs[age].waitTime);
    setStartTime(Date.now());
    setScreen('game');
  };

  // Handle the choice to take the immediate reward
  const handleImmediateChoice = () => {
    setChoice('immediate');
    setWaitDuration(Math.floor((Date.now() - startTime) / 1000));
    setScreen('reasoning');
  };

  // Handle the choice to wait for the delayed reward
  const handleDelayedChoice = () => {
    setChoice('delayed');
    setWaitDuration(configs[ageGroup].waitTime);
    setScreen('reasoning');
  };

  // Handle form submission for reasoning
  const handleReasoningSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Choice matrix answers:', choiceMatrixAnswers);
    console.log('Reasoning text:', reasoning);
    
    // Validate that all questions are answered
    const allQuestionsAnswered = configs[ageGroup].reasoningQuestions.every(
      q => choiceMatrixAnswers[q.id] !== undefined
    );
    
    if (!allQuestionsAnswered) {
      console.error('Please answer all questions');
      alert('Please answer all questions before submitting.');
      return;
    }
    
    if (!reasoning.trim()) {
      console.error('Reasoning text is required');
      alert('Please provide your reasoning before submitting.');
      return;
    }
    
    calculateScore();
  };

  // Function to save results to the backend
  const saveResults = async (rawScore, interpretation) => {
    const likertScore = rawScore >= 4 ? 5 : 
                     rawScore >= 3 ? 4 : 
                     rawScore >= 2 ? 3 : 
                     rawScore >= 1 ? 2 : 1;

    try {
      const player = {
        nickname: localStorage.getItem('playerNickname') || 'Anonymous',
        avatar: localStorage.getItem('playerAvatar') || 'default'
      };

      const response = await fetch('/cognative-games/OGgames/backend/saveGame10Results.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          player: player,
          ageGroup: ageGroup,
          choice: choice,
          waitDuration: waitDuration,
          reasoning: reasoning,
          rawScore: rawScore,
          likertScore: likertScore,
          interpretation: interpretation
        }),
      });
      
      const result = await response.json();
      if (result.status !== 'success') {
        console.error('Failed to save results:', result.message);
      }
      return result;
    } catch (error) {
      console.error('Error saving results:', error);
      throw error;
    }
  };

  // Calculate the final score based on the rubric
  const calculateScore = async () => {
    console.log('Calculating score...');
    let rawScore = 0;

    // 1. Initial Choice (1 point for choosing to wait)
    if (choice === 'delayed') {
      rawScore += 1;
    }

    // 2. Wait Duration (1 point for waiting at least 80% of the time)
    const waitPercentage = (waitDuration / configs[ageGroup].waitTime) * 100;
    if (waitPercentage >= 80) {
      rawScore += 1;
    } else if (waitPercentage > 0) {
      rawScore += 0.5;
    }

    // 3. Reasoning Quality (0-2 points)
    const lowerCaseReasoning = reasoning.toLowerCase();
    const futureKeywords = ['better', 'more', 'later', 'worth it', 'benefits', 'future', 'goal', 'plan'];
    const hasFutureReasoning = futureKeywords.some(keyword => lowerCaseReasoning.includes(keyword));

    if (hasFutureReasoning) {
      rawScore += 2;
    } else if (reasoning.length > 5) { // Simple reasoning
      rawScore += 1;
    } else { // Impulsive or no reasoning
      rawScore += 0;
    }

    // 4. Choice Matrix (optional)
    const matrixQuestions = configs[ageGroup].reasoningQuestions;
    matrixQuestions.forEach(q => {
      if (choiceMatrixAnswers[q.id] === q.futureOriented) {
        rawScore += 1;
      }
    });

    const interpretation = getLikertInterpretation(rawScore).interpretation;
    
    try {
      await saveResults(rawScore, interpretation);
      setScore(rawScore);
      setScreen('results');
    } catch (error) {
      console.error('Failed to save results:', error);
      // Show error message to the user
      alert('Failed to save results. Please try again.');
    }
  };

  // Convert raw score to Likert scale and interpretation
  const getLikertInterpretation = (rawScore) => {
    if (rawScore >= 4) return { likert: 5, interpretation: 'Excellent self-control' };
    if (rawScore >= 3) return { likert: 4, interpretation: 'Above Average' };
    if (rawScore >= 2) return { likert: 3, interpretation: 'Average' };
    if (rawScore >= 1) return { likert: 2, interpretation: 'Below Average' };
    return { likert: 1, interpretation: 'Very limited delay ability' };
  };

  // Helper function to render the current screen
  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-slate-800">Delayed Gratification Test</h1>
            <p className="text-md text-slate-600 mb-6">Choose your age group to begin the activity.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => startGame('10-11')}
                className="bg-blue-500 text-black font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                10-11 years
              </button>
              <button
                onClick={() => startGame('12-13')}
                className="bg-purple-500 text-black font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                12-13 years
              </button>
            </div>
          </div>
        );
      case 'game':
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Choice</h2>
            <p className="text-lg text-slate-600 mb-2">You can have:</p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
              <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-inner w-full md:w-auto">
                <span className="text-4xl text-black">{rewardType.smallReward}</span>
                <p className="text-sm font-semibold text-slate-600 mt-2">now</p>
              </div>
              <p className="text-xl font-bold text-slate-800">OR</p>
              <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-inner w-full md:w-auto">
                <span className="text-4xl text-black">{rewardType.bigReward}</span>
                <p className="text-sm font-semibold text-slate-600 mt-2">if you wait</p>
              </div>
            </div>
            <p className="text-xl font-bold mb-4 text-slate-800">Time Remaining: <span className="text-orange-500">{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</span></p>
            <button
              onClick={handleImmediateChoice}
              className="bg-red-500 text-black font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Take the Small Reward Now
            </button>
          </div>
        );
      case 'reasoning':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-lg w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Explain Your Choice</h2>
            <p className="text-md text-slate-600 mb-6">Why did you make that choice?</p>
            <form onSubmit={handleReasoningSubmit} className="w-full space-y-4">
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                className="w-full h-32 p-4 border border-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black-500 transition-all text-black"
                placeholder="Write your explanation here..."
                required
              />
              {configs[ageGroup].reasoningQuestions.map((question) => (
                <div key={question.id} className="text-left">
                  <p className="font-medium text-slate-700 mb-2">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center space-x-2 text-black">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={choiceMatrixAnswers[question.id] === option}
                          onChange={() => setChoiceMatrixAnswers(prev => ({
                            ...prev,
                            [question.id]: option
                          }))}
                          className="text-blue-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-500 text-black font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        );
      case 'results':
        const result = getLikertInterpretation(score);
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-lg w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Activity Complete!</h2>
            <p className="text-lg font-semibold text-slate-600 mb-2">Your Raw Score: <span className="text-blue-500">{score.toFixed(1)}</span></p>
            <div className="flex items-center space-x-2 mb-4">
              <p className="text-4xl font-extrabold text-blue-700">{result.likert}</p>
              <p className="text-xl font-bold text-slate-800">/ 5</p>
            </div>
            <p className="text-lg font-bold mb-4 text-slate-700">Interpretation:</p>
            <p className="text-2xl font-bold text-green-600">{result.interpretation}</p>
            <p className="text-sm text-gray-500 mt-4">
              Wait Duration: {waitDuration} seconds out of {configs[ageGroup].waitTime} seconds.
              <br />
              Initial Choice: {choice === 'delayed' ? 'Waited for the big reward' : 'Took the small reward immediately'}.
              <br />
              Reasoning: "{reasoning}"
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 bg-blue-500 text-black font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
            >
              Play Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center p-4 bg-gray-700">
      <div className="bg-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-2xl">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
