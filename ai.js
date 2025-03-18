import React, { useState } from "react";
import axios from "axios";



const mazeGrid = [
  ["A", "1", "2", "3"],
  ["4", "5", "6", "7"],
  ["8", "9", "10", "11"],
  ["12", "13", "14", "15"],
  ["16", "17", "18", "19"],
  ["20", "21", "B", ""]
];

export default function MazeSolver() {
  const [algorithm, setAlgorithm] = useState("bfs");
  const [path, setPath] = useState([]);

  const solveMaze = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/solve?algo=${algorithm}`);
      setPath(response.data.path);
    } catch (error) {
      console.error("Error fetching solution:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-4">Maze Solver</h1>
      <select
        className="border p-2 mb-4"
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value)}
      >
        <option value="bfs">Breadth-First Search</option>
        <option value="dfs">Depth-First Search</option>
        <option value="astar">A* Search</option>
      </select>
      <button
        onClick={solveMaze}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Solve Maze
      </button>
      <div className="mt-5 grid grid-cols-4 gap-2">
  {mazeGrid.map((row, rowIndex) => (
    <div key={rowIndex} className="flex">
      {row.map((cell, colIndex) => (
        <div
          key={colIndex}
          className={`w-16 h-16 flex items-center justify-center border text-lg font-bold 
            ${path.includes(cell) ? "bg-green-300" : "bg-gray-100"}`}
        >
          {cell}
        </div>
      ))}
    </div>
  ))}
</div>

    </div>
  );
}
