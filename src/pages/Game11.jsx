import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Custom hook for drag and drop functionality
const useDragAndDrop = (onDropCallback) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragItem = useRef(null);

  const handleDragStart = (e, item) => {
    dragItem.current = item;
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox to work
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragItem.current = null;
  };

  const handleDrop = (e, dropZone) => {
    e.preventDefault();
    if (dragItem.current) {
      onDropCallback(dragItem.current, dropZone);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragOver,
    isDragging
  };
};

// Tower of London game component
const TowerOfLondon = ({ onComplete }) => {
  const [moves, setMoves] = useState(0);
  const [pegs, setPegs] = useState([
    [3, 2, 1], // The starting peg
    [],
    []
  ]);
  const [message, setMessage] = useState('');
  const [firstMoveTime, setFirstMoveTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  // Define the goal state (disks on the third peg)
  const goalState = [
    [],
    [],
    [3, 2, 1]
  ];
  // Optimal moves for a 3-disk Tower of London puzzle is 7
  const optimalMoves = 7;

  const checkWin = useCallback(() => {
    // Check if the current pegs state matches the goal state
    if (JSON.stringify(pegs) === JSON.stringify(goalState)) {
      const completionTime = (Date.now() - startTime) / 1000;
      const firstMoveDelay = (firstMoveTime - startTime) / 1000;
      setMessage('You won! You can proceed to the next task.');
      // Calculate extra moves percentage
      const extraMovesPercent = moves > optimalMoves ? ((moves - optimalMoves) / optimalMoves) * 100 : 0;
      // Call the parent onComplete function with results
      onComplete({
        task: 'Tower of London',
        score: {
          moves: moves,
          firstMoveDelay: firstMoveDelay,
          completionTime: completionTime,
          extraMovesPercent: extraMovesPercent
        }
      });
      return true;
    }
    return false;
  }, [pegs, moves, onComplete, startTime, firstMoveTime, goalState]);

  useEffect(() => {
    if (isStarted) {
      checkWin();
    }
  }, [pegs, isStarted, checkWin]);

  const { handleDragStart, handleDragEnd, handleDrop, handleDragOver } = useDragAndDrop((item, dropZone) => {
    const fromPegIndex = item.fromPeg;
    const fromPeg = pegs[fromPegIndex];
    const disk = fromPeg[fromPeg.length - 1]; // Get the top disk
    const toPegIndex = dropZone.toPeg;
    const toPeg = pegs[toPegIndex];

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
      setFirstMoveTime(Date.now());
    }

    if (disk === item.value) { // Make sure the dragged disk is the top disk
      if (toPeg.length === 0 || disk < toPeg[toPeg.length - 1]) {
        const newPegs = [...pegs];
        newPegs[fromPegIndex] = newPegs[fromPegIndex].slice(0, -1);
        newPegs[toPegIndex] = [...newPegs[toPegIndex], disk];
        setPegs(newPegs);
        setMoves(moves + 1);
        setMessage('');
      } else {
        setMessage('Invalid move: You can only place a smaller disk on top of a larger one.');
      }
    }
  });

  const getDiskClass = (diskValue) => {
    const baseClass = 'absolute rounded-full transition-all duration-300 transform -translate-x-1/2 left-1/2';
    const colors = {
      1: 'bg-red-500',
      2: 'bg-blue-500',
      3: 'bg-green-500',
      4: 'bg-yellow-500',
    };
    // Return base classes and color, width will be applied via style
    return `${baseClass} ${colors[diskValue]} h-6`;
  };

  const renderPegs = (pegsToRender) => {
    return (
      <div className="flex justify-around items-end w-full h-40 relative mb-4">
        {pegsToRender.map((peg, pegIndex) => (
          <div
            key={`peg-${pegIndex}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, { toPeg: pegIndex })}
            className="w-1/4 h-full relative border-b-4 border-gray-400 flex flex-col-reverse items-center pt-1"
          >
            {peg.map((disk, diskIndex) => (
              <div
                key={`disk-${disk}`}
                draggable={pegsToRender === pegs} // Only allow dragging from the current game pegs
                onDragStart={(e) => handleDragStart(e, { fromPeg: pegIndex, value: disk })}
                onDragEnd={handleDragEnd}
                className={`z-10 cursor-grab active:cursor-grabbing ${getDiskClass(disk)}`}
                style={{ width: `${disk * 1.5 + 4}rem`, bottom: `${diskIndex * 1.5 + 0.25}rem` }} // Added width here
              ></div>
            ))}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-400 rounded-b-lg z-0"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Tower of London</h2>
      <p className="mb-4 text-center text-gray-600">
        Move the disks from the start to the goal state. You can only place a smaller disk on top of a larger one.
      </p>

      {/* Goal State Display */}
      <div className="w-full text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Goal</h3>
        {renderPegs(goalState)}
      </div>

      {/* Current Game State */}
      <div className="w-full text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Current</h3>
        {renderPegs(pegs)}
      </div>

      <p className="text-xl font-semibold mt-4 text-gray-700">Moves: {moves}</p>
      {message && <p className="mt-4 text-sm font-medium text-red-500">{message}</p>}
      <button onClick={() => checkWin()} className="mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300">
        Check Win
      </button>
    </div>
  );
};

// Maze game component
const MazeGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [path, setPath] = useState([]);
  const [message, setMessage] = useState('');

  // Maze data structure: a 2D array of walls. 1 = wall, 0 = path.
  // S = start, E = end.
  const maze = [
    ['S', 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 'E'],
  ];

  const gridSize = 8;
  const cellSize = 50;

  // Draw the maze on the canvas
  const drawMaze = useCallback((ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const wallColor = '#2d3748';
    const pathColor = '#cbd5e0';
    const startColor = '#10b981';
    const endColor = '#ef4444';

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = maze[row][col];
        const x = col * cellSize;
        const y = row * cellSize;

        if (cell === 1) {
          ctx.fillStyle = wallColor;
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === 'S') {
          ctx.fillStyle = startColor;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.fillStyle = '#fff';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S', x + cellSize / 2, y + cellSize / 2);
        } else if (cell === 'E') {
          ctx.fillStyle = endColor;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.fillStyle = '#fff';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('E', x + cellSize / 2, y + cellSize / 2);
        } else {
          ctx.fillStyle = pathColor;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }, [maze, gridSize, cellSize]);

  // Draw the user's path
  const drawPath = useCallback((ctx) => {
    if (path.length < 2) return;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }, [path]);

  // Handle mouse/touch events for drawing
  const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  };

  const isWall = (x, y) => {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return true; // Outside the canvas is a wall
    }
    return maze[row][col] === 1;
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (isComplete) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePos(canvas, e.touches ? e.touches[0] : e);

    if (isWall(pos.x, pos.y)) {
      setMessage('You cannot start on a wall!');
      return;
    }

    setPath([pos]);
    setIsRunning(true);
    setMessage('');
    setTime(0);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isRunning || isComplete) return;

    const canvas = canvasRef.current;
    const pos = getMousePos(canvas, e.touches ? e.touches[0] : e);

    // Check for collision with walls
    if (isWall(pos.x, pos.y)) {
      setIsRunning(false);
      setMessage('You hit a wall! Try again.');
      setPath([]); // Reset path
      return;
    }

    setPath(prevPath => [...prevPath, pos]);
  };

  const handleEnd = (e) => {
    if (!isRunning) return;
    setIsRunning(false);

    const lastPos = path[path.length - 1];
    const endCol = gridSize - 1;
    const endRow = gridSize - 1;
    const endX = endCol * cellSize + cellSize / 2;
    const endY = endRow * cellSize + cellSize / 2;
    const distance = Math.sqrt(Math.pow(lastPos.x - endX, 2) + Math.pow(lastPos.y - endY, 2));

    // Check if the user is close enough to the end point
    if (distance < cellSize / 2) {
      setIsComplete(true);
      setMessage('Maze complete!');
      onComplete({
        task: 'Maze Navigation',
        score: { completionTime: time, accuracy: 'High', strategy: 'Visual path planning' }
      });
    } else {
      setMessage('You did not reach the end!');
      setPath([]); // Reset path
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawMaze(ctx);
    drawPath(ctx);
  }, [drawMaze, drawPath, maze]);

  useEffect(() => {
    let timer;
    if (isRunning && !isComplete) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isComplete]);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Maze Navigation</h2>
      <p className="mb-4 text-center text-gray-600">
        Click and drag to draw a path from S to E before time runs out!
      </p>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={gridSize * cellSize}
          height={gridSize * cellSize}
          className="border-4 border-gray-800 rounded-lg"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        {isComplete && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white rounded-lg">
            <h3 className="text-4xl font-bold">Complete!</h3>
            <p className="mt-2 text-xl">Time: {time} seconds</p>
          </div>
        )}
      </div>
      <p className="text-xl font-semibold mt-4 text-gray-700">Time: {time}s</p>
      {message && <p className="mt-4 text-sm font-medium text-red-500">{message}</p>}
      <button onClick={() => setPath([])} className="mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300">
        Reset Maze
      </button>
    </div>
  );
};

// Multi-step sorting game component
const SortingGame = ({ onComplete }) => {
  const initialCards = [
    { id: 1, shape: 'square', color: 'red' },
    { id: 2, shape: 'circle', color: 'blue' },
    { id: 3, shape: 'triangle', color: 'green' },
    { id: 4, shape: 'circle', color: 'red' },
    { id: 5, shape: 'triangle', color: 'blue' },
    { id: 6, shape: 'square', color: 'green' },
    { id: 7, shape: 'triangle', color: 'red' },
    { id: 8, shape: 'square', color: 'blue' },
    { id: 9, shape: 'circle', color: 'green' },
  ];

  const [cards, setCards] = useState(initialCards);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [completionTime, setCompletionTime] = useState(null);

  const { handleDragStart, handleDragEnd, handleDrop, handleDragOver, isDragging } = useDragAndDrop((item, dropZone) => {
    const newCards = [...cards];
    const cardIndex = newCards.findIndex(c => c.id === item.id);

    // Get the properties to check based on the current step
    const sortKey = step === 1 ? 'color' : 'shape';
    const targetValue = dropZone.value;

    if (newCards[cardIndex][sortKey] === targetValue) {
      newCards[cardIndex].sorted = true;
      setCards(newCards);
      const allSorted = newCards.every(card => card.sorted);
      if (allSorted) {
        if (step === 1) {
          setMessage('First step complete! Now sort the cards by shape.');
          setStep(2);
          setCards(initialCards.map(c => ({ ...c, sorted: false }))); // Reset for step 2
        } else {
          const finalTime = (Date.now() - startTime) / 1000;
          setCompletionTime(finalTime);
          setMessage('All done! You completed both sorting steps.');
          onComplete({
            task: 'Multi-Step Sorting',
            score: { completionTime: finalTime, accuracy: 'High', planningQuality: 'Logical' }
          });
        }
      } else {
        setMessage('');
      }
    } else {
      setMessage(`Incorrect! This card is not the correct ${sortKey}. Try again.`);
    }
  });

  const getShapeSVG = (shape, color) => {
    const svgPath = {
      square: 'M2 2h20v20H2z',
      circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      triangle: 'M12 2l-10 18h20z',
    };
    const fillColors = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
    };
    return (
      <svg
        className="h-full w-full"
        viewBox="0 0 24 24"
        fill={fillColors[color]}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={svgPath[shape]} />
      </svg>
    );
  };

  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Multi-Step Sorting</h2>
      <p className="mb-4 text-center text-gray-600">
        <span className="font-bold">Step {step}:</span> Sort the cards by {step === 1 ? 'color' : 'shape'}.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.id}
            draggable={!card.sorted}
            onDragStart={(e) => handleDragStart(e, card)}
            onDragEnd={handleDragEnd}
            className={`w-24 h-24 p-2 bg-gray-100 rounded-lg shadow-md cursor-grab transition duration-300
              ${card.sorted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:cursor-grabbing'}`}
          >
            {getShapeSVG(card.shape, card.color)}
          </div>
        ))}
      </div>
      <div className="flex justify-around w-full mb-8">
        {step === 1 && (
          <>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { value: 'red' })}
              className={`w-32 h-32 p-2 rounded-lg border-4 border-dashed bg-red-100 transition-all duration-300
                ${isDragging ? 'border-red-500' : 'border-red-300'}`}
            >
              <p className="text-center font-semibold text-red-700">Red</p>
            </div>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { value: 'blue' })}
              className={`w-32 h-32 p-2 rounded-lg border-4 border-dashed bg-blue-100 transition-all duration-300
                ${isDragging ? 'border-blue-500' : 'border-blue-300'}`}
            >
              <p className="text-center font-semibold text-blue-700">Blue</p>
            </div>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { value: 'green' })}
              className={`w-32 h-32 p-2 rounded-lg border-4 border-dashed bg-green-100 transition-all duration-300
                ${isDragging ? 'border-green-500' : 'border-green-300'}`}
            >
              <p className="text-center font-semibold text-green-700">Green</p>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { value: 'square' })}
              className={`w-32 h-32 p-2 rounded-lg border-4 border-dashed bg-gray-100 transition-all duration-300
                ${isDragging ? 'border-gray-500' : 'border-gray-300'}`}
            >
              <p className="text-center font-semibold text-gray-700">Square</p>
            </div>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { value: 'circle' })}
              className={`w-32 h-32 p-2 rounded-lg border-4 border-dashed bg-gray-100 transition-all duration-300
                ${isDragging ? 'border-gray-500' : 'border-gray-300'}`}
            >
              <p className="text-center font-semibold text-gray-700">Circle</p>
            </div>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { value: 'triangle' })}
              className={`w-32 h-32 p-2 rounded-lg border-4 border-dashed bg-gray-100 transition-all duration-300
                ${isDragging ? 'border-gray-500' : 'border-gray-300'}`}
            >
              <p className="text-center font-semibold text-gray-700">Triangle</p>
            </div>
          </>
        )}
      </div>
      {completionTime && (
        <p className="mt-4 text-xl font-bold text-gray-800">
          Total time: {completionTime.toFixed(2)}s
        </p>
      )}
      {message && <p className="mt-4 text-sm font-medium text-red-500">{message}</p>}
    </div>
  );
};

// Main App component
export default function App() {
  const [currentTask, setCurrentTask] = useState('intro');
  const [results, setResults] = useState([]);

  const handleTaskComplete = (result) => {
    setResults([...results, result]);
    switch (result.task) {
      case 'Tower of London':
        setCurrentTask('maze');
        break;
      case 'Maze Navigation':
        setCurrentTask('sorting');
        break;
      case 'Multi-Step Sorting':
        setCurrentTask('results');
        break;
      default:
        break;
    }
  };

  const startTest = () => {
    setCurrentTask('tower');
  };

  const getScoreDescription = (task, score) => {
    if (!score) {
      return 'Incomplete';
    }
    if (task === 'Tower of London') {
      const { moves, firstMoveDelay, completionTime, extraMovesPercent } = score;
      return (
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Moves:</strong> {moves ?? 'N/A'}</li>
          <li><strong>Extra Moves:</strong> {extraMovesPercent?.toFixed(2) ?? 'N/A'}%</li>
          <li><strong>Time to First Move:</strong> {firstMoveDelay?.toFixed(2) ?? 'N/A'}s</li>
          <li><strong>Completion Time:</strong> {completionTime?.toFixed(2) ?? 'N/A'}s</li>
        </ul>
      );
    }
    if (task === 'Maze Navigation') {
      const { completionTime } = score;
      return (
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Completion Time:</strong> {completionTime?.toFixed(2) ?? 'N/A'}s</li>
        </ul>
      );
    }
    if (task === 'Multi-Step Sorting') {
      const { completionTime } = score;
      return (
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Completion Time:</strong> {completionTime?.toFixed(2) ?? 'N/A'}s</li>
        </ul>
      );
    }
    return 'No score data.';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-4xl p-6 bg-gray-50 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center">
          {currentTask === 'intro' && (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Planning & Persistence Test</h1>
              <p className="text-lg text-gray-700 mb-6">
                Welcome! This activity measures your ability to plan ahead, solve problems, and persist through challenges. You will complete three tasks in a row.
              </p>
              <button
                onClick={startTest}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300"
              >
                Start Test
              </button>
            </div>
          )}

          {currentTask === 'tower' && <TowerOfLondon onComplete={handleTaskComplete} />}
          {currentTask === 'maze' && <MazeGame onComplete={handleTaskComplete} />}
          {currentTask === 'sorting' && <SortingGame onComplete={handleTaskComplete} />}

          {currentTask === 'results' && (
            <div className="p-8 bg-white rounded-xl shadow-lg w-full">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Test Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.task}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getScoreDescription(result.task, result.score)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-center text-gray-600">
                This is a summary of your performance in each task.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
