// Error types
export const ERROR_TYPES = {
  RANDOM: 'Random Selection',
  SYSTEMATIC: 'Systematic Rule Error',
  PARTIAL: 'Partial Pattern',
  BIAS: 'Direction/Position Bias',
  CARELESS: 'Careless Error'
};

// Helper function to analyze error type
export const analyzeErrorType = (chosenDirection, correctDirection, previousResponses = [], sequence = []) => {
  // If no previous responses, can't determine pattern
  if (previousResponses.length === 0) {
    return ERROR_TYPES.RANDOM;
  }

  // Check for direction/position bias
  const directionCounts = {};
  previousResponses.forEach(r => {
    directionCounts[r.chosenDirection] = (directionCounts[r.chosenDirection] || 0) + 1;
  });
  
  // If always choosing same direction
  if (Object.values(directionCounts).some(count => count / previousResponses.length > 0.8)) {
    return ERROR_TYPES.BIAS;
  }

  // Check for systematic errors (repeating same wrong pattern)
  if (previousResponses.length >= 2) {
    const lastTwoSame = previousResponses.slice(-2).every(r => 
      !r.isCorrect && r.chosenDirection === chosenDirection
    );
    if (lastTwoSame) {
      return ERROR_TYPES.SYSTEMATIC;
    }
  }

  // Check for partial pattern (correct on some elements but not all)
  if (sequence.length > 2) {
    const correctPattern = sequence.join('');
    const userPattern = sequence.slice(0, -1).map((_, i) => 
      i < previousResponses.length ? previousResponses[i].chosenDirection : '?'
    ).join('');
    
    // If user got at least half right but still made an error
    let correctCount = 0;
    for (let i = 0; i < Math.min(sequence.length - 1, previousResponses.length); i++) {
      if (sequence[i] === previousResponses[i]?.chosenDirection) {
        correctCount++;
      }
    }
    
    if (correctCount > 0 && correctCount < sequence.length - 1) {
      return ERROR_TYPES.PARTIAL;
    }
  }

  // Check for careless error (close to correct answer or isolated mistake)
  if (previousResponses.filter(r => !r.isCorrect).length === 0) {
    return ERROR_TYPES.CARELESS;
  }

  // Default to random if no other pattern detected
  return ERROR_TYPES.RANDOM;
};

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
export const AGE_9_10_MEDIAN_TIME = 30000; // 30s per item
export const AGE_11_13_MEDIAN_TIME = 20000; // 20s per item

// Error penalties
export const ERROR_PENALTIES = {
  [ERROR_TYPES.RANDOM]: 3,
  [ERROR_TYPES.SYSTEMATIC]: 2,
  [ERROR_TYPES.PARTIAL]: 2,
  [ERROR_TYPES.BIAS]: 2,
  [ERROR_TYPES.CARELESS]: 1
};

// Frequency severity penalties
export const FREQUENCY_SEVERITY_PENALTIES = [
  { range: [0, 2], penalty: 1 },
  { range: [3, 5], penalty: 2 },
  { range: [6, Infinity], penalty: 3 },
];

// Calculate final results
export const calculateFinalResults = (responses) => {
  // Filter out practice and screening responses for final scoring
  const mainResponses = responses.filter(r => r.phase === 'main');
  const screeningResponses = responses.filter(r => r.phase === 'screening');
  
  if (mainResponses.length === 0) {
    return {
      score: 0,
      interpretation: 'Incomplete',
      baseScore: 0,
      avgTimingScore: 0,
      totalErrors: 0,
      errorBreakdown: {}
    };
  }

  // Calculate base accuracy score (5-point scale)
  const correctCount = mainResponses.filter(r => r.isCorrect).length;
  let baseScore;
  if (correctCount >= 14) baseScore = 5;
  else if (correctCount >= 11) baseScore = 4;
  else if (correctCount >= 8) baseScore = 3;
  else if (correctCount >= 5) baseScore = 2;
  else baseScore = 1;

  // Calculate average timing score
  const timingScores = mainResponses.map(r => r.timingScore || 3);
  const avgTimingScore = timingScores.reduce((a, b) => a + b, 0) / timingScores.length;
  
  // Calculate error penalties
  const errorResponses = mainResponses.filter(r => !r.isCorrect);
  const errorPenalties = errorResponses.map(r => r.errorPenalty || 0);
  const totalErrorPenalty = errorPenalties.reduce((sum, penalty) => sum + penalty, 0);
  const meanErrorPenalty = errorPenalties.length > 0 
    ? totalErrorPenalty / errorPenalties.length 
    : 0;
  
  // Calculate frequency severity penalty
  let frequencyPenalty = 0;
  if (errorResponses.length <= 2) frequencyPenalty = 1;
  else if (errorResponses.length <= 5) frequencyPenalty = 2;
  else frequencyPenalty = 3;
  
  // Calculate final score (clamped between 1 and 5)
  const rawScore = ((baseScore + avgTimingScore) / 2) - meanErrorPenalty - frequencyPenalty;
  const finalScore = Math.max(1, Math.min(5, rawScore));
  
  // Determine interpretation
  let interpretation;
  if (finalScore >= 4.5) interpretation = 'Excellent';
  else if (finalScore >= 3.5) interpretation = 'Above Average';
  else if (finalScore >= 2.5) interpretation = 'Average';
  else if (finalScore >= 1.5) interpretation = 'Below Average';
  else interpretation = 'Poor';
  
  // Generate error breakdown
  const errorBreakdown = errorResponses.reduce((acc, curr) => {
    if (curr.errorType) {
      acc[curr.errorType] = (acc[curr.errorType] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    score: parseFloat(finalScore.toFixed(2)),
    interpretation,
    baseScore,
    avgTimingScore: parseFloat(avgTimingScore.toFixed(2)),
    totalErrors: errorResponses.length,
    errorBreakdown,
    screeningScore: screeningResponses.filter(r => r.isCorrect).length,
    responseTimes: mainResponses.map(r => r.responseTime)
  };
};

// Helper function to calculate timing score for a response
export const calculateTimingScore = (responseTime, ageGroup) => {
  const median = ageGroup === '9-10' ? AGE_9_10_MEDIAN_TIME : AGE_11_13_MEDIAN_TIME;
  const percentage = (responseTime / median) * 100;
  
  if (percentage <= 50) return 5;
  if (percentage <= 75) return 4;
  if (percentage <= 100) return 3;
  if (percentage <= 125) return 2;
  return 1;
};

// Calculate error penalty based on error type
export const calculateErrorPenalty = (errorType) => {
  return ERROR_PENALTIES[errorType] || 0;
};

// Calculate frequency severity penalty
export const calculateFrequencySeverityPenalty = (errorCount) => {
  if (errorCount <= 2) return 1;
  if (errorCount <= 5) return 2;
  return 3;
};
