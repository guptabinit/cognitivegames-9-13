import { useState, useEffect } from 'react';
import { Award, Clock, Lightbulb, Check, X, Users, Smile, Frown } from 'lucide-react';

const App = () => {
  // Define all the state variables to manage the game flow.
  const [gamePhase, setGamePhase] = useState('intro'); // 'intro', 'choice', 'waiting', 'reasoning', 'matrix', 'results'
  const [ageGroup, setAgeGroup] = useState(null); // '10-11' or '12-13'
  const [chosenReward, setChosenReward] = useState(null); // 'small' or 'large'
  const [waitedFor, setWaitedFor] = useState(0); // Time waited in seconds
  const [timerId, setTimerId] = useState(null); // To store the interval ID for the timer
  const [reasoning, setReasoning] = useState(''); // The user's explanation for their choice
  const [matrixAnswers, setMatrixAnswers] = useState(Array(3).fill(null)); // Answers for the optional matrix
  const [score, setScore] = useState(null); // The final calculated score
  const [interpretation, setInterpretation] = useState(''); // The Likert scale interpretation

  // Define the game parameters based on age.
  const gameParams = {
    '10-11': {
      small: 'a single piece of candy',
      large: 'a larger snack or multiple pieces of candy',
      wait: 120, // 2 minutes
      scenarios: [
        {
          question: "Would you rather have a sticker now or a toy later?",
          small: "Sticker Now",
          large: "Toy Later"
        },
        {
          question: "Would you rather have 5 extra minutes of playtime now or 15 minutes of playtime later?",
          small: "5 Minutes Now",
          large: "15 Minutes Later"
        },
        {
          question: "Would you rather have one cookie now or three cookies later?",
          small: "One Cookie Now",
          large: "Three Cookies Later"
        },
      ]
    },
    '12-13': {
      small: '5 minutes of free time',
      large: '15 minutes of free time or a class privilege',
      wait: 240, // 4 minutes
      scenarios: [
        {
          question: "Would you rather get a small gift card now or a larger gift card later?",
          small: "Small Card Now",
          large: "Large Card Later"
        },
        {
          question: "Would you rather have 10 extra minutes on your phone now or an hour of video game time later?",
          small: "10 Minutes Phone Now",
          large: "Hour Game Time Later"
        },
        {
          question: "Would you rather have one social media post approved now or the ability to post freely for a week later?",
          small: "One Post Now",
          large: "Free Posting Later"
        }
      ]
    }
  };

  // Effect to handle the timer logic.
  useEffect(() => {
    if (gamePhase === 'waiting' && chosenReward === 'large') {
      const id = setInterval(() => {
        setWaitedFor(prevTime => {
          const newTime = prevTime + 1;
          // If the full wait time is reached, move to the results phase.
          if (newTime >= gameParams[ageGroup].wait) {
            clearInterval(id);
            setGamePhase('reasoning');
            return newTime;
          }
          return newTime;
        });
      }, 1000);
      setTimerId(id);
      return () => clearInterval(id); // Cleanup function to stop the timer.
    }
  }, [gamePhase, chosenReward, ageGroup, gameParams]);

  // State for countdown before game starts
  const [countdown, setCountdown] = useState(5); // 5 seconds countdown
  const [countdownActive, setCountdownActive] = useState(false);

  // Effect for the countdown timer
  useEffect(() => {
    if (countdownActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && countdownActive) {
      setCountdownActive(false);
      setGamePhase('waiting');
      setCountdown(5); // Reset countdown for next time
    }
  }, [countdown, countdownActive]);

  // Function to handle the choice of a reward.
  const handleChoice = (rewardType) => {
    setChosenReward(rewardType);
    if (rewardType === 'small') {
      setGamePhase('reasoning');
    } else {
      setCountdownActive(true); // Start the countdown
    }
  };

  // Function to save results to the backend
  const saveResults = async (finalScore, finalInterpretation) => {
    try {
      const response = await fetch('http://localhost/cognative-games/OGgames/backend/saveGame10Results.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_name: 'Player', // You might want to get this from user input or context
          age_group: ageGroup,
          chosen_reward: chosenReward,
          waited_for: waitedFor,
          reasoning: reasoning,
          matrix_answers: matrixAnswers,
          score: finalScore,
          interpretation: finalInterpretation
        }),
      });
      
      const result = await response.json();
      if (result.status !== 'success') {
        console.error('Failed to save results:', result.message);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  // Function to calculate the final score based on all criteria.
  const calculateScore = () => {
    let rawScore = 0;

    // 1. Initial Choice
    if (chosenReward === 'large') {
      rawScore += 1;
    }

    // 2. Wait Duration
    const waitDuration = gameParams[ageGroup].wait;
    if (waitedFor >= waitDuration) {
      rawScore += 1;
    } else if (waitedFor / waitDuration >= 0.8) {
      rawScore += 0.5;
    }

    // 3. Reasoning Quality
    const lowerReasoning = reasoning.toLowerCase();
    const futureKeywords = ['better', 'more', 'later', 'worth', 'goal', 'plan', 'future'];
    const isFutureOriented = futureKeywords.some(keyword => lowerReasoning.includes(keyword));

    if (isFutureOriented) {
      rawScore += 2;
    } else if (reasoning.length > 5) {
      rawScore += 1;
    }
    // If no reasoning is provided, score is 0, which is the default.

    // 4. Choice Matrix
    const scenarios = gameParams[ageGroup].scenarios;
    let matrixPoints = 0;
    matrixAnswers.forEach((answer, index) => {
      // Check if the user chose the 'large' option.
      if (answer === scenarios[index].large) {
        matrixPoints++;
      }
    });
    rawScore += matrixPoints;
    
    // Calculate interpretation
    let finalInterpretation = '';
    if (rawScore >= 4) {
      finalInterpretation = 'Excellent self-control';
    } else if (rawScore >= 3) {
      finalInterpretation = 'Above Average';
    } else if (rawScore >= 2) {
      finalInterpretation = 'Average';
    } else if (rawScore >= 1) {
      finalInterpretation = 'Below Average';
    } else {
      finalInterpretation = 'Very limited delay ability';
    }
    
    setScore(rawScore);
    setInterpretation(finalInterpretation);
    
    // Save results to backend
    saveResults(rawScore, finalInterpretation);
    
    // Show results
    setGamePhase('results');
  };

  // Helper component for buttons with icons and styles.
  const Button = ({ children, onClick, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-red-600 hover:bg-red-700',
      green: 'bg-green-600 hover:bg-green-700',
      gray: 'bg-gray-600 hover:bg-gray-700',
    };
    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl shadow-lg transform transition-transform duration-200 ease-in-out hover:scale-105 text-white font-semibold ${colorClasses[color]} focus:outline-none focus:ring-4 focus:ring-${color}-300`}
      >
        {children}
      </button>
    );
  };

  // Main game UI render logic based on the current phase.
  return (
    <div className="min-h-screen bg-slate-900 text-white font-inter flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-100">The Waiting Game</h1>
        <p className="text-sm md:text-md text-slate-300 mb-8">
          This activity measures self-control and decision-making by offering a choice between an immediate, smaller reward and a delayed, larger one.
        </p>

        {/* Phase: Intro - Age Group Selection */}
        {gamePhase === 'intro' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6">Choose your age group:</h2>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <Button onClick={() => { setAgeGroup('10-11'); setGamePhase('choice'); }}>
                <Users />
                <span>10-11 Years</span>
              </Button>
              <Button onClick={() => { setAgeGroup('12-13'); setGamePhase('choice'); }}>
                <Users />
                <span>12-13 Years</span>
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Choice - Reward Selection */}
        {gamePhase === 'choice' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6">Your Choice:</h2>
            <p className="text-lg text-slate-200 mb-8">
              Would you like to have <span className="text-yellow-400 font-bold">{gameParams[ageGroup].small}</span> now,
              or wait for <span className="text-green-400 font-bold">{gameParams[ageGroup].large}</span> later?
            </p>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <Button onClick={() => handleChoice('small')} color="red">
                <Frown />
                <span>Get Small Reward Now</span>
              </Button>
              <Button onClick={() => handleChoice('large')} color="green">
                <Smile />
                <span>Wait for Large Reward</span>
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Countdown before waiting */}
        {countdownActive && (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">Get Ready!</h2>
            <p className="text-lg text-slate-200 mb-8">
              The game will start in...
            </p>
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <Clock className="w-full h-full text-blue-500 opacity-20" />
              <div className="absolute text-6xl font-extrabold text-blue-400">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Phase: Waiting - Timer */}
        {gamePhase === 'waiting' && !countdownActive && (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">The timer has started...</h2>
            <p className="text-sm text-slate-300 mb-6">
              You will get the large reward if you wait for {Math.floor(gameParams[ageGroup].wait / 60)} minutes.
            </p>
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <Clock className="w-full h-full text-blue-500 opacity-20" />
              <div className="absolute text-5xl font-extrabold text-blue-400">
                {Math.floor((gameParams[ageGroup].wait - waitedFor) / 60)}:{(gameParams[ageGroup].wait - waitedFor) % 60 < 10 ? '0' : ''}{(gameParams[ageGroup].wait - waitedFor) % 60}
              </div>
            </div>
            <p className="text-lg font-semibold text-slate-100 mb-4">
              Time Waited: {Math.floor(waitedFor / 60)}:{(waitedFor % 60).toString().padStart(2, '0')}
            </p>
            <Button onClick={() => { clearInterval(timerId); setGamePhase('reasoning'); }} color="gray">
              <X />
              <span>Give Up and Take Small Reward</span>
            </Button>
          </div>
        )}

        {/* Phase: Reasoning - Explain Choice */}
        {gamePhase === 'reasoning' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Explain Your Choice</h2>
            <p className="text-lg text-slate-200 mb-6">
              You chose the <span className="font-bold">{chosenReward}</span> reward.
              Please explain why you made that choice.
            </p>
            <textarea
              className="w-full h-32 p-4 mb-6 rounded-xl bg-slate-700 text-white border-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
              placeholder="Type your reasoning here..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
            ></textarea>
            <Button onClick={() => setGamePhase('matrix')}>
              <Lightbulb />
              <span>Continue to Optional Questions</span>
            </Button>
          </div>
        )}

        {/* Phase: Matrix - Optional Questions */}
        {gamePhase === 'matrix' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6">Quick "Would You Rather?"</h2>
            <p className="text-sm text-slate-300 mb-6">
              Answer a few extra scenarios to see if your reasoning is consistent.
            </p>
            {gameParams[ageGroup].scenarios.map((scenario, index) => (
              <div key={index} className="w-full mb-6 p-4 rounded-xl bg-slate-700 border border-slate-600">
                <p className="text-lg text-slate-100 font-semibold mb-3">{scenario.question}</p>
                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={() => {
                      const newAnswers = [...matrixAnswers];
                      newAnswers[index] = scenario.small;
                      setMatrixAnswers(newAnswers);
                    }}
                    color={matrixAnswers[index] === scenario.small ? 'red' : 'gray'}
                  >
                    <Award />
                    <span>{scenario.small}</span>
                  </Button>
                  <Button
                    onClick={() => {
                      const newAnswers = [...matrixAnswers];
                      newAnswers[index] = scenario.large;
                      setMatrixAnswers(newAnswers);
                    }}
                    color={matrixAnswers[index] === scenario.large ? 'green' : 'gray'}
                  >
                    <Award />
                    <span>{scenario.large}</span>
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={calculateScore}>
              <Check />
              <span>See My Score!</span>
            </Button>
          </div>
        )}

        {/* Phase: Results - Final Score Display */}
        {gamePhase === 'results' && score !== null && (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">Your Results</h2>
            <div className="bg-slate-700 p-6 rounded-2xl w-full mb-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold text-slate-200">Raw Score:</p>
                <p className="text-4xl font-extrabold text-blue-400">{score.toFixed(1)}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold text-slate-200">Likert Score:</p>
                <p className="text-4xl font-extrabold text-yellow-400">
                  {score >= 4 ? 5 : score >= 3 ? 4 : score >= 2 ? 3 : score >= 1 ? 2 : 1}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-slate-200">Interpretation:</p>
                <p className="text-xl md:text-2xl font-extrabold text-green-400">{interpretation}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              Your results are based on your initial choice, how long you waited, your reasoning, and your consistency in the optional matrix questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;