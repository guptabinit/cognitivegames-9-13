import React, { useState } from 'react';

// Data for the vignettes, questions, and correct answers.
const vignettes = [
  // Sample Vignette
  {
    scenario: "Three friends—Leah, Tara, and Niki—are picking teams for a sports game. Leah wants to pick her classmate for fairness; Tara insists they choose a close friend. Niki just doesn't want to be on the losing team. The rest of the group is watching and waiting for a decision.",
    mcq1: {
      question: "Who is thinking differently about the teams?",
      options: ["Leah", "Tara", "Niki", "All three"],
      correctAnswerIndex: 3,
    },
    mcq2: {
      question: "Which social factor is influencing this situation the most?",
      options: ["Loyalty to friends", "Fairness rules", "Team reputation", "Adult direction"],
      correctAnswerIndex: 1,
    },
    shortAnswerExample: "Leah probably feels stressed about being fair, Tara feels loyal to her friend and maybe worries about hurting feelings, and Niki feels nervous about losing. The group's pressure and rules about fairness make it a tough choice for them all.",
  },
  // Vignette 1
  {
    scenario: "Alex and Sam are building a huge sandcastle. Alex wants to follow a picture in a book, while Sam wants to add a moat and drawbridge they made up. They only have a few buckets and shovels, and their younger sister is waiting to help.",
    mcq1: {
      question: "Who sees the situation differently?",
      options: ["Alex", "Sam", "Their sister", "All three"],
      correctAnswerIndex: 3,
    },
    mcq2: {
      question: "Which social factor most affects this situation?",
      options: ["Group rules", "Adult expectations", "Fairness in sharing", "Sibling rivalry"],
      correctAnswerIndex: 2,
    },
  },
  // Vignette 2
  {
    scenario: "Mia and Chloe are working on a school project together. Mia wants to get it done as fast as possible to play outside. Chloe wants to spend more time on it to make it perfect, even if it means missing recess. They have to decide what to do before the bell rings.",
    mcq1: {
      question: "Who has different priorities?",
      options: ["Mia", "Chloe", "The teacher", "The class"],
      correctAnswerIndex: 1,
    },
    mcq2: {
      question: "Which social factor most affects this situation?",
      options: ["Popularity", "Personal goals", "Adult expectations", "Teamwork and collaboration"],
      correctAnswerIndex: 3,
    },
  },
  // Vignette 3
  {
    scenario: "A group of friends has a secret clubhouse with a strict rule: no one can bring new people without a vote. Leo finds out his new neighbor, who is a little shy, wants to join. Leo wants to let the neighbor in without a vote to be kind, but the rest of the group is worried about breaking their rules.",
    mcq1: {
      question: "Who wants something different?",
      options: ["Leo", "The group", "The neighbor", "Both Leo and the group"],
      correctAnswerIndex: 3,
    },
    mcq2: {
      question: "Which social factor most affects this situation?",
      options: ["Loyalty to a new friend", "Fairness", "Group rules", "Adult direction"],
      correctAnswerIndex: 2,
    },
  },
  // Vignette 4
  {
    scenario: "Two friends, Ethan and James, are arguing over a video game. Ethan thinks he should get the best player because he won the last round. James thinks they should take turns. Their other friends are waiting for them to start playing.",
    mcq1: {
      question: "Who has a different view on how to play the game?",
      options: ["Ethan", "James", "Their friends", "All of them"],
      correctAnswerIndex: 1,
    },
    mcq2: {
      question: "Which social factor most affects this situation?",
      options: ["Popularity", "Fairness", "Peer pressure", "Adult expectations"],
      correctAnswerIndex: 1,
    },
  },
  // Vignette 5
  {
    scenario: "Sophia promised her best friend, Maya, that they would sit together at lunch. But when Sophia gets to the cafeteria, a popular group invites her to join them. Sophia feels torn between her promise to Maya and the chance to sit with a different group.",
    mcq1: {
      question: "Who is in a difficult position?",
      options: ["Sophia", "Maya", "The popular group", "The teacher"],
      correctAnswerIndex: 0,
    },
    mcq2: {
      question: "Which social factor most affects this situation?",
      options: ["Popularity", "Fairness", "Loyalty", "Adult direction"],
      correctAnswerIndex: 2,
    },
  },
  // Vignette 6
  {
    scenario: "It's time to choose the topic for a group project. Two students, Ken and Lisa, have very different ideas. Ken wants to do a detailed report on local history, while Lisa wants to create a video about space exploration. Their group members are trying to decide which idea to pick.",
    mcq1: {
      question: "Who has a different idea for the project?",
      options: ["Ken", "Lisa", "The group members", "Both Ken and Lisa"],
      correctAnswerIndex: 3,
    },
    mcq2: {
      question: "Which social factor most affects this situation?",
      options: ["Adult expectations", "Fairness in a group vote", "Group rules", "Peer pressure"],
      correctAnswerIndex: 1,
    },
  },
];

// Likert conversion functions as per the provided rules
const convertLikertMCQ = (score) => {
  if (score === 6) return 5;
  if (score === 5) return 4;
  if (score >= 3 && score <= 4) return 3;
  if (score === 2) return 2;
  if (score >= 0 && score <= 1) return 1;
  return 0;
};

const convertLikertSA = (score) => {
  if (score >= 11 && score <= 12) return 5;
  if (score >= 8 && score <= 10) return 4;
  if (score >= 6 && score <= 7) return 3;
  if (score >= 3 && score <= 5) return 2;
  if (score >= 0 && score <= 2) return 1;
  return 0;
};

const likertLabels = {
  5: "Excellent",
  4: "Above Average",
  3: "Average",
  2: "Below Average",
  1: "Poor",
};

const Game8 = ({ player, onGoBack }) => {
  const [currentVignetteIndex, setCurrentVignetteIndex] = useState(0);
  const [isSample, setIsSample] = useState(true);
  const [answers, setAnswers] = useState(
    Array(vignettes.length).fill({
      mcq1: null,
      mcq2: null,
      shortAnswer: "",
    })
  );
  const [showReport, setShowReport] = useState(false);

  const handleMcqAnswer = (vignetteIndex, question, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[vignetteIndex] = {
      ...newAnswers[vignetteIndex],
      [question]: optionIndex,
    };
    setAnswers(newAnswers);
  };

  const handleShortAnswer = (vignetteIndex, text) => {
    const newAnswers = [...answers];
    newAnswers[vignetteIndex] = {
      ...newAnswers[vignetteIndex],
      shortAnswer: text,
    };
    setAnswers(newAnswers);
  };

  const saveResults = async (scores) => {
    try {
      const response = await fetch('http://localhost/cognative-games/OGgames/backend/saveGame8Results.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: {
            nickname: player?.nickname || 'Anonymous',
            avatar: player?.avatar || '👤',
          },
          perspective_score: scores.perspectiveScore,
          perspective_rating: likertLabels[convertLikertMCQ(scores.perspectiveScore)],
          social_factor_score: scores.socialFactorScore,
          social_factor_rating: likertLabels[convertLikertMCQ(scores.socialFactorScore)],
        }),
      });

      const data = await response.json();
      if (data.status !== 'success') {
        console.error('Failed to save results:', data.message);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const handleNext = async () => {
    if (isSample) {
      setIsSample(false);
      setCurrentVignetteIndex(1);
    } else {
      if (currentVignetteIndex < vignettes.length - 1) {
        setCurrentVignetteIndex(currentVignetteIndex + 1);
      } else {
        const scores = calculateScores();
        await saveResults(scores);
        setShowReport(true);
      }
    }
  };

  const calculateScores = () => {
    let perspectiveScore = 0;
    let socialFactorScore = 0;

    // Skip the sample vignette (index 0)
    for (let i = 1; i < vignettes.length; i++) {
      if (answers[i]?.mcq1 === vignettes[i].mcq1.correctAnswerIndex) {
        perspectiveScore++;
      }
      if (answers[i]?.mcq2 === vignettes[i].mcq2.correctAnswerIndex) {
        socialFactorScore++;
      }
    }

    return { perspectiveScore, socialFactorScore };
  };

  const renderCurrentVignette = () => {
    const vignetteData = vignettes[currentVignetteIndex];
    const isLastVignette = currentVignetteIndex === vignettes.length - 1;

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isSample ? "Sample Vignette" : `Vignette ${currentVignetteIndex}`}
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
          <p className="text-gray-700 leading-relaxed font-medium">
            {vignetteData.scenario}
          </p>
        </div>

        {/* MCQ 1 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            1. {vignetteData.mcq1.question}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vignetteData.mcq1.options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  handleMcqAnswer(currentVignetteIndex, "mcq1", index)
                }
                className={`py-3 px-4 rounded-lg text-left transition-all duration-200 ease-in-out font-medium
                ${
                  answers[currentVignetteIndex]?.mcq1 === index
                    ? "bg-indigo-600 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800"
                }`}
              >
                {String.fromCharCode(65 + index)}) {option}
              </button>
            ))}
          </div>
        </div>

        {/* MCQ 2 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            2. {vignetteData.mcq2.question}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vignetteData.mcq2.options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  handleMcqAnswer(currentVignetteIndex, "mcq2", index)
                }
                className={`py-3 px-4 rounded-lg text-left transition-all duration-200 ease-in-out font-medium
                ${
                  answers[currentVignetteIndex]?.mcq2 === index
                    ? "bg-indigo-600 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800"
                }`}
              >
                {String.fromCharCode(65 + index)}) {option}
              </button>
            ))}
          </div>
        </div>

        {/* Short Answer */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            3. In your own words, explain how each main character might feel and what social or group factors make the situation harder or easier for them.
          </h3>
          <textarea
            className="w-full p-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors duration-200 ease-in-out text-gray-700"
            rows="5"
            placeholder="Type your explanation here..."
            value={answers[currentVignetteIndex]?.shortAnswer || ""}
            onChange={(e) =>
              handleShortAnswer(currentVignetteIndex, e.target.value)
            }
          ></textarea>
        </div>

        {/* Sample Vignette Specifics */}
        {isSample && (
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-200">
            <h4 className="text-lg font-semibold text-indigo-800 mb-2">
              Sample Answer for Self-Evaluation:
            </h4>
            <p className="text-indigo-700 mb-2">
              Correct MCQ 1 Answer: All three (D)
            </p>
            <p className="text-indigo-700 mb-2">
              Correct MCQ 2 Answer: Fairness rules (B)
            </p>
            <p className="text-indigo-700 font-medium leading-relaxed">
              Example Short Answer (2 points):
            </p>
            <p className="text-indigo-700 italic">
              "{vignetteData.shortAnswerExample}"
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {isLastVignette ? "View Report" : "Next Vignette"}
          </button>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    const { perspectiveScore, socialFactorScore } = calculateScores();
    const perspectiveLikert = convertLikertMCQ(perspectiveScore);
    const socialFactorLikert = convertLikertMCQ(socialFactorScore);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Activity Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Perspective Recognition
            </h3>
            <p className="text-gray-700 text-lg mb-1">
              Score: {perspectiveScore}/6
            </p>
            <p className="text-green-800 text-2xl font-bold">
              {likertLabels[perspectiveLikert]}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (This score is based on your answers to the first multiple-choice question for each of the 6 main vignettes.)
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              Social Factor
            </h3>
            <p className="text-gray-700 text-lg mb-1">
              Score: {socialFactorScore}/6
            </p>
            <p className="text-blue-800 text-2xl font-bold">
              {likertLabels[socialFactorLikert]}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (This score is based on your answers to the second multiple-choice question for each of the 6 main vignettes.)
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 col-span-1 md:col-span-2">
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">
              Integrated Explanation
            </h3>
            <p className="text-gray-700 text-lg mb-1">
              Score: N/A
            </p>
            <p className="text-yellow-800 text-2xl font-bold">
              For Self-Evaluation
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (This part requires a human to evaluate your explanations based on the rubric. Please review the sample answer for a guide.)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center font-[Inter]">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Social & Emotional Context Challenge
          </h1>
          <p className="text-gray-600 text-lg">
            A self-guided activity to practice understanding peer situations.
          </p>
        </header>
        {!showReport ? renderCurrentVignette() : renderReport()}
      </div>
    </div>
  );
};

export default Game8;
