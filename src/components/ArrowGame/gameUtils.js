// Helper function to generate a random arrow sequence and its next arrow
export const generateArrowSequence = (length = 4, complexity = 'medium') => {
  const directions = ['up', 'down', 'left', 'right'];
  let sequence = [];
  let correctNextArrow = '';

  if (complexity === 'simple') {
    // Simple: all same direction or alternating two
    const dir1 = directions[Math.floor(Math.random() * directions.length)];
    const dir2 = directions[Math.floor(Math.random() * directions.length)];
    if (Math.random() < 0.5) { // All same
      sequence = Array(length).fill(dir1);
      correctNextArrow = dir1;
    } else { // Alternating
      for (let i = 0; i < length; i++) {
        sequence.push(i % 2 === 0 ? dir1 : dir2);
      }
      correctNextArrow = sequence[length - 2] === dir1 ? dir2 : dir1;
    }
  } else if (complexity === 'complex') {
    // Complex: rotational (up, right, down, left) or more intricate
    const rotationPattern = ['up', 'right', 'down', 'left'];
    const startIdx = Math.floor(Math.random() * rotationPattern.length);
    for (let i = 0; i < length; i++) {
      sequence.push(rotationPattern[(startIdx + i) % rotationPattern.length]);
    }
    correctNextArrow = rotationPattern[(startIdx + length) % rotationPattern.length];
  } else { // Medium
    // Medium: simple repetition of last or a short cycle
    const baseDir = directions[Math.floor(Math.random() * directions.length)];
    if (Math.random() < 0.5) { // Repeat last
      for (let i = 0; i < length - 1; i++) {
        sequence.push(directions[Math.floor(Math.random() * directions.length)]);
      }
      sequence.push(sequence[length - 2]); // Make the last two same
      correctNextArrow = sequence[length - 1];
    } else { // Simple cycle (e.g., A, B, A, B)
      const cycleDirs = [directions[Math.floor(Math.random() * directions.length)], directions[Math.floor(Math.random() * directions.length)]];
      for (let i = 0; i < length; i++) {
        sequence.push(cycleDirs[i % 2]);
      }
      correctNextArrow = cycleDirs[length % 2];
    }
  }

  return { sequence, correctNextArrow };
};

// Create assessment items based on prediction logic
export const createAssessmentItems = () => {
  return {
    practice: [
      { id: 'p1', ...generateArrowSequence(3, 'simple') },
      { id: 'p2', ...generateArrowSequence(4, 'medium') },
      { id: 'p3', ...generateArrowSequence(4, 'complex') },
    ],
    screening: Array.from({ length: 5 }, (_, i) => ({ 
      id: `s${i + 1}`, 
      ...generateArrowSequence(4, 'medium') 
    })),
    core: Array.from({ length: 15 }, (_, i) => ({ 
      id: `c${i + 1}`, 
      ...generateArrowSequence(4, 'medium') 
    })),
    floor: Array.from({ length: 5 }, (_, i) => ({ 
      id: `f${i + 1}`, 
      ...generateArrowSequence(4, 'simple') 
    })),
    ceiling: Array.from({ length: 5 }, (_, i) => ({ 
      id: `ce${i + 1}`, 
      ...generateArrowSequence(4, 'complex') 
    })),
  };
};

// Constants for scoring
export const AGE_EXPECTED_MEDIAN_TIME_MS = 7000; // 7 seconds for ages 9-13
export const ERROR_PENALTY_INCORRECT_PREDICTION = 0.5;
export const FREQUENCY_SEVERITY_PENALTIES = [
  { range: [0, 2], penalty: 0.5 },
  { range: [3, 5], penalty: 1.0 },
  { range: [6, Infinity], penalty: 1.5 },
];

// Calculate final results
export const calculateFinalResults = (responses) => {
  const baseAccuracy = calculateBaseAccuracyScore(responses);
  const timingScore = calculateTimingScore(responses);
  const frequencySeverity = calculateFrequencySeverityPenalty(responses);
  const meanErrorPenalty = calculateMeanErrorPenalty(responses);
  const finalScore = (baseAccuracy + timingScore) / 2 - meanErrorPenalty - frequencySeverity;

  let interpretation = '';
  if (finalScore >= 4.5) interpretation = 'Excellent (5)';
  else if (finalScore >= 3.5) interpretation = 'Above Average (4)';
  else if (finalScore >= 2.5) interpretation = 'Average (3)';
  else if (finalScore >= 1.5) interpretation = 'Below Average (2)';
  else interpretation = 'Poor (1)';

  const totalErrors = responses.filter(r => !r.isCorrect).length;

  return {
    baseAccuracy,
    timingScore,
    frequencySeverity,
    finalScore: parseFloat(finalScore.toFixed(2)),
    interpretation,
    totalErrors,
    totalItems: responses.length,
    averageResponseTime: responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length,
  };
};

// Helper functions for scoring
const calculateBaseAccuracyScore = (responses) => {
  const correctCount = responses.filter(r => r.isCorrect).length;
  const totalItems = responses.length;
  if (totalItems === 0) return 0;

  const accuracyRatio = correctCount / totalItems;
  if (accuracyRatio >= 0.9) return 5;
  if (accuracyRatio >= 0.7) return 4;
  if (accuracyRatio >= 0.5) return 3;
  if (accuracyRatio >= 0.25) return 2;
  return 1;
};

const calculateTimingScore = (responses) => {
  if (responses.length === 0) return 0;
  const itemScores = responses.map(r => {
    const ratio = r.responseTime / AGE_EXPECTED_MEDIAN_TIME_MS;
    if (ratio <= 0.5) return 5;
    if (ratio <= 0.75) return 4;
    if (ratio <= 1.0) return 3;
    if (ratio <= 1.25) return 2;
    return 1;
  });
  return itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length;
};

const calculateMeanErrorPenalty = (responses) => {
  const totalErrors = responses.filter(r => !r.isCorrect).length;
  const totalItems = responses.length;
  if (totalItems === 0) return 0;
  
  // Calculate the error rate (0 to 1)
  const errorRate = totalErrors / totalItems;
  
  // Convert error rate to a penalty (0 to 1 scale)
  // This can be adjusted based on how harshly you want to penalize errors
  return errorRate * 0.5; // For example, 0.5 penalty for 100% error rate
};

const calculateFrequencySeverityPenalty = (responses) => {
  const totalErrors = responses.filter(r => !r.isCorrect).length;
  for (const penaltyRule of FREQUENCY_SEVERITY_PENALTIES) {
    if (totalErrors >= penaltyRule.range[0] && totalErrors <= penaltyRule.range[1]) {
      return penaltyRule.penalty;
    }
  }
  return 0;
};
