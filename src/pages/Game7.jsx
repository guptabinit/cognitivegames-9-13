import React, { useState, useEffect } from 'react';

// --- DATA SETUP ---
// Vignettes with questions and keywords for automated short answer scoring
const vignettes = [
    {
        id: 1,
        text: "Leo was excited to show his mom the clay pot he made in art class. As he was running home, he tripped and the pot shattered on the sidewalk.",
        questions: {
            '9-10': {
                feeling: { q: "How does Leo probably feel?", a: "Sad and disappointed", o: ["Happy", "Angry", "Sad and disappointed"] },
                helpful: { q: "What would be a helpful thing to say?", a: "It's okay, we can try to fix it or make a new one.", o: ["You should have been more careful.", "It's just a silly pot.", "It's okay, we can try to fix it or make a new one."] },
                cope: { q: "What could Leo do to feel better?", a: "Tell his mom what happened and get a hug.", o: ["Hide the broken pieces.", "Blame someone else.", "Tell his mom what happened and get a hug."] },
                kindness: { q: "Does this sound kind? 'It was an accident. I'm sorry that happened.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What is the main emotion Leo is likely experiencing?", a: "Disappointment", o: ["Anger", "Embarrassment", "Disappointment"] },
                helpful: { q: "What is the most empathetic response?", a: "Oh no, you must be so upset after all your hard work.", o: ["Don't worry about it.", "You're too clumsy.", "Oh no, you must be so upset after all your hard work."] },
                cope: { q: "What's a healthy way for Leo to handle this?", a: "Take a moment to be sad, then talk about it.", o: ["Pretend it doesn't matter.", "Yell in frustration.", "Take a moment to be sad, then talk about it."] },
                kindness: { q: "Is this a supportive statement? 'I know how much that meant to you. I'm here for you.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["fix", "make another", "new one", "hug", "accident", "together"],
            onePoint: ["sorry", "okay", "help"]
        }
    },
    {
        id: 2,
        text: "During lunch, Maya saw a new student sitting all alone. None of the other kids were talking to her.",
        questions: {
             '9-10': {
                feeling: { q: "How might the new student feel?", a: "Lonely", o: ["Excited", "Lonely", "Angry"] },
                helpful: { q: "What could Maya do to help?", a: "Ask the new student to sit with her and her friends.", o: ["Ignore her.", "Point at her.", "Ask the new student to sit with her and her friends."] },
                cope: { q: "What could the new student do?", a: "Smile at someone and say hi.", o: ["Hide in the bathroom.", "Smile at someone and say hi.", "Wait for someone to talk to her."] },
                kindness: { q: "Does this sound kind? 'It's okay to feel shy. My name is Maya.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What emotion is the new student likely feeling?", a: "Isolated and anxious", o: ["Peaceful", "Isolated and anxious", "Confident"] },
                helpful: { q: "What is a prosocial action Maya could take?", a: "Introduce herself and ask the student about her interests.", o: ["Assume the student wants to be alone.", "Talk about the student with her friends.", "Introduce herself and ask the student about her interests."] },
                cope: { q: "What's a proactive step the new student could take?", a: "Find a club or group that shares her hobbies.", o: ["Wait until someone notices her.", "Find a club or group that shares her hobbies.", "Decide she doesn't like this school."] },
                kindness: { q: "Is this a supportive statement? 'Being new can be tough. Do you want to hang out with us?'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["sit with", "join us", "introduce", "ask her name", "play with"],
            onePoint: ["talk to", "be nice", "say hi"]
        }
    },
    {
        id: 3,
        text: "Sam's best friend promised to come over to play, but then called to say he was going to a movie with someone else instead.",
        questions: {
            '9-10': {
                feeling: { q: "How does Sam probably feel?", a: "Hurt and left out", o: ["Happy", "Hurt and left out", "Tired"] },
                helpful: { q: "What's a helpful thing for Sam's parent to say?", a: "I can see you're upset. It's okay to feel that way.", o: ["You have other friends.", "I can see you're upset. It's okay to feel that way.", "Forget about him."] },
                cope: { q: "What could Sam do to feel better?", a: "Do a fun activity he enjoys.", o: ["Do a fun activity he enjoys.", "Send an angry text.", "Sit in his room all day."] },
                kindness: { q: "Does this sound kind? 'Your feelings are valid.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What is Sam likely feeling?", a: "Betrayed and rejected", o: ["Indifferent", "Confused", "Betrayed and rejected"] },
                helpful: { q: "What's an empathetic response?", a: "That sounds really hurtful. I'm sorry that happened.", o: ["That sounds really hurtful. I'm sorry that happened.", "Well, sometimes plans change.", "You should find a new best friend."] },
                cope: { q: "What's a mature way for Sam to handle this?", a: "Talk to his friend about how it made him feel later on.", o: ["Post something mean online.", "Talk to his friend about how it made him feel later on.", "Give his friend the silent treatment."] },
                kindness: { q: "Is this a supportive statement? 'It's understandable why you'd feel let down.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["something else", "another friend", "fun activity", "play a game"],
            onePoint: ["comfort", "talk", "listen"]
        }
    },
    {
        id: 4,
        text: "A teacher handed back a test, and Chloe saw she got a much lower grade than she expected, even though she studied hard.",
        questions: {
            '9-10': {
                feeling: { q: "How does Chloe probably feel?", a: "Disappointed", o: ["Proud", "Disappointed", "Silly"] },
                helpful: { q: "What could a friend say?", a: "You studied really hard, sometimes tests are just tricky.", o: ["I got a better grade than you.", "You studied really hard, sometimes tests are just tricky.", "Maybe you're not good at this subject."] },
                cope: { q: "What could Chloe do?", a: "Ask the teacher how she can improve for next time.", o: ["Crumple up the test.", "Ask the teacher how she can improve for next time.", "Cry and give up."] },
                kindness: { q: "Does this sound kind? 'Your effort is what matters most.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What is Chloe likely feeling?", a: "Frustrated and discouraged", o: ["Frustrated and discouraged", "Angry at the teacher", "Relieved"] },
                helpful: { q: "What's an empathetic response?", a: "That's so frustrating when you study hard and don't get the grade you want.", o: ["At least you didn't fail.", "That's so frustrating when you study hard and don't get the grade you want.", "You probably didn't study the right things."] },
                cope: { q: "What's a constructive action for Chloe to take?", a: "Review the test to understand her mistakes.", o: ["Complain to her friends.", "Forget about the test.", "Review the test to understand her mistakes."] },
                kindness: { q: "Is this a supportive statement? 'One test doesn't define your intelligence.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["study together", "ask teacher", "improve", "understand mistakes"],
            onePoint: ["don't worry", "it's okay", "cheer up"]
        }
    },
    {
        id: 5,
        text: "During a soccer game, a player named Alex missed a final shot that would have won the game. Some of his teammates groaned.",
        questions: {
            '9-10': {
                feeling: { q: "How does Alex probably feel?", a: "Upset with himself", o: ["Happy", "Upset with himself", "Bored"] },
                helpful: { q: "What could the coach say?", a: "It was a tough shot. We win and lose as a team.", o: ["You lost us the game.", "It was a tough shot. We win and lose as a team.", "Don't play next time."] },
                cope: { q: "What could Alex do?", a: "Remember it's just a game and practice for next time.", o: ["Quit the team.", "Yell at his teammates.", "Remember it's just a game and practice for next time."] },
                kindness: { q: "Does this sound kind? 'We're all part of the same team.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What is Alex likely feeling?", a: "Guilty and embarrassed", o: ["Guilty and embarrassed", "Angry at the other team", "Indifferent"] },
                helpful: { q: "What could a supportive teammate do?", a: "Pat him on the back and say 'Don't worry about it, we'll get them next time.'", o: ["Tell everyone it was Alex's fault.", "Pat him on the back and say 'Don't worry about it, we'll get them next time.'", "Say nothing."] },
                cope: { q: "How can Alex handle the feeling of letting his team down?", a: "Focus on what he can control, like his effort in the next practice.", o: ["Blame the goalie.", "Focus on what he can control, like his effort in the next practice.", "Avoid his teammates after the game."] },
                kindness: { q: "Is this a supportive statement? 'That one shot doesn't erase all the good plays you made.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["practice", "next time", "good plays", "as a team", "tough shot"],
            onePoint: ["it's okay", "don't worry", "cheer up"]
        }
    },
    {
        id: 6,
        text: "Jasmine's grandmother gave her a handmade sweater that was itchy and not her favorite color. Her grandmother asked, 'Do you like it?'",
        questions: {
            '9-10': {
                feeling: { q: "How might Jasmine feel?", a: "Awkward and worried about hurting her grandma's feelings", o: ["Excited", "Awkward and worried about hurting her grandma's feelings", "Angry"] },
                helpful: { q: "What is a kind way to answer?", a: "Thank you so much for making this for me!", o: ["No, I hate it.", "It's ugly.", "Thank you so much for making this for me!"] },
                cope: { q: "What could Jasmine focus on?", a: "The love and effort her grandma put into it.", o: ["How itchy the sweater is.", "The love and effort her grandma put into it.", "How she'll never wear it."] },
                kindness: { q: "Does this sound kind? 'It was so thoughtful of you to make this.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What social dilemma is Jasmine facing?", a: "Honesty vs. Kindness", o: ["Right vs. Wrong", "Honesty vs. Kindness", "Greed vs. Generosity"] },
                helpful: { q: "What's a tactful response?", a: "It's so special that you made this for me. Thank you!", o: ["It's not really my style.", "It's so special that you made this for me. Thank you!", "I'll probably give it away."] },
                cope: { q: "How can Jasmine manage this situation?", a: "Focus on the positive intent behind the gift.", o: ["Focus on the positive intent behind the gift.", "Refuse to accept the gift.", "Tell her grandma her real opinion."] },
                kindness: { q: "Is this a supportive statement? 'The most important part of a gift is the thought behind it.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["thank you", "made this for me", "thoughtful", "love", "effort"],
            onePoint: ["nice", "thanks", "like it"]
        }
    },
    {
        id: 7,
        text: "A group of kids were telling jokes and laughing. When Ben walked over, they all became quiet and looked away.",
        questions: {
            '9-10': {
                feeling: { q: "How does Ben probably feel?", a: "Left out", o: ["Included", "Left out", "Happy"] },
                helpful: { q: "What would be a kind thing for one of the kids to do?", a: "Say, 'Hi Ben, come join us!'", o: ["Say, 'Hi Ben, come join us!'", "Whisper about him.", "Walk away."] },
                cope: { q: "What could Ben do?", a: "Find another friend to play with.", o: ["Yell at them.", "Find another friend to play with.", "Stand there silently."] },
                kindness: { q: "Does this sound kind? 'Hey, what's up?'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What social cue is Ben experiencing?", a: "Exclusion", o: ["Inclusion", "Exclusion", "Confusion"] },
                helpful: { q: "What would be a socially inclusive action?", a: "One of the kids could make eye contact, smile, and invite him into the conversation.", o: ["Everyone could stare at him until he leaves.", "One of the kids could make eye contact, smile, and invite him into the conversation.", "They could pretend he isn't there."] },
                cope: { q: "What's a resilient way for Ben to react?", a: "Recognize the group is being unkind and seek out a more positive interaction elsewhere.", o: ["Assume he did something wrong.", "Demand to know what they were talking about.", "Recognize the group is being unkind and seek out a more positive interaction elsewhere."] },
                kindness: { q: "Is this a supportive statement? 'There's room for one more in our circle.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["join us", "play with", "talk to him", "ask him"],
            onePoint: ["say hi", "be nice"]
        }
    },
    {
        id: 8,
        text: "Anna helped her younger brother finish a difficult puzzle. He was very proud and showed their parents, saying he did it all by himself.",
        questions: {
            '9-10': {
                feeling: { q: "How might Anna feel?", a: "A little sad he didn't mention her help", o: ["Angry", "A little sad he didn't mention her help", "Happy"] },
                helpful: { q: "What could Anna do?", a: "Feel proud for helping him, even if he didn't say so.", o: ["Tattletale to their parents.", "Feel proud for helping him, even if he didn't say so.", "Never help him again."] },
                cope: { q: "What could Anna remember?", a: "That helping others feels good on its own.", o: ["That her brother is ungrateful.", "That helping others feels good on its own.", "That she should always get credit."] },
                kindness: { q: "Does this sound kind? 'I'm glad I could help you.'", a: "Yes", o: ["Yes", "No"] }
            },
            '11-13': {
                feeling: { q: "What mixed emotions might Anna be feeling?", a: "Pride in her brother's success but hurt by the lack of credit", o: ["Anger and jealousy", "Pride in her brother's success but hurt by the lack of credit", "Indifference and boredom"] },
                helpful: { q: "What's a mature way for Anna to handle this?", a: "Let her brother have his moment of pride and talk to him about it later if it still bothers her.", o: ["Publicly announce that she did most of the work.", "Let her brother have his moment of pride and talk to him about it later if it still bothers her.", "Take the puzzle apart."] },
                cope: { q: "What perspective could Anna take?", a: "Understand that her brother's excitement might have made him forget to mention her.", o: ["Decide her brother is selfish.", "Understand that her brother's excitement might have made him forget to mention her.", "Vow to never help him again."] },
                kindness: { q: "Is this a supportive statement? 'Your happiness is the best thank you.'", a: "Yes", o: ["Yes", "No"] }
            }
        },
        shortAnswerKeywords: {
            twoPoints: ["proud of him", "let him be happy", "feel good for helping"],
            onePoint: ["tell him", "congratulate"]
        }
    }
];

// --- SCORING LOGIC ---
const getLikertScore = (rawScore) => {
    if (rawScore >= 43) return 5;
    if (rawScore >= 36) return 4;
    if (rawScore >= 26) return 3;
    if (rawScore >= 16) return 2;
    return 1;
};

const scoreShortAnswer = (answer, keywords) => {
    if (!answer || answer.trim() === '') return 0;
    const lowerCaseAnswer = answer.toLowerCase();
    if (keywords.twoPoints.some(kw => lowerCaseAnswer.includes(kw))) return 2;
    if (keywords.onePoint.some(kw => lowerCaseAnswer.includes(kw))) return 1;
    return 0;
};

// --- MAIN GAME COMPONENT ---
export default function Game6({ player, onGoBack }) {
    const [gameState, setGameState] = useState('age_select'); // age_select, instructions, playing, results
    const [ageGroup, setAgeGroup] = useState(null);
    const [shuffledVignettes, setShuffledVignettes] = useState([]);
    const [vignetteIndex, setVignetteIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [finalResult, setFinalResult] = useState(null);
    const [startTime, setStartTime] = useState(0);
    const [vignetteTimes, setVignetteTimes] = useState({});

    useEffect(() => {
        setShuffledVignettes(vignettes.sort(() => Math.random() - 0.5));
    }, []);

    const handleAgeSelect = (selectedAgeGroup) => {
        setAgeGroup(selectedAgeGroup);
        setGameState('instructions');
    };

    const startTest = () => {
        setGameState('playing');
        setStartTime(Date.now());
    };

    const handleAnswerChange = (questionType, value) => {
        const currentId = shuffledVignettes[vignetteIndex].id;
        setAnswers(prev => ({
            ...prev,
            [currentId]: {
                ...prev[currentId],
                [questionType]: value
            }
        }));
    };

    const nextVignette = () => {
        const endTime = Date.now();
        const currentId = shuffledVignettes[vignetteIndex].id;
        setVignetteTimes(prev => ({ ...prev, [currentId]: (endTime - startTime) / 1000 }));

        if (vignetteIndex < shuffledVignettes.length - 1) {
            setVignetteIndex(prev => prev + 1);
            setStartTime(Date.now());
        } else {
            calculateFinalScore();
            setGameState('results');
        }
    };
    
    const calculateFinalScore = () => {
        let totalMCQScore = 0;
        let totalShortAnswerScore = 0;

        shuffledVignettes.forEach(vignette => {
            const userAnswers = answers[vignette.id] || {};
            const correctAnswers = vignette.questions[ageGroup];
            
            if (userAnswers.feeling === correctAnswers.feeling.a) totalMCQScore++;
            if (userAnswers.helpful === correctAnswers.helpful.a) totalMCQScore++;
            if (userAnswers.cope === correctAnswers.cope.a) totalMCQScore++;
            if (userAnswers.kindness === correctAnswers.kindness.a) totalMCQScore++;

            const shortAnswerScore = scoreShortAnswer(userAnswers.shortAnswer, vignette.shortAnswerKeywords);
            totalShortAnswerScore += shortAnswerScore;
        });
        
        const rawScore = totalMCQScore + totalShortAnswerScore;
        const likertScore = getLikertScore(rawScore);

        setFinalResult({ rawScore, likertScore, mcq: totalMCQScore, short: totalShortAnswerScore });
    };

    const renderAgeSelect = () => (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Select Age Group</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">This will adjust the questions and scoring expectations.</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Emotional Understanding Test</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">You will read 8 short stories about different situations. After each story, answer the questions that follow. There are no time limits.</p>
            <button onClick={startTest} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
                Begin Test
            </button>
        </div>
    );

    const renderVignette = () => {
        const vignette = shuffledVignettes[vignetteIndex];
        const questions = vignette.questions[ageGroup];
        const userAnswers = answers[vignette.id] || {};

        return (
            <div className="w-full max-w-3xl mx-auto">
                <p className="text-sm text-gray-400 mb-2 text-center">Story {vignetteIndex + 1} of {shuffledVignettes.length}</p>
                <div className="bg-gray-800 p-6 rounded-xl mb-6">
                    <p className="text-lg text-gray-200 leading-relaxed">{vignette.text}</p>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {Object.entries(questions).map(([key, value]) => (
                         <div key={key} className="bg-gray-700 p-4 rounded-lg">
                            <p className="text-lg text-gray-200 mb-3">{value.q}</p>
                            <div className="flex flex-col space-y-2">
                                {value.o.map((opt, oIndex) => (
                                    <label key={oIndex} className={`p-3 rounded-lg cursor-pointer transition-colors ${userAnswers[key] === opt ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>
                                        <input type="radio" name={`${vignette.id}-${key}`} value={opt} checked={userAnswers[key] === opt} onChange={() => handleAnswerChange(key, opt)} className="hidden" />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* Short Answer */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-lg text-gray-200 mb-3">What would you say or do to help the main character?</p>
                        <textarea value={userAnswers.shortAnswer || ''} onChange={(e) => handleAnswerChange('shortAnswer', e.target.value)} className="w-full h-24 p-2 bg-gray-600 text-white rounded-md border border-gray-500 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button onClick={nextVignette} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xl font-semibold shadow-lg">
                        {vignetteIndex < shuffledVignettes.length - 1 ? "Next" : "Finish Test"}
                    </button>
                </div>
            </div>
        );
    };

    const renderResults = () => {
        if (!finalResult) return <div className="text-white">Calculating...</div>;
        return (
             <div className="w-full text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Emotional Understanding Profile</h2>
                <div className="bg-gray-800 p-6 rounded-xl mb-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">MCQ Score:</span>
                        <span className="font-bold text-white">{finalResult.mcq} / 32</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Short Answer Score:</span>
                        <span className="font-bold text-white">{finalResult.short} / 16</span>
                    </div>
                     <div className="flex justify-between items-center text-lg border-t border-gray-600 pt-4">
                        <span className="text-gray-300">Total Raw Score:</span>
                        <span className="font-bold text-white">{finalResult.rawScore} / 48</span>
                    </div>
                </div>
                <div className="bg-indigo-800 p-6 rounded-xl mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-2">Final Rating</h3>
                  <p className="text-6xl font-bold text-white">{finalResult.likertScore} <span className="text-4xl text-gray-300">/ 5</span></p>
                </div>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => {
                        setGameState('age_select');
                        setVignetteIndex(0);
                        setAnswers({});
                        setFinalResult(null);
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
            case 'playing': return renderVignette();
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
                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 flex-grow text-center">Emotional Understanding Test</h1>
                <div className="w-24 sm:w-32"></div>
            </div>
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl min-h-[450px] flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
}
