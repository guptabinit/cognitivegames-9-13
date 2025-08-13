import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Game6.css';

// --- DATA SETUP ---
const stories = [
    // Emotion Story 1
    {
        id: 1,
        type: 'emotion',
        text: "Sarah practiced for weeks for the piano recital. When she got on stage, she saw how many people were in the audience and her hands started to shake. She was worried she would forget the notes.",
        comprehension: { question: "What was Sarah worried about?", options: ["The audience being too loud", "Forgetting the notes", "The piano being out of tune"], answer: "Forgetting the notes" },
        intensity: { expertMin: 3, expertMax: 5 }, // Anxiety
        reasoning: { question: "Why were Sarah's hands shaking?", options: ["She was cold", "She was nervous about performing", "She hadn't practiced enough"], inferentialAnswer: "She was nervous about performing" }
    },
    // Strange Story 1 (Sarcasm)
    {
        id: 2,
        type: 'strange',
        text: "A boy was looking at a horse in a field. The horse was very old and thin. A man came up to him and said, 'That's a fine horse, isn't it?' The man was not trying to sell the horse.",
        comprehension: { question: "Was the horse actually a 'fine horse'?", options: ["Yes, it was in great shape", "No, it was old and thin", "The story doesn't say"], answer: "No, it was old and thin" },
        reasoning: { question: "Why did the man say that?", options: ["He was just being friendly", "He was making a joke or being sarcastic", "He didn't know much about horses"], inferentialAnswer: "He was making a joke or being sarcastic" }
    },
    // Emotion Story 2
    {
        id: 3,
        type: 'emotion',
        text: "Tom's dog, Buddy, had been missing for three days. Tom put up posters all over town. This afternoon, he heard a bark at the door and saw Buddy wagging his tail.",
        comprehension: { question: "What happened this afternoon?", options: ["Tom got a new dog", "Tom found his missing dog, Buddy", "Tom put up more posters"], answer: "Tom found his missing dog, Buddy" },
        intensity: { expertMin: 4, expertMax: 5 }, // Joy/Relief
        reasoning: { question: "How did Tom likely feel when he saw Buddy?", options: ["Annoyed that the dog was loud", "Sad that the dog was gone", "Overjoyed and relieved"], inferentialAnswer: "Overjoyed and relieved" }
    },
    // Emotion Story 3
    {
        id: 4,
        type: 'emotion',
        text: "Lily built a tall tower out of blocks. Her little brother ran into the room and knocked it all down on purpose. Lily's face turned red and she clenched her fists.",
        comprehension: { question: "What did Lily's brother do?", options: ["He helped her build the tower", "He accidentally knocked it down", "He knocked it down on purpose"], answer: "He knocked it down on purpose" },
        intensity: { expertMin: 4, expertMax: 5 }, // Anger
        reasoning: { question: "Why did Lily's face turn red?", options: ["She was embarrassed", "She was very angry with her brother", "She was running a fever"], inferentialAnswer: "She was very angry with her brother" }
    },
    // Strange Story 2 (Lie)
    {
        id: 5,
        type: 'strange',
        text: "A burglar who had just robbed a shop is making his getaway. As he is running home, a policeman on his beat sees him drop his glove. He doesn't know the man is a burglar. He just wants to tell him he has dropped his glove. But when the policeman shouts 'Hey, you! Stop!', the burglar turns round, puts his hands up, and says, 'I give up. It's a fair cop.'",
        comprehension: { question: "Did the policeman know the man was a burglar?", options: ["Yes, he was chasing him", "No, he just saw him drop a glove", "The story doesn't say"], answer: "No, he just saw him drop a glove" },
        reasoning: { question: "Why did the burglar give himself up?", options: ["He was tired of running", "He thought the policeman had caught him for the robbery", "The policeman told him to"], inferentialAnswer: "He thought the policeman had caught him for the robbery" }
    },
    // Emotion Story 4
    {
        id: 6,
        type: 'emotion',
        text: "It was Leo's birthday, but all his friends were busy and couldn't come to his party. He sat alone in his decorated room, looking at the cake his mom had made.",
        comprehension: { question: "Why was Leo alone?", options: ["He wanted to be alone", "His friends were busy", "His party was the next day"], answer: "His friends were busy" },
        intensity: { expertMin: 3, expertMax: 5 }, // Sadness
        reasoning: { question: "How was Leo likely feeling?", options: ["Excited for his party", "Angry at his mom", "Sad and lonely"], inferentialAnswer: "Sad and lonely" }
    },
    // Emotion Story 5
    {
        id: 7,
        type: 'emotion',
        text: "During the class presentation, a student suddenly forgot his lines. He looked at his teacher, who gave him a small, encouraging nod. The student took a deep breath and remembered what to say.",
        comprehension: { question: "What did the teacher do?", options: ["She told him the lines", "She gave him an encouraging nod", "She told him to sit down"], answer: "She gave him an encouraging nod" },
        intensity: { expertMin: 2, expertMax: 4 }, // Gratitude/Relief
        reasoning: { question: "How did the teacher's nod help?", options: ["It reminded him of the words", "It gave him the confidence to remember", "It distracted the class"], inferentialAnswer: "It gave him the confidence to remember" }
    },
    // Strange Story 3 (Misunderstanding)
    {
        id: 8,
        type: 'strange',
        text: "A little boy is very sad because his puppy has died. His older sister tries to comfort him and says, 'Don't worry, he's gone to heaven.' The little boy is still very upset and says, 'What would he do in heaven? He'd chase the angels and bark all day!'",
        comprehension: { question: "Why is the little boy sad?", options: ["His sister is being mean", "His puppy died", "He wants to go to heaven"], answer: "His puppy died" },
        reasoning: { question: "Why is the boy worried about his puppy in heaven?", options: ["He doesn't believe in heaven", "He thinks his puppy will cause trouble", "He wants his puppy to be alone"], inferentialAnswer: "He thinks his puppy will cause trouble" }
    },
    // Emotion Story 6
    {
        id: 9,
        type: 'emotion',
        text: "Maria saw a new student sitting alone at lunch. She remembered how it felt to be new, so she walked over, smiled, and asked if she could sit with him.",
        comprehension: { question: "What did Maria do?", options: ["She ignored the new student", "She invited the new student to sit with her", "She told the teacher about him"], answer: "She invited the new student to sit with her" },
        intensity: { expertMin: 2, expertMax: 4 }, // Empathy/Kindness
        reasoning: { question: "Why did Maria invite him to sit?", options: ["She had nowhere else to sit", "She knew what it felt like to be new and wanted to be kind", "Her friends told her to"], inferentialAnswer: "She knew what it felt like to be new and wanted to be kind" }
    },
    // Emotion Story 7
    {
        id: 10,
        type: 'emotion',
        text: "On the last day of camp, all the friends were saying goodbye. They promised to write letters and hugged each other tightly, even though they were smiling.",
        comprehension: { question: "What were the friends doing?", options: ["Arriving at camp", "Arguing with each other", "Saying goodbye"], answer: "Saying goodbye" },
        intensity: { expertMin: 3, expertMax: 5 }, // Bittersweet/Sadness
        reasoning: { question: "Why might they be both smiling and sad?", options: ["They were happy the camp was over", "They were happy for the memories but sad to leave", "They were pretending to be sad"], inferentialAnswer: "They were happy for the memories but sad to leave" }
    },
    // Strange Story 4 (Figure of Speech)
    {
        id: 11,
        type: 'strange',
        text: "During a play, the princess is suffering from a terrible curse. The prince's mother says to her son, 'She has a broken heart! Only a prince's kiss can mend it.'",
        comprehension: { question: "What does the prince's mother say the princess has?", options: ["A broken arm", "A broken heart", "A cold"], answer: "A broken heart" },
        reasoning: { question: "What does 'a broken heart' mean here?", options: ["Her heart is physically broken", "She is very, very sad", "She needs to see a doctor"], inferentialAnswer: "She is very, very sad" }
    },
    // Emotion Story 8
    {
        id: 12,
        type: 'emotion',
        text: "A firefighter carefully climbed a tall ladder to rescue a cat from a high branch. When he brought it down safely, the cat's owner cried and thanked him over and over.",
        comprehension: { question: "What did the firefighter rescue?", options: ["A dog", "A bird", "A cat"], answer: "A cat" },
        intensity: { expertMin: 4, expertMax: 5 }, // Gratitude
        reasoning: { question: "Why was the owner crying?", options: ["She was scared of the firefighter", "She was incredibly thankful and relieved", "The cat had scratched her"], inferentialAnswer: "She was incredibly thankful and relieved" }
    }
];

// --- SCORING LOGIC ---
const getComprehensionScore = (correctCount) => {
    if (correctCount >= 11) return 5;
    if (correctCount >= 9) return 4;
    if (correctCount >= 7) return 3;
    if (correctCount >= 5) return 2;
    return 1;
};

const getIntensityScore = (inRangeCount) => {
    if (inRangeCount === 8) return 5;
    if (inRangeCount >= 6) return 4;
    if (inRangeCount === 5) return 3;
    if (inRangeCount >= 3) return 2;
    return 1;
};

const getReasoningScore = (inferentialCount, ageGroup) => {
    if (ageGroup === '9-10') {
        if (inferentialCount >= 6) return 5;
        if (inferentialCount >= 4) return 4;
        if (inferentialCount === 3) return 3;
        if (inferentialCount === 2) return 2;
        return 1;
    } else { // 11-13
        if (inferentialCount >= 10) return 5;
        if (inferentialCount >= 8) return 4;
        if (inferentialCount >= 6) return 3;
        if (inferentialCount >= 4) return 2;
        return 1;
    }
};

const getMentalizingScore = (correctStrangeCount) => {
    if (correctStrangeCount === 4) return 5;
    if (correctStrangeCount === 3) return 4;
    if (correctStrangeCount === 2) return 3;
    if (correctStrangeCount === 1) return 2;
    return 1;
};

// --- MAIN GAME COMPONENT ---
export default function Game6({ player, onGoBack }) {
    const [gameState, setGameState] = useState('age_select'); // age_select, instructions, playing, results
    const [ageGroup, setAgeGroup] = useState(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [finalScores, setFinalScores] = useState(null);

    const currentStory = stories[storyIndex];

    const handleAgeSelect = (selectedAgeGroup) => {
        setAgeGroup(selectedAgeGroup);
        setGameState('instructions');
    };

    const handleAnswerChange = (part, value) => {
        setAnswers(prev => ({
            ...prev,
            [currentStory.id]: {
                ...prev[currentStory.id],
                [part]: value
            }
        }));
    };

    const nextStory = () => {
        if (storyIndex < stories.length - 1) {
            setStoryIndex(prev => prev + 1);
        } else {
            calculateFinalScores();
            setGameState('results');
        }
    };

    const saveResults = async (scores) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/saveGame6Results.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player: {
                        nickname: localStorage.getItem('playerName') || 'Anonymous',
                        avatar: localStorage.getItem('playerAvatar') || 'default'
                    },
                    ageGroup: ageGroup,
                    answers: stories.map(story => {
                        const userAnswer = answers[story.id] || {};
                        return {
                            storyId: story.id,
                            comprehension: userAnswer.comprehension || '',
                            intensity: userAnswer.intensity || null,
                            reasoning: userAnswer.reasoning || '',
                            isCorrectComprehension: userAnswer.comprehension === story.comprehension.answer,
                            isCorrectReasoning: userAnswer.reasoning === (story.reasoning?.inferentialAnswer || story.reasoning?.answer || ''),
                            isInRange: story.type === 'emotion' && userAnswer.intensity && 
                                      userAnswer.intensity >= story.intensity.expertMin && 
                                      userAnswer.intensity <= story.intensity.expertMax
                        };
                    }),
                    scores: {
                        comprehension: {
                            raw: scores.comprehension.raw,
                            score: scores.comprehension.score
                        },
                        intensity: {
                            raw: scores.intensity.raw,
                            score: scores.intensity.score
                        },
                        reasoning: {
                            raw: scores.reasoning.raw,
                            score: scores.reasoning.score
                        },
                        mentalizing: {
                            raw: scores.mentalizing.raw,
                            score: scores.mentalizing.score
                        },
                        finalScore: scores.finalScore,
                        finalRating: scores.finalRating
                    }
                })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                toast.success('Results saved successfully!');
            } else {
                console.error('Failed to save results:', data.message);
                toast.error('Failed to save results. Please try again.');
            }
        } catch (error) {
            console.error('Error saving results:', error);
            toast.error('An error occurred while saving results.');
        }
    };

    const calculateFinalScores = () => {
        let correctComprehension = 0;
        let intensityInRange = 0;
        let inferentialReasoning = 0;
        let correctMentalizing = 0;

        stories.forEach(story => {
            const userAnswer = answers[story.id] || {};
            // Comprehension
            if (userAnswer.comprehension === story.comprehension.answer) {
                correctComprehension++;
            }
            // Reasoning & Mentalizing
            if (userAnswer.reasoning === story.reasoning.inferentialAnswer) {
                inferentialReasoning++;
                if (story.type === 'strange') {
                    correctMentalizing++;
                }
            }
            // Intensity
            if (story.type === 'emotion') {
                const userIntensity = parseInt(userAnswer.intensity, 10);
                if (userIntensity >= story.intensity.expertMin && userIntensity <= story.intensity.expertMax) {
                    intensityInRange++;
                }
            }
        });

        const comprehensionScore = getComprehensionScore(correctComprehension);
        const intensityScore = getIntensityScore(intensityInRange);
        const reasoningScore = getReasoningScore(inferentialReasoning, ageGroup);
        const mentalizingScore = getMentalizingScore(correctMentalizing);

        const finalScore = (comprehensionScore * 0.4) + (intensityScore * 0.25) + (reasoningScore * 0.2) + (mentalizingScore * 0.15);
        
        let rating = "Poor";
        if (finalScore >= 4.5) rating = "Excellent";
        else if (finalScore >= 3.5) rating = "Above Average";
        else if (finalScore >= 2.5) rating = "Average";
        else if (finalScore >= 1.5) rating = "Below Average";

        setFinalScores({
            comprehension: { raw: correctComprehension, score: comprehensionScore },
            intensity: { raw: intensityInRange, score: intensityScore },
            reasoning: { raw: inferentialReasoning, score: reasoningScore },
            mentalizing: { raw: correctMentalizing, score: mentalizingScore },
            finalScore: finalScore.toFixed(2),
            rating: rating
        });
    };

    const renderAgeSelect = () => (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Select Age Group</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">This will adjust the scoring criteria for reasoning.</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Social Cognition Test</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">You will read 12 short stories. After each one, you will answer questions about what happened and why. Read carefully.</p>
            <button onClick={() => setGameState('playing')} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
                Begin Test
            </button>
        </div>
    );

    const renderStory = () => {
        const userAnswer = answers[currentStory.id] || {};
        return (
            <div className="w-full max-w-3xl mx-auto">
                <p className="text-sm text-gray-400 mb-2 text-center">Story {storyIndex + 1} of {stories.length}</p>
                <div className="bg-gray-800 p-6 rounded-xl mb-6">
                    <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{currentStory.text}</p>
                </div>

                {/* Comprehension */}
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-lg text-gray-200 mb-3">{currentStory.comprehension.question}</p>
                    <div className="flex flex-col space-y-2">
                        {currentStory.comprehension.options.map((opt, oIndex) => (
                            <label key={oIndex} className={`p-3 rounded-lg cursor-pointer transition-colors ${userAnswer.comprehension === opt ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                <input type="radio" name={`comprehension-${currentStory.id}`} value={opt} checked={userAnswer.comprehension === opt} onChange={() => handleAnswerChange('comprehension', opt)} className="hidden" />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Intensity */}
                {currentStory.type === 'emotion' && (
                    <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <p className="text-lg text-gray-200 mb-3">How strong is the main emotion? (1=very weak, 5=very strong)</p>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-400">1</span>
                            <input type="range" min="1" max="5" step="1" value={userAnswer.intensity || '3'} onChange={(e) => handleAnswerChange('intensity', e.target.value)} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                            <span className="text-gray-400">5</span>
                             <span className="font-bold text-white text-xl w-8">{userAnswer.intensity || '3'}</span>
                        </div>
                    </div>
                )}

                {/* Reasoning */}
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                    <p className="text-lg text-gray-200 mb-3">{currentStory.reasoning.question}</p>
                     <div className="flex flex-col space-y-2">
                        {currentStory.reasoning.options.map((opt, oIndex) => (
                            <label key={oIndex} className={`p-3 rounded-lg cursor-pointer transition-colors ${userAnswer.reasoning === opt ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                <input type="radio" name={`reasoning-${currentStory.id}`} value={opt} checked={userAnswer.reasoning === opt} onChange={() => handleAnswerChange('reasoning', opt)} className="hidden" />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={nextStory} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
                        {storyIndex < stories.length - 1 ? "Next Story" : "Finish Test"}
                    </button>
                </div>
            </div>
        );
    };

    const renderResults = () => {
        if (!finalScores) return <div className="text-white">Calculating...</div>;
        
        const ScoreRow = ({ label, raw, score, weight }) => (
            <tr className="border-b border-gray-700">
                <td className="px-4 py-3 font-medium text-white">{label}</td>
                <td className="px-4 py-3 text-gray-300">{raw}</td>
                <td className="px-4 py-3 text-gray-300">{score}</td>
                <td className="px-4 py-3 text-gray-300">{weight}%</td>
                <td className="px-4 py-3 font-bold text-emerald-400">{(score * (weight / 100)).toFixed(2)}</td>
            </tr>
        );

        return (
            <div className="w-full text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Social Cognition Profile</h2>
                <div className="bg-gray-800 p-4 rounded-xl mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Component</th>
                                    <th className="px-4 py-3">Raw Score</th>
                                    <th className="px-4 py-3">Scaled Score (1-5)</th>
                                    <th className="px-4 py-3">Weight</th>
                                    <th className="px-4 py-3">Weighted Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <ScoreRow label="Comprehension" raw={`${finalScores.comprehension.raw}/12`} score={finalScores.comprehension.score} weight={40} />
                                <ScoreRow label="Intensity Accuracy" raw={`${finalScores.intensity.raw}/8`} score={finalScores.intensity.score} weight={25} />
                                <ScoreRow label="Reasoning Quality" raw={`${finalScores.reasoning.raw}/12`} score={finalScores.reasoning.score} weight={20} />
                                <ScoreRow label="Mentalizing" raw={`${finalScores.mentalizing.raw}/4`} score={finalScores.mentalizing.score} weight={15} />
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-indigo-800 p-6 rounded-xl mb-8">
                    <h3 className="text-2xl font-semibold text-white mb-2">Final Weighted Score</h3>
                    <p className="text-6xl font-bold text-white">{finalScores.finalScore}</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-2">{finalScores.rating}</p>
                </div>
                
                <div className="flex justify-center space-x-4">
                    <button onClick={() => {
                        setGameState('age_select');
                        setStoryIndex(0);
                        setAnswers({});
                        setFinalScores(null);
                        saveResults(finalScores);
                    }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-md">
                        Play Again
                    </button>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (gameState) {
            case 'age_select': return renderAgeSelect();
            case 'instructions': return renderInstructions();
            case 'playing': return renderStory();
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
                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 flex-grow text-center">Social Cognition Test</h1>
                <div className="w-24 sm:w-32"></div>
            </div>
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl min-h-[450px] flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
}
