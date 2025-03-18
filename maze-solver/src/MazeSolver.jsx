import React, { useState, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import "./styles.css";

const maze = [
  [0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, "B"],
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
];

const startPosition = { row: 6, col: 0 };

function MazeSolver() {
  const [robot, setRobot] = useState(startPosition);
  const [solutionPath, setSolutionPath] = useState([]);
  const [exploredPath, setExploredPath] = useState([]);
  const [cost, setCost] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [displayMode, setDisplayMode] = useState("both");

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case "ArrowUp":
          moveRobot(-1, 0);
          break;
        case "ArrowDown":
          moveRobot(1, 0);
          break;
        case "ArrowLeft":
          moveRobot(0, -1);
          break;
        case "ArrowRight":
          moveRobot(0, 1);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [robot]);

  const moveRobot = (rowOffset, colOffset) => {
    const newRow = robot.row + rowOffset;
    const newCol = robot.col + colOffset;
    if (
      newRow >= 0 &&
      newRow < maze.length &&
      newCol >= 0 &&
      newCol < maze[0].length &&
      maze[newRow][newCol] !== 1
    ) {
      setRobot({ row: newRow, col: newCol });
      if (maze[newRow][newCol] === "B") {
        alert("🎉 Yay! You reached the goal! 🎉");
      }
    }
  };

  const fetchSolution = (algorithm) => {
    fetch(`https://ai-maze.onrender.com/solve?algorithm=${algorithm}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.solution && data.explored) {
          setSolutionPath(data.solution);
          setExploredPath(data.explored);
          setCost(data.cost);
          setDisplayMode("both");
        } else {
          alert(data.error || "Oops! No path found.");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const isInSolution = (row, col) =>
    solutionPath.some((cell) => cell[0] === row && cell[1] === col);

  const isExplored = (row, col) =>
    exploredPath.some((cell) => cell[0] === row && cell[1] === col);

  if (showWelcome) {
    return (
      <div className="welcome-container">
        <h1 className="welcome">🌟 Welcome to My Cute Maze! 🌟</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">🐰 Robot Maze Adventure 🐰</h1>
      {cost !== null && (
        <div className="cost">
          <strong>Path Cost: </strong>
          {cost}
        </div>
      )}
      <div className="maze-container">
        <div className="maze">
          {maze.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              let cellClass = "cell";
              if (cell === 1) {
                cellClass += " wall";
              } else if (robot.row === rowIndex && robot.col === colIndex) {
                cellClass += " robot";
              } else {
                if (displayMode === "solution") {
                  if (isInSolution(rowIndex, colIndex)) {
                    cellClass += " solution";
                  }
                } else if (displayMode === "explored") {
                  if (isExplored(rowIndex, colIndex)) {
                    cellClass += " explored";
                  }
                } else if (displayMode === "both") {
                  if (isInSolution(rowIndex, colIndex)) {
                    cellClass += " solution";
                  } else if (isExplored(rowIndex, colIndex)) {
                    cellClass += " explored";
                  }
                }
              }

              // Render both the flag and robot icon if needed
              const isGoalCell = cell === "B";
              const isRobotHere = robot.row === rowIndex && robot.col === colIndex;
              let cellContent = null;
              if (isGoalCell) {
                cellContent = <span className="flag">🏁</span>;
              }
              if (isRobotHere) {
                cellContent = (
                  <>
                    {cellContent}
                    <FaRobot className="robot-icon" />
                  </>
                );
              } else if (!isRobotHere && !isGoalCell) {
                cellContent = "";
              }
              return (
                <div key={`${rowIndex}-${colIndex}`} className={cellClass}>
                  {cellContent}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="controls">
        <button className="cute-btn" onClick={() => moveRobot(-1, 0)}>
          ⬆️
        </button>
        <button className="cute-btn" onClick={() => moveRobot(1, 0)}>
          ⬇️
        </button>
        <button className="cute-btn" onClick={() => moveRobot(0, -1)}>
          ⬅️
        </button>
        <button className="cute-btn" onClick={() => moveRobot(0, 1)}>
          ➡️
        </button>
      </div>
      <p className="keyboard-note">
        You can also use the arrow keys to control the maze.
      </p>
      <div className="solution-controls">
        <button className="cute-btn" onClick={() => fetchSolution("bfs")}>
          ✨ Solve with BFS
        </button>
        <button className="cute-btn" onClick={() => fetchSolution("dfs")}>
          🌟 Solve with DFS
        </button>
        <button className="cute-btn" onClick={() => fetchSolution("astar")}>
          💖 Solve with A*
        </button>
      </div>
      {cost !== null && (
        <div className="display-options">
          <label>
            <input
              type="radio"
              name="displayMode"
              value="solution"
              checked={displayMode === "solution"}
              onChange={(e) => setDisplayMode(e.target.value)}
            />
            Show Solution Path Only
          </label>
          <label>
            <input
              type="radio"
              name="displayMode"
              value="explored"
              checked={displayMode === "explored"}
              onChange={(e) => setDisplayMode(e.target.value)}
            />
            Show Explored Nodes Only
          </label>
          <label>
            <input
              type="radio"
              name="displayMode"
              value="both"
              checked={displayMode === "both"}
              onChange={(e) => setDisplayMode(e.target.value)}
            />
            Show Both
          </label>
        </div>
      )}
    </div>
  );
}

export default MazeSolver;
