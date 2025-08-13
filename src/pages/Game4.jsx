import React, { useState, useEffect, useCallback } from 'react';

// --- DATA SETUP ---
const stories = [
    // --- 9-10 Age Group (4 Levels) ---
    {
        id: 1,
        ageGroup: '9-10',
        level: 1,
        text: "The big yellow bus stopped at the corner.",
        keyDetails: ["yellow bus", "stopped", "at the corner"], // 3 details
        comprehensionQuestions: [
            { question: "What color was the bus?", options: ["Red", "Blue", "Yellow"], answer: "Yellow" },
        ]
    },
    {
        id: 2,
        ageGroup: '9-10',
        level: 2,
        text: "A girl named Lily found a small kitten in her garden. She gave it a bowl of milk to drink.",
        keyDetails: ["girl named Lily", "found a kitten", "in her garden", "gave it milk"], // 4 details
        comprehensionQuestions: [
            { question: "What did Lily find?", options: ["A puppy", "A kitten", "A bird"], answer: "A kitten" },
            { question: "What did she give it?", options: ["Water", "Food", "Milk"], answer: "Milk" },
        ]
    },
    {
        id: 3,
        ageGroup: '9-10',
        level: 3,
        text: "On Saturday morning, Tom and his dad went fishing at the big lake. After a few hours, they caught three small fish and decided to cook them for dinner.",
        keyDetails: ["Saturday morning", "Tom and his dad", "went fishing", "at the lake", "caught three fish", "cooked them for dinner"], // 6 details
        comprehensionQuestions: [
            { question: "Who went fishing with Tom?", options: ["His mom", "His dad", "His friend"], answer: "His dad" },
            { question: "How many fish did they catch?", options: ["One", "Two", "Three"], answer: "Three" },
        ]
    },
    {
        id: 4,
        ageGroup: '9-10',
        level: 4,
        text: "Our class took a trip to the city museum. First, we saw the giant dinosaur bones in the main hall. \n\nThen, our guide showed us ancient Egyptian mummies in a special exhibit. It was a very exciting day for everyone.",
        keyDetails: ["class trip", "city museum", "saw dinosaur bones", "main hall", "guide showed", "Egyptian mummies", "special exhibit", "exciting day"], // 8 details
        comprehensionQuestions: [
            { question: "Where did the class go?", options: ["The zoo", "The museum", "The park"], answer: "The museum" },
            { question: "What did they see first?", options: ["Mummies", "Paintings", "Dinosaur bones"], answer: "Dinosaur bones" },
        ]
    },
    // --- 11-13 Age Group (4 Levels) ---
    {
        id: 5,
        ageGroup: '11-13',
        level: 1,
        text: "The new public library will open downtown next month.",
        keyDetails: ["new library", "opens downtown", "next month"], // 3 details
        comprehensionQuestions: [
            { question: "What is opening next month?", options: ["A school", "A library", "A park"], answer: "A library" },
        ]
    },
    {
        id: 6,
        ageGroup: '11-13',
        level: 2,
        text: "A scientist in Brazil recently discovered a new species of fluorescent frog deep within the Amazon rainforest.",
        keyDetails: ["scientist in Brazil", "discovered", "new species", "fluorescent frog", "Amazon rainforest"], // 5 details
        comprehensionQuestions: [
            { question: "What was discovered?", options: ["A plant", "An insect", "A frog"], answer: "A frog" },
            { question: "Where was it found?", options: ["The Andes Mountains", "The Amazon rainforest", "The Sahara Desert"], answer: "The Amazon rainforest" },
        ]
    },
    {
        id: 7,
        ageGroup: '11-13',
        level: 3,
        text: "The school's basketball team won the championship game last night in a dramatic overtime finish. The final score was 68 to 66 after the team captain scored the winning basket with only seconds left.",
        keyDetails: ["basketball team", "won championship", "last night", "in overtime", "final score 68 to 66", "captain scored winning basket"], // 6 details
        comprehensionQuestions: [
            { question: "Which team won?", options: ["The soccer team", "The basketball team", "The football team"], answer: "The basketball team" },
            { question: "How was the game decided?", options: ["In the first half", "By a large margin", "In overtime"], answer: "In overtime" },
        ]
    },
    {
        id: 8,
        ageGroup: '11-13',
        level: 4,
        text: "The international space station completed its one hundred thousandth orbit of Earth yesterday. To mark the occasion, the crew conducted a four-hour spacewalk to install new, more efficient solar panels. \n\nThese panels will increase the station's available power supply by nearly fifteen percent, allowing for more complex scientific experiments.",
        keyDetails: ["international space station", "100,000th orbit", "crew conducted", "four-hour spacewalk", "install new solar panels", "increase power supply", "fifteen percent", "more complex experiments"], // 8 details
        comprehensionQuestions: [
            { question: "What did the crew install during the spacewalk?", options: ["A new antenna", "Solar panels", "A camera"], answer: "Solar panels" },
            { question: "By how much will the power supply increase?", options: ["Five percent", "Ten percent", "Fifteen percent"], answer: "Fifteen percent" },
        ]
    }
];

// --- SCORING LOGIC ---
const getRecallScore = (percentage) => {
  // Score based on percentage of key details recalled
  if (percentage >= 85) return 5;  // 85-100%
  if (percentage >= 70) return 4;  // 70-84%
  if (percentage >= 55) return 3;  // 55-69%
  if (percentage >= 40) return 2;  // 40-54%
  return 1;                       // < 40%
};

const getComprehensionAdjustment = (correctPercentage) => {
  // Score adjustment based on comprehension accuracy
  if (correctPercentage >= 90) return 0;    // Full Comprehension (no adjustment)
  if (correctPercentage >= 70) return -0.5; // Good Comprehension (-0.5)
  if (correctPercentage >= 50) return -1.0; // Moderate Comprehension (-1.0)
  return -Infinity;                        // No Comprehension (cap at 2)
};

const getSpeedAdjustment = (time, ageGroup) => {
  // Speed adjustment based on age group and response time
  if (ageGroup === '9-10') {
    // 9-10 years: 10-20 seconds allowed before penalty
    if (time <= 10) return 0;     // Fast (no adjustment)
    if (time <= 20) return 0;     // Normal (no adjustment)
    if (time <= 30) return -0.5;  // Slow (-0.5)
    return -1.0;                  // Very slow (-1.0)
  } else {
    // 11-13 years: 5-15 seconds allowed before penalty
    if (time <= 5) return 0;      // Fast (no adjustment)
    if (time <= 15) return 0;     // Normal (no adjustment)
    if (time <= 30) return -0.5;  // Slow (-0.5)
    return -1.0;                  // Very slow (-1.0)
  }
};

const getFinalRating = (recallScore, compAdj, speedAdj) => {
  // If no comprehension, cap score at 2
  if (compAdj === -Infinity) {
    return Math.min(2, recallScore + speedAdj);
  }
  
  // Calculate final score with adjustments
  let finalScore = recallScore + compAdj + speedAdj;
  
  // Ensure score is between 1 and 5
  return Math.max(1, Math.min(5, Math.round(finalScore * 2) / 2)); // Round to nearest 0.5
};

// --- AUDIO HELPER FUNCTIONS ---
const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

const pcmToWav = (pcmData, sampleRate) => {
    const numChannels = 1;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false);
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, dataSize, true);
    const pcm16 = new Int16Array(pcmData.buffer);
    for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(44 + i * 2, pcm16[i], true);
    }
    return new Blob([view], { type: 'audio/wav' });
};


// --- MAIN GAME COMPONENT ---
export default function Game4({ player, onGoBack }) {
  const [gameState, setGameState] = useState('age_select');
  const [ageGroup, setAgeGroup] = useState(null);
  const [filteredStories, setFilteredStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [recalledText, setRecalledText] = useState('');
  const [comprehensionAnswers, setComprehensionAnswers] = useState({});
  const [processingTime, setProcessingTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [allStoryResults, setAllStoryResults] = useState([]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [nextAudioUrl, setNextAudioUrl] = useState(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const currentStory = filteredStories[currentStoryIndex];
  
  const handleAgeSelect = (selectedAgeGroup) => {
      setAgeGroup(selectedAgeGroup);
      const storiesForAge = stories
        .filter(s => s.ageGroup === selectedAgeGroup)
        .sort((a, b) => a.level - b.level); // Sort by level
      setFilteredStories(storiesForAge);
      setGameState('instructions');
  };

  const generateAudio = async (text) => {
    // First try Web Speech API (no API key needed)
    if ('speechSynthesis' in window) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a natural-sounding voice
        const preferredVoice = voices.find(voice => 
          voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        } else if (voices.length > 0) {
          utterance.voice = voices[0];
        }
        
        utterance.rate = 0.9; // Slightly slower than normal
        utterance.pitch = 1.0; // Normal pitch
        
        utterance.onend = () => resolve('web-speech');
        utterance.onerror = (event) => {
          console.error('SpeechSynthesis error:', event);
          resolve(null);
        };
        
        window.speechSynthesis.speak(utterance);
      });
    }
    
    // Fallback to Google's Text-to-Speech API
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
      if (!apiKey) {
        console.warn('Google TTS API key not found. Using text display only.');
        return null;
      }
      
      const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const payload = {
        input: { text },
        voice: { 
          languageCode: 'en-US',
          name: 'en-US-Standard-D', // Natural sounding voice
          ssmlGender: 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 0,
          volumeGainDb: 0
        }
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('TTS API error:', error);
        return null;
      }
      
      const data = await response.json();
      if (data.audioContent) {
        const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
        return URL.createObjectURL(audioBlob);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
    }
    
    return null;
  };
  
  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };

  const prefetchNextAudio = useCallback(async (index) => {
    if (index < filteredStories.length) {
      const url = await generateAudio(filteredStories[index].text);
      setNextAudioUrl(url);
    }
  }, [filteredStories]);
  
  const startListening = async () => {
    setGameState('listening');
    
    try {
      setIsGeneratingAudio(true);
      
      // Try to generate and play audio
      const audioResult = await generateAudio(currentStory.text);
      
      if (audioResult === 'web-speech') {
        // Web Speech API is handling playback
        // Set a timeout in case the onend event doesn't fire
        const safetyTimeout = setTimeout(() => {
          setGameState('recall');
          setTimer(Date.now());
        }, 30000); // 30 second timeout as a safety net
        
        // This will be cleared when the speech ends
        return () => clearTimeout(safetyTimeout);
      } else if (audioResult) {
        // Play the generated audio URL
        const audio = new Audio(audioResult);
        audio.play();
        
        // Prefetch next audio if available
        if (currentStoryIndex + 1 < filteredStories.length) {
          prefetchNextAudio(currentStoryIndex + 1);
        }
        
        audio.onended = () => {
          setGameState('recall');
          setTimer(Date.now());
        };
      } else {
        // No audio available, show text immediately
        setGameState('recall');
        setTimer(Date.now());
      }
    } catch (error) {
      console.error('Error in startListening:', error);
      setGameState('recall');
      setTimer(Date.now());
    } finally {
      setIsGeneratingAudio(false);
    }
  };

// ... (rest of the code remains the same)

  const handleInteractionStart = () => {
      if (timer) {
          setProcessingTime((Date.now() - timer) / 1000);
          setTimer(null);
      }
  };

  const handleComprehensionChange = (questionIndex, answer) => {
      handleInteractionStart();
      setComprehensionAnswers(prev => ({...prev, [questionIndex]: answer}));
  }

  // Helper function to get comprehension quality string
  const getComprehensionQuality = (percentage) => {
    if (percentage >= 90) return "Full";
    if (percentage >= 70) return "Good";
    if (percentage >= 50) return "Moderate";
    if (percentage > 0) return "Poor";
    return "None";
  };

  // Helper function to get speed efficiency string
  const getSpeedEfficiency = (time, ageGroup) => {
    if (ageGroup === '9-10') {
      if (time <= 20) return "Normal/Fast";
      if (time <= 30) return "Slow";
      return "Very Slow";
    } else {
      if (time <= 15) return "Normal/Fast";
      if (time <= 30) return "Slow";
      return "Very Slow";
    }
  };

  const handleSubmit = () => {
    // Calculate recall percentage
    const recalledTextLower = recalledText.toLowerCase();
    let recalledDetailsCount = 0;
    
    // Check each key detail to see if it was recalled
    currentStory.keyDetails.forEach(detail => {
        const detailWords = detail.toLowerCase().split(' ');
        if (detailWords.every(word => recalledTextLower.includes(word))) {
            recalledDetailsCount++;
        }
    });

    // Calculate recall score (1-5)
    const recallPercentage = (recalledDetailsCount / currentStory.keyDetails.length) * 100;
    const recallScore = getRecallScore(recallPercentage);

    // Track consecutive failures for test completion
    let updatedFailures = consecutiveFailures;
    if (recallScore === 1) {
        updatedFailures = consecutiveFailures + 1;
        setConsecutiveFailures(updatedFailures);
    } else {
        updatedFailures = 0;
        setConsecutiveFailures(0);
    }

    // Calculate comprehension score
    let correctComprehensionCount = 0;
    currentStory.comprehensionQuestions.forEach((q, index) => {
        if (comprehensionAnswers[index] === q.answer) correctComprehensionCount++;
    });
    const comprehensionPercentage = (correctComprehensionCount / currentStory.comprehensionQuestions.length) * 100;
    const comprehensionAdjustment = getComprehensionAdjustment(comprehensionPercentage);
    const comprehensionQuality = getComprehensionQuality(comprehensionPercentage);

    // Get speed adjustment based on age group
    const speedAdjustment = getSpeedAdjustment(processingTime, ageGroup);
    const speedEfficiency = getSpeedEfficiency(processingTime, ageGroup);
    
    // Calculate final rating with all adjustments
    const finalRating = getFinalRating(recallScore, comprehensionAdjustment, speedAdjustment);

    const storyResult = {
        storyId: currentStory.id,
        level: currentStory.level,
        recall: { 
          score: recallScore, 
          percentage: Math.round(recallPercentage) 
        },
        comprehension: { 
          adjustment: comprehensionAdjustment, 
          quality: comprehensionQuality,
          percentage: Math.round(comprehensionPercentage)
        },
        speed: { 
          adjustment: speedAdjustment, 
          efficiency: speedEfficiency,
          time: parseFloat(processingTime.toFixed(2))
        },
        finalRating: finalRating
    };
    setAllStoryResults(prev => [...prev, storyResult]);

    if (currentStoryIndex < filteredStories.length - 1 && updatedFailures < 2) {
        setCurrentStoryIndex(prev => prev + 1);
        setRecalledText('');
        setComprehensionAnswers({});
        setProcessingTime(0);
        setTimer(null);
        setGameState('instructions');
    } else {
        setGameState('results');
    }
  };

  const renderAgeSelect = () => (
    <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Select Age Group</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">This will tailor the stories to the appropriate level.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => handleAgeSelect('9-10')} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xl font-semibold shadow-lg">
              9 - 10 years
          </button>
          <button onClick={() => handleAgeSelect('11-13')} className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xl font-semibold shadow-lg">
              11 - 13 years
          </button>
        </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Listening Recall Test</h2>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-4">You will hear a short story. Listen carefully. After it finishes, you will be asked to recall as many details as you can and answer some questions about it.</p>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">This is story {currentStoryIndex + 1} of {filteredStories.length} (Level {currentStory.level}).</p>
      <button onClick={startListening} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
        Start Listening
      </button>
    </div>
  );

  const renderListening = () => (
      <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4 animate-pulse">
            {isGeneratingAudio ? 'Generating Audio...' : 'Now Speaking...'}
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{currentStory.text}</p>
      </div>
  );

  const renderRecallAndComprehension = () => (
      <div className="w-full max-w-3xl mx-auto">
          <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Recall Details</h3>
              <p className="text-center text-gray-400 mb-4">Type everything you can remember from the story below.</p>
              <textarea
                value={recalledText}
                onChange={(e) => {
                    handleInteractionStart();
                    setRecalledText(e.target.value);
                }}
                className="w-full h-40 p-4 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                placeholder="Start typing here..."
              />
          </div>
          <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Answer Questions</h3>
              {currentStory.comprehensionQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-gray-700 p-4 rounded-lg mb-4">
                      <p className="text-lg text-gray-200 mb-3">{q.question}</p>
                      <div className="flex flex-col space-y-2">
                          {q.options.map((opt, oIndex) => (
                              <label key={oIndex} className={`p-3 rounded-lg cursor-pointer transition-colors ${comprehensionAnswers[qIndex] === opt ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                  <input 
                                    type="radio" 
                                    name={`question-${qIndex}`} 
                                    value={opt}
                                    checked={comprehensionAnswers[qIndex] === opt}
                                    onChange={() => handleComprehensionChange(qIndex, opt)}
                                    className="hidden"
                                  />
                                  {opt}
                              </label>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
          <div className="text-center">
              <button onClick={handleSubmit} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xl font-semibold shadow-lg">
                  Submit & Continue
              </button>
          </div>
      </div>
  );

  const renderResultsScreen = () => {
      if (allStoryResults.length === 0) return <div className="text-white">Calculating final results...</div>;
      
      const overallAverage = allStoryResults.reduce((sum, result) => sum + result.finalRating, 0) / allStoryResults.length;

      return (
          <div className="w-full text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Final Listening Recall Profile</h2>
              
              <div className="bg-gray-800 p-4 rounded-xl mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-3">Level</th>
                                <th scope="col" className="px-4 py-3">Recall</th>
                                <th scope="col" className="px-4 py-3">Comprehension</th>
                                <th scope="col" className="px-4 py-3">Speed</th>
                                <th scope="col" className="px-4 py-3">Calculation</th>
                                <th scope="col" className="px-4 py-3">Final Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allStoryResults.map((res, index) => (
                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-600">
                                    <td className="px-4 py-4 font-medium text-white">{res.level}</td>
                                    <td className="px-4 py-4">
                                      <div className="font-medium">{res.recall.score}</div>
                                      <div className="text-xs text-gray-400">({res.recall.percentage}%)</div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="font-medium">{res.comprehension.quality}</div>
                                      <div className="text-xs text-gray-400">
                                        {res.comprehension.adjustment !== 0 && 
                                          `(${res.comprehension.adjustment > 0 ? '+' : ''}${res.comprehension.adjustment})`
                                        }
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="font-medium">{res.speed.efficiency}</div>
                                      <div className="text-xs text-gray-400">
                                        {res.speed.adjustment !== 0 && 
                                          `(${res.speed.adjustment > 0 ? '+' : ''}${res.speed.adjustment})`
                                        }
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-400">
                                      <div className="mb-1">
                                        <span className="font-medium">Recall:</span> {res.recall.score}
                                      </div>
                                      <div className="mb-1">
                                        <span className="font-medium">Comp:</span> {res.comprehension.adjustment}
                                      </div>
                                      <div>
                                        <span className="font-medium">Speed:</span> {res.speed.adjustment}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold text-lg text-emerald-400">{res.finalRating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>

              <div className="bg-indigo-800 p-6 rounded-xl mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-2">Overall Average Rating</h3>
                  <p className="text-6xl font-bold text-white">{overallAverage.toFixed(1)} <span className="text-4xl text-gray-300">/ 5</span></p>
              </div>
              <div className="flex justify-center space-x-4">
                <button onClick={() => {
                    setCurrentStoryIndex(0);
                    setAllStoryResults([]);
                    setGameState('age_select');
                }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md">
                    Play Again
                </button>
              </div>
          </div>
      );
  }

  const renderContent = () => {
    switch (gameState) {
      case 'age_select': return renderAgeSelect();
      case 'instructions': return renderInstructions();
      case 'listening': return renderListening();
      case 'recall': return renderRecallAndComprehension();
      case 'results': return renderResultsScreen();
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
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 flex-grow text-center">Listening Recall Test</h1>
        <div className="w-24 sm:w-32"></div> {/* Spacer for alignment */}
      </div>
      <div className="bg-gray-800 p-6 sm:p-8 rounded-xl min-h-[450px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
}
