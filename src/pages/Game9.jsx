import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
    const [view, setView] = useState('menu');
    const [results, setResults] = useState({});
    
    // Debug log when view changes
    useEffect(() => {
        console.log('Current view changed to:', view);
    }, [view]);
    
    // Debug log when results change
    useEffect(() => {
        if (Object.keys(results).length > 0) {
            console.log('Results updated:', JSON.parse(JSON.stringify(results)));
        }
    }, [results]);
    
    const renderView = () => {
        switch (view) {
            case 'menu':
                return <MainMenu setView={setView} />;
            case 'goNoGo':
                return <GoNoGoTask setView={setView} setResults={setResults} view={view} />;
            case 'stroop':
                return <StroopTask setView={setView} setResults={setResults} view={view} />;
            case 'flanker':
                return <FlankerTask setView={setView} setResults={setResults} view={view} />;
            case 'results':
                return <ResultsView results={results} setView={setView} />;
            default:
                return <MainMenu setView={setView} />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                {renderView()}
            </div>
        </div>
    );
};

// Utility Functions
const getAccuracyScore = (accuracy) => {
    if (accuracy >= 0.9) return 5;
    if (accuracy >= 0.8) return 4;
    if (accuracy >= 0.7) return 3;
    if (accuracy >= 0.6) return 2;
    return 1;
};

const getRtScore = (rt) => {
    if (rt <= 500) return 5;
    if (rt <= 750) return 4;
    if (rt <= 1000) return 3;
    if (rt <= 1500) return 2;
    return 1;
};

// Helper function to get performance descriptor from a score (0-5 scale)
const getDescriptor = (score) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
};

// Screen Components
const StartScreen = ({ setView }) => (
    <div className="text-center space-y-8 max-w-2xl mx-auto">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#02c082] to-[#0d8aff] mb-6">
            Cognitive Assessment
        </h1>
        <p className="text-lg text-gray-300 mb-8">
            This assessment includes three cognitive tasks to evaluate different aspects of your executive function:
        </p>
        <ul className="text-left space-y-4 text-gray-300 mb-12 max-w-md mx-auto">
            <li>• <strong>Go/No-Go:</strong> Press space for squares, do nothing for circles.</li>
            <li>• <strong>Stroop:</strong> Name the color of the word, not the word itself.</li>
            <li>• <strong>Flanker:</strong> Identify the direction of the middle arrow, ignoring the outer arrows.</li>
        </ul>
        <button
            onClick={() => setView('goNoGo')}
            className="px-8 py-4 bg-[#02c082] text-slate-900 font-bold text-xl rounded-full shadow-lg hover:bg-[#03a06c] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
            Start Assessment
        </button>
    </div>
);

const MainMenu = ({ setView }) => (
    <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-orange-400">Cognitive Assessment Tasks</h1>
        <p className="text-gray-300">Choose a task to begin the assessment.</p>
        <div className="space-y-4">
            <button
                onClick={() => setView('goNoGo')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
                Go/No-Go Task
            </button>
            <button
                onClick={() => setView('stroop')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
                Stroop Task
            </button>
            <button
                onClick={() => setView('flanker')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
                Flanker Task
            </button>
        </div>
    </div>
);


// Go/No-Go Task Component
const GoNoGoTask = ({ setView, setResults, view }) => {
    const totalTrials = 100;
    const goTrials = 75;
    const noGoTrials = 25;

    const [trial, setTrial] = useState(0);
    const [currentStimulus, setCurrentStimulus] = useState(null);
    const [goCount, setGoCount] = useState(0);
    const [noGoCount, setNoGoCount] = useState(0);
    const [correctGo, setCorrectGo] = useState(0);
    const [correctNoGo, setCorrectNoGo] = useState(0);
    const [goRTs, setGoRTs] = useState([]);
    const [trialStartTime, setTrialStartTime] = useState(null);
    const [isResponse, setIsResponse] = useState(false);

    // Function to generate the trial sequence
    const generateSequence = () => {
        const sequence = [];
        for (let i = 0; i < goTrials; i++) sequence.push('go');
        for (let i = 0; i < noGoTrials; i++) sequence.push('no-go');
        // Shuffle the sequence for random order
        return sequence.sort(() => Math.random() - 0.5);
    };

    const [trialSequence, setTrialSequence] = useState(generateSequence());

    // Effect to handle trial progression and scoring
    useEffect(() => {
        if (trial >= totalTrials) {
            // End of task, calculate and set results
            const goAccuracy = (correctGo / Math.max(goCount, 1)) * 100;
            const noGoAccuracy = (correctNoGo / Math.max(noGoCount, 1)) * 100;
            const commissionErrors = noGoCount - correctNoGo;
            const omissionErrors = goCount - correctGo;
            const avgGoRT = goRTs.length > 0 ? goRTs.reduce((a, b) => a + b) / goRTs.length : 0;
            const subscore = getAccuracyScore(goAccuracy / 100);

            setResults({
                task: 'Go/No-Go',
                goAccuracy,
                noGoAccuracy,
                commissionErrors,
                omissionErrors,
                avgGoRT,
                subscore,
                // Add these for compatibility with ResultsView
                correctC: goAccuracy,
                correctI: noGoAccuracy,
                avgCRT: avgGoRT,
                avgIRT: 0, // Not applicable for Go/No-Go
                accuracyCost: 0, // Not applicable for Go/No-Go
                rtCost: 0, // Not applicable for Go/No-Go
                subscoreC: subscore,
                subscoreI: 0 // Not applicable for Go/No-Go
            });
            setView('results');
            return;
        }

        // Start a new trial
        const currentTrialType = trialSequence[trial];
        setCurrentStimulus(currentTrialType === 'go' ? 'Go (Square)' : 'No-Go (Circle)');
        setTrialStartTime(Date.now());
        setIsResponse(false);

        // Timeout for No-Go trials
        if (currentTrialType === 'no-go') {
            const timeout = setTimeout(() => {
                if (!isResponse) {
                    setCorrectNoGo(prev => prev + 1);
                    setNoGoCount(prev => prev + 1);
                }
                setTimeout(() => setTrial(prev => prev + 1), 500); // Short delay before next trial
            }, 1500); // 1.5 seconds to wait for a response
            return () => clearTimeout(timeout);
        } else {
             // For Go trials, wait for a key press
            const timeout = setTimeout(() => {
                if (!isResponse) {
                    setGoCount(prev => prev + 1);
                    setTimeout(() => setTrial(prev => prev + 1), 500);
                }
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [trial, setView, setResults, trialSequence, isResponse]);

    // Keyboard event listener for Go/No-Go response
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Check if a response has already been made for this trial
            if (isResponse || view !== 'goNoGo') return;

            const trialType = trialSequence[trial];
            const reactionTime = Date.now() - trialStartTime;
            
            if (e.key === ' ') { // Space bar is the "Go" response
                setIsResponse(true);
                if (trialType === 'go') {
                    setCorrectGo(prev => prev + 1);
                    setGoCount(prev => prev + 1);
                    setGoRTs(prev => [...prev, reactionTime]);
                } else { // Pressed on a No-Go trial (Commission Error)
                    setNoGoCount(prev => prev + 1);
                }
            } else { // Any other key press is an error
                if (trialType === 'go') {
                    setGoCount(prev => prev + 1);
                } else { // No-Go, but different key (still an error)
                    setNoGoCount(prev => prev + 1);
                }
            }
            setTimeout(() => setTrial(prev => prev + 1), 500); // Short delay before next trial
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [trial, trialSequence, trialStartTime, isResponse, view]);

    if (trial >= totalTrials) {
        return <div className="text-center">Loading results...</div>;
    }

    return (
        <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold mb-4">Go/No-Go Task</h2>
            <p className="text-lg">Trial {trial + 1} of {totalTrials}</p>
            <p className="text-gray-300">Press the SPACEBAR for a <span className="font-bold text-green-400">Go</span> trial. Do nothing for a <span className="font-bold text-red-400">No-Go</span> trial.</p>
            <div className="flex items-center justify-center h-48">
                {currentStimulus === 'Go (Square)' && <div className="w-24 h-24 bg-green-500 rounded-lg animate-pulse-once"></div>}
                {currentStimulus === 'No-Go (Circle)' && <div className="w-24 h-24 bg-red-500 rounded-full animate-pulse-once"></div>}
            </div>
            <p className="text-xl font-semibold">{currentStimulus}</p>
        </div>
    );
};

// Stroop Task Component
const StroopTask = ({ setView, setResults, view }) => {
    // State for game logic and scoring
    const totalTrials = 60;
    const colors = ['red', 'blue', 'green', 'yellow'];
    const words = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

    const [trial, setTrial] = useState(0);
    const [currentStimulus, setCurrentStimulus] = useState({});
    const [congruentRTs, setCongruentRTs] = useState([]);
    const [incongruentRTs, setIncongruentRTs] = useState([]);
    const [correctCongruent, setCorrectCongruent] = useState(0);
    const [correctIncongruent, setCorrectIncongruent] = useState(0);
    const [congruentCount, setCongruentCount] = useState(0);
    const [incongruentCount, setIncongruentCount] = useState(0);
    const [trialStartTime, setTrialStartTime] = useState(null);

    // Generate a new trial stimulus
    const generateTrial = () => {
        const isCongruent = Math.random() < 0.5;
        const word = words[Math.floor(Math.random() * words.length)];
        let color;
        if (isCongruent) {
            color = word.toLowerCase();
            setCongruentCount(prev => prev + 1);
        } else {
            do {
                color = colors[Math.floor(Math.random() * colors.length)];
            } while (color === word.toLowerCase());
            setIncongruentCount(prev => prev + 1);
        }
        setCurrentStimulus({ word, color, isCongruent });
        setTrialStartTime(Date.now());
    };

    // Effect to start the game and progress trials
    useEffect(() => {
        if (trial >= totalTrials) {
            // End of task, calculate and set results
            const correctC = (correctCongruent / Math.max(congruentCount, 1)) * 100;
            const correctI = (correctIncongruent / Math.max(incongruentCount, 1)) * 100;
            const avgCRT = congruentRTs.length > 0 ? congruentRTs.reduce((a, b) => a + b) / congruentRTs.length : 0;
            const avgIRT = incongruentRTs.length > 0 ? incongruentRTs.reduce((a, b) => a + b) / incongruentRTs.length : 0;
            const accuracyCost = correctC - correctI;
            const rtCost = avgIRT - avgCRT;
            const subscoreC = getAccuracyScore(correctC / 100);
            const subscoreI = getAccuracyScore(correctI / 100);
            const overallScore = (subscoreC + subscoreI) / 2;

            const results = {
                task: 'Stroop',
                correctC,
                correctI,
                avgCRT,
                avgIRT,
                accuracyCost,
                rtCost,
                subscoreC,
                subscoreI,
                // Add these for compatibility with saveResults
                goAccuracy: 0, // Not applicable for Stroop
                noGoAccuracy: 0, // Not applicable for Stroop
                commissionErrors: 0, // Not applicable for Stroop
                omissionErrors: 0, // Not applicable for Stroop
                avgGoRT: 0, // Not applicable for Stroop
                subscore: overallScore
            };
            
            // Set results first to ensure they're available in the ResultsView
            setResults(results);
            
            // Save results to the backend
            const player = {
                nickname: localStorage.getItem('playerNickname') || 'Anonymous',
                avatar: localStorage.getItem('playerAvatar') || 'default'
            };
            
            // Use setTimeout to ensure setResults completes before changing view
            setTimeout(() => {
                saveResults(player, 'stroop', {
                    congruentAccuracy: correctC,
                    incongruentAccuracy: correctI,
                    avgCongruentRT: avgCRT,
                    avgIncongruentRT: avgIRT,
                    accuracyCost,
                    rtCost,
                    congruentSubscore: subscoreC,
                    incongruentSubscore: subscoreI
                }, overallScore, getDescriptor(overallScore));
                
                setView('results');
            }, 0);
            return;
        }

        generateTrial();
    }, [trial, setView, setResults]);

    // Handle user's click response
    const handleResponse = (selectedColor) => {
        const reactionTime = Date.now() - trialStartTime;
        if (currentStimulus.isCongruent) {
            setCongruentRTs(prev => [...prev, reactionTime]);
            if (selectedColor === currentStimulus.color) {
                setCorrectCongruent(prev => prev + 1);
            }
        } else {
            setIncongruentRTs(prev => [...prev, reactionTime]);
            if (selectedColor === currentStimulus.color) {
                setCorrectIncongruent(prev => prev + 1);
            }
        }
        // Generate next trial after a short delay
        setTimeout(() => setTrial(prev => prev + 1), 500);
    };

    if (trial >= totalTrials) {
        return <div className="text-center">Loading results...</div>;
    }

    return (
        <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold mb-4">Stroop Task</h2>
            <p className="text-lg">Trial {trial + 1} of {totalTrials}</p>
            <p className="text-gray-300">Name the <span className="font-bold">ink color</span>, not the word.</p>
            <div className="flex items-center justify-center h-48">
                <p className="text-6xl font-black transition-colors duration-300" style={{ color: currentStimulus.color }}>
                    {currentStimulus.word}
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {colors.map(color => (
                    <button
                        key={color}
                        onClick={() => handleResponse(color)}
                        className={`py-3 px-6 font-bold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-${color}-500`}
                        style={{ backgroundColor: color, color: color === 'yellow' ? 'black' : 'white' }}
                    >
                        {color.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Flanker Task Component
const FlankerTask = ({ setView, setResults, view }) => {
    // State for game logic and scoring
    const totalTrials = 60;

    const [trial, setTrial] = useState(0);
    const [currentStimulus, setCurrentStimulus] = useState(null);
    const [congruentRTs, setCongruentRTs] = useState([]);
    const [incongruentRTs, setIncongruentRTs] = useState([]);
    const [correctCongruent, setCorrectCongruent] = useState(0);
    const [correctIncongruent, setCorrectIncongruent] = useState(0);
    const [trialStartTime, setTrialStartTime] = useState(null);

    // Generate a new trial stimulus
    const generateTrial = () => {
        const isCongruent = Math.random() < 0.5;
        const middleArrow = Math.random() < 0.5 ? '←' : '→';
        let arrows;
        if (isCongruent) {
            arrows = `${middleArrow}${middleArrow}${middleArrow}${middleArrow}${middleArrow}`;
        } else {
            const sideArrow = middleArrow === '←' ? '→' : '←';
            arrows = `${sideArrow}${sideArrow}${middleArrow}${sideArrow}${sideArrow}`;
        }
        setCurrentStimulus({ arrows, middleArrow, isCongruent });
        setTrialStartTime(Date.now());
    };

    // Effect to start the game and progress trials
    useEffect(() => {
        if (trial >= totalTrials) {
            // End of task, calculate and set results
            const correctC = (correctCongruent / 30) * 100;
            const correctI = (correctIncongruent / 30) * 100;
            const avgCRT = congruentRTs.length > 0 ? congruentRTs.reduce((a, b) => a + b) / congruentRTs.length : 0;
            const avgIRT = incongruentRTs.length > 0 ? incongruentRTs.reduce((a, b) => a + b) / incongruentRTs.length : 0;
            const accuracyCost = correctC - correctI;
            const rtCost = avgIRT - avgCRT;
            const subscoreC = getAccuracyScore(correctC / 100);
            const subscoreI = getAccuracyScore(correctI / 100);
            const overallScore = (subscoreC + subscoreI) / 2;
            
            const results = {
                task: 'Flanker',
                correctC,
                correctI,
                avgCRT,
                avgIRT,
                accuracyCost,
                rtCost,
                subscoreC,
                subscoreI,
                // Add these for compatibility with saveResults
                goAccuracy: 0, // Not applicable for Flanker
                noGoAccuracy: 0, // Not applicable for Flanker
                commissionErrors: 0, // Not applicable for Flanker
                omissionErrors: 0, // Not applicable for Flanker
                avgGoRT: 0, // Not applicable for Flanker
                subscore: overallScore
            };
            
            // Set results first to ensure they're available in the ResultsView
            setResults(results);
            
            // Save results to the backend
            const player = {
                nickname: localStorage.getItem('playerNickname') || 'Anonymous',
                avatar: localStorage.getItem('playerAvatar') || 'default'
            };
            
            // Use setTimeout to ensure setResults completes before changing view
            setTimeout(() => {
                saveResults(player, 'flanker', {
                    congruentAccuracy: correctC,
                    incongruentAccuracy: correctI,
                    avgCongruentRT: avgCRT,
                    avgIncongruentRT: avgIRT,
                    accuracyCost,
                    rtCost,
                    congruentSubscore: subscoreC,
                    incongruentSubscore: subscoreI
                }, overallScore, getDescriptor(overallScore));
                
                setView('results');
            }, 0);
            return;
        }

        generateTrial();
    }, [trial, setView, setResults]);

    // Keyboard event listener for Flanker response
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (view !== 'flanker') return;

            const reactionTime = Date.now() - trialStartTime;
            const isCorrect = (e.key === 'ArrowLeft' && currentStimulus.middleArrow === '←') || (e.key === 'ArrowRight' && currentStimulus.middleArrow === '→');
            
            if (currentStimulus.isCongruent) {
                setCongruentRTs(prev => [...prev, reactionTime]);
                if (isCorrect) {
                    setCorrectCongruent(prev => prev + 1);
                }
            } else {
                setIncongruentRTs(prev => [...prev, reactionTime]);
                if (isCorrect) {
                    setCorrectIncongruent(prev => prev + 1);
                }
            }
            setTrial(prev => prev + 1);
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [trial, currentStimulus, trialStartTime, view]);

    if (trial >= totalTrials) {
        return <div className="text-center">Loading results...</div>;
    }

    return (
        <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold mb-4">Flanker Task</h2>
            <p className="text-lg">Trial {trial + 1} of {totalTrials}</p>
            <p className="text-gray-300">Identify the direction of the <span className="font-bold">middle arrow</span> using the LEFT and RIGHT arrow keys.</p>
            <div className="flex items-center justify-center h-48">
                <p className="text-6xl font-black">
                    {currentStimulus?.arrows}
                </p>
            </div>
        </div>
    );
};

// Helper function to save results to the backend
const saveResults = async (player, taskType, results, overallScore, descriptor) => {
    // Use relative URL to avoid CORS issues
    const API_URL = '/cognative-games/OGgames/backend/saveGame9Results.php';
    
    const requestData = {
        player: {
            nickname: player.nickname || 'Anonymous',
            avatar: player.avatar || 'default'
        },
        taskType,
        results,
        overallScore,
        descriptor,
        timestamp: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] Saving ${taskType} results:`, {
        ...requestData,
        player: { ...requestData.player, avatar: '...' } // Don't log full avatar data
    });
    
    try {
        const startTime = performance.now();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(requestData),
            credentials: 'same-origin' // Use same-origin instead of include for better security
        });
        
        const responseTime = performance.now() - startTime;
        console.log(`[${new Date().toISOString()}] Response received in ${responseTime.toFixed(0)}ms:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            type: response.type
        });
        
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        if (!response.ok) {
            console.error('Server response error details:', {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseText
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            console.error('Failed to parse JSON response. Response was:', responseText);
            throw new Error('Invalid JSON response from server');
        }
        
        console.log(`[${new Date().toISOString()}] Save successful:`, data);
        return data;
    } catch (error) {
        const errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            request: {
                url: 'http://localhost/cognative-games/OGgames/backend/saveGame9Results.php',
                method: 'POST',
                data: {
                    ...requestData,
                    results: { ...requestData.results, /* Don't log all results data */ },
                    player: { ...requestData.player, avatar: '...' }
                }
            },
            timestamp: new Date().toISOString()
        };
        
        console.error(`[${errorInfo.timestamp}] Error saving results:`, errorInfo);
        throw error; // Re-throw to allow error handling in the calling component
    }
};

// Helper function to calculate composite score
const calculateCompositeScore = (results) => {
    if (!results || !results.task) return 0;
    
    try {
        console.log('Calculating composite score for:', results.task);
        console.log('Results data:', JSON.parse(JSON.stringify(results)));
        
        const allScores = [];
        
        // For Go/No-Go task
        if (results.task === 'Go/No-Go') {
            const score = Number(results.subscore) || 0;
            console.log('Go/No-Go subscore:', score);
            allScores.push(score);
        }
        
        // For Stroop and Flanker tasks
        if (results.task === 'Stroop' || results.task === 'Flanker') {
            const subscoreC = Number(results.subscoreC) || 0;
            const subscoreI = Number(results.subscoreI) || 0;
            const avgScore = (subscoreC + subscoreI) / 2;
            console.log(`${results.task} subscores - C: ${subscoreC}, I: ${subscoreI}, Avg: ${avgScore}`);
            allScores.push(avgScore);
        }
        
        // Calculate average score if we have any scores
        if (allScores.length > 0) {
            const totalScore = allScores.reduce((sum, score) => sum + score, 0);
            const avgScore = totalScore / allScores.length;
            console.log('Final composite score:', avgScore);
            return avgScore;
        }
        
        console.warn('No valid scores found for composite calculation');
        return 0;
    } catch (error) {
        console.error('Error calculating composite score:', error);
        return 0;
    }
};

// Results View Component
const ResultsView = ({ results, setView }) => {
    // State hooks at the top level
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState({
        isSaving: false,
        isSaved: false,
        error: null
    });
    
    // Calculate derived values
    const compositeScore = results ? calculateCompositeScore(results) : 0;
    const descriptor = getDescriptor(compositeScore);
    
    // Get player info
    const player = {
        nickname: localStorage.getItem('playerNickname') || 'Anonymous',
        avatar: localStorage.getItem('playerAvatar') || 'default'
    };
    
    // Effect for handling results loading and saving
    useEffect(() => {
        const saveResultsToBackend = async () => {
            if (!results) {
                console.warn('No results data available');
                setIsLoading(false);
                return;
            }
            
            console.log('ResultsView received results:', JSON.parse(JSON.stringify(results)));
            
            // Skip if we've already saved results for this task
            if (saveStatus.isSaved) {
                setIsLoading(false);
                return;
            }
            
            setSaveStatus(prev => ({ ...prev, isSaving: true }));
            
            let taskData = null;
            let taskType = '';
            let overallScore = 0;

            try {
                if (results.task === 'Go/No-Go') {
                    taskType = 'goNoGo';
                    overallScore = results.subscore || 0;
                    taskData = {
                        goAccuracy: results.goAccuracy,
                        noGoAccuracy: results.noGoAccuracy,
                        commissionErrors: results.commissionErrors,
                        omissionErrors: results.omissionErrors,
                        avgGoRT: results.avgGoRT,
                        subscore: results.subscore
                    };
                } else if (results.task === 'Stroop' || results.task === 'Flanker') {
                    taskType = results.task.toLowerCase();
                    overallScore = (results.subscoreC + results.subscoreI) / 2;
                    taskData = {
                        congruentAccuracy: results.correctC,
                        incongruentAccuracy: results.correctI,
                        avgCongruentRT: results.avgCRT,
                        avgIncongruentRT: results.avgIRT,
                        accuracyCost: results.accuracyCost,
                        rtCost: results.rtCost,
                        congruentSubscore: results.subscoreC,
                        incongruentSubscore: results.subscoreI
                    };
                }

                if (taskData && taskType) {
                    console.log('Saving results to backend:', { taskType, taskData, overallScore });
                    await saveResults(
                        player, 
                        taskType, 
                        taskData, 
                        overallScore, 
                        getDescriptor(overallScore)
                    );
                    console.log('Results saved successfully');
                    setSaveStatus({
                        isSaving: false,
                        isSaved: true,
                        error: null
                    });
                }
            } catch (error) {
                console.error('Error saving results:', error);
                setSaveStatus({
                    isSaving: false,
                    isSaved: false,
                    error: error.message || 'Failed to save results. Please try again.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        saveResultsToBackend();
    }, [results]);
    
    // Loading state
    if (isLoading || !results || Object.keys(results).length === 0) {
        return (
            <div className="text-center p-6">
                <h2 className="text-2xl font-bold mb-4">Loading Results...</h2>
                <p className="text-gray-300">Please wait while we process your results.</p>
                {saveStatus.isSaving && (
                    <div className="mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-blue-400">Saving your results...</p>
                    </div>
                )}
            </div>
        );
    }
    
    // Error state
    if (saveStatus.error) {
        return (
            <div className="text-center p-6">
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error Saving Results</h2>
                    <p className="text-red-300">{saveStatus.error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Calculate results data based on task type
    const getTaskResults = () => {
        if (!results || !results.task) return null;

        let taskData = null;
        let taskType = '';
        let overallScore = 0;
        let displayData = [];

        if (results.task === 'Go/No-Go') {
            taskType = 'goNoGo';
            overallScore = results.subscore || 0;
            taskData = {
                goAccuracy: results.goAccuracy,
                noGoAccuracy: results.noGoAccuracy,
                commissionErrors: results.commissionErrors,
                omissionErrors: results.omissionErrors,
                avgGoRT: results.avgGoRT,
                subscore: results.subscore
            };
            
            displayData = [
                { label: 'Go Accuracy', value: `${results.goAccuracy?.toFixed(1) || 0}%` },
                { label: 'No-Go Accuracy', value: `${results.noGoAccuracy?.toFixed(1) || 0}%` },
                { label: 'Commission Errors', value: results.commissionErrors || 0 },
                { label: 'Omission Errors', value: results.omissionErrors || 0 },
                { label: 'Avg Go RT', value: `${results.avgGoRT?.toFixed(0) || 0}ms` }
            ];
        } 
        else if (results.task === 'Stroop' || results.task === 'Flanker') {
            taskType = results.task.toLowerCase();
            overallScore = (results.subscoreC + results.subscoreI) / 2;
            taskData = {
                congruentAccuracy: results.correctC,
                incongruentAccuracy: results.correctI,
                avgCongruentRT: results.avgCRT,
                avgIncongruentRT: results.avgIRT,
                accuracyCost: results.accuracyCost,
                rtCost: results.rtCost,
                congruentSubscore: results.subscoreC,
                incongruentSubscore: results.subscoreI
            };
            
            displayData = [
                { label: 'Congruent Accuracy', value: `${results.correctC?.toFixed(1) || 0}%` },
                { label: 'Incongruent Accuracy', value: `${results.correctI?.toFixed(1) || 0}%` },
                { label: 'Avg Congruent RT', value: `${results.avgCRT?.toFixed(0) || 0}ms` },
                { label: 'Avg Incongruent RT', value: `${results.avgIRT?.toFixed(0) || 0}ms` },
                { label: 'Accuracy Cost', value: results.accuracyCost?.toFixed(1) || 0 },
                { label: 'RT Cost', value: `${results.rtCost?.toFixed(0) || 0}ms` }
            ];
        }

        return { taskType, taskData, overallScore, displayData };
    };

    // Get task results
    const taskResults = getTaskResults();

    // Helper function to safely format numbers
    const formatNumber = (value, decimals = 1) => {
        if (value === undefined || value === null) return 'N/A';
        const num = Number(value);
        return isNaN(num) ? 'N/A' : num.toFixed(decimals);
    };

    // If no valid task results, show error
    if (!taskResults) {
        return (
            <div className="text-center p-6">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                <p className="text-gray-300">No valid results data available. Please try again.</p>
                <button 
                    onClick={() => setView('mainMenu')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    const { taskType, taskData, overallScore, displayData } = taskResults;
    const taskDescriptor = getDescriptor(overallScore);

    console.log('Rendering results view with data:', {
        task: results.task,
        results: JSON.parse(JSON.stringify(results)),
        overallScore,
        taskDescriptor
    });

    return (
        <div className="text-center space-y-6 p-6">
            <h2 className="text-2xl font-bold">Task Complete!</h2>
            <p className="text-gray-300">Here are your results for the {results.task || 'unknown'} task.</p>
            <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-xl font-semibold mb-2">
                    Overall Score: {formatNumber(overallScore, 1)}/5.0
                </p>
                <p className="text-lg text-blue-400 mb-4">
                    Performance: {taskDescriptor}
                </p>
                
                <div className="mt-4 space-y-2 text-left">
                    {displayData.map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="text-gray-400">{item.label}:</span>
                            <span className="font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={() => setView('mainMenu')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
                >
                    Back to Main Menu
                </button>
            </div>
        </div>
    );
};

export default App;
