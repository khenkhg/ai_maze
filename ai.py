from flask import Flask, request, jsonify
from flask_cors import CORS  # To allow cross-origin requests
from collections import deque
import heapq

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Maze representation (matching your React code)
maze = [
    [0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, "B"],  # "B" is the goal at (0, 11)
    [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
]

# Start and goal positions (using same coordinates as your React file)
start = (6, 0)
goal = None
for i, row in enumerate(maze):
    for j, cell in enumerate(row):
        if cell == "B":
            goal = (i, j)
            break
    if goal is not None:
        break

# Custom heuristic values as provided
heuristic_values = {
    (0, 0): 15,
    (0, 2): 18,
    (0, 4): 8,
    (0, 8): 5,
    (0, 9): 5,
    (1, 4): 6,
    (1, 5): 6,
    (1, 6): 5,
    (2, 0): 12,
    (2, 1): 4,
    (2, 2): 7,
    (2, 6): 4,
    (2, 8): 3,
    (4, 1): 6,
    (4, 3): 6,
    (4, 4): 7,
    (4, 8): 2,
    (4, 11): 1,
    (7, 0): 8,
    (7, 3): 6,
    (7, 6): 8,
    (7, 11): 6,
}

def heuristic(pos):
    """Return the custom heuristic value for a given position."""
    return heuristic_values.get(pos, 0)

def get_neighbors(pos):
    """Return accessible neighboring cells (up, down, left, right)."""
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    neighbors = []
    r, c = pos
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(maze) and 0 <= nc < len(maze[0]):
            if maze[nr][nc] != 1:  # not a wall
                neighbors.append((nr, nc))
    return neighbors

def reconstruct_path(came_from, current):
    """Reconstruct the path from start to goal."""
    path = []
    while current in came_from:
        path.append(current)
        current = came_from[current]
    path.append(start)
    path.reverse()
    return path

def bfs():
    """Breadth-first search that returns the solution path, explored order, and cost."""
    queue = deque([start])
    came_from = {}
    visited = {start}
    explored = []  # record order of expansion

    while queue:
        current = queue.popleft()
        explored.append(current)
        if current == goal:
            solution = reconstruct_path(came_from, current)
            cost = len(solution) - 1  # each move costs 1
            return solution, explored, cost
        for neighbor in get_neighbors(current):
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                queue.append(neighbor)
    return None, explored, None

def dfs():
    """Depth-first search that returns the solution path, explored order, and cost."""
    stack = [start]
    came_from = {}
    visited = {start}
    explored = []

    while stack:
        current = stack.pop()
        explored.append(current)
        if current == goal:
            solution = reconstruct_path(came_from, current)
            cost = len(solution) - 1
            return solution, explored, cost
        for neighbor in get_neighbors(current):
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current
                stack.append(neighbor)
    return None, explored, None

def astar():
    """A* search algorithm that returns the solution path, explored order, and cost."""
    open_set = []
    heapq.heappush(open_set, (heuristic(start), 0, start))
    came_from = {}
    g_score = {start: 0}
    explored = []

    while open_set:
        _, current_cost, current = heapq.heappop(open_set)
        explored.append(current)
        if current == goal:
            solution = reconstruct_path(came_from, current)
            cost = len(solution) - 1
            return solution, explored, cost
        for neighbor in get_neighbors(current):
            tentative_g = current_cost + 1
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + heuristic(neighbor)
                heapq.heappush(open_set, (f_score, tentative_g, neighbor))
    return None, explored, None

@app.route('/solve', methods=['GET'])
def solve_maze():
    """
    API endpoint to solve the maze.
    Query parameter 'algorithm' should be one of: bfs, dfs, astar.
    Example: /solve?algorithm=astar
    """
    algorithm = request.args.get('algorithm', 'bfs').lower()
    
    if algorithm == 'bfs':
        solution, explored, cost = bfs()
    elif algorithm == 'dfs':
        solution, explored, cost = dfs()
    elif algorithm == 'astar':
        solution, explored, cost = astar()
    else:
        return jsonify({"error": "Invalid algorithm specified."}), 400

    if solution is None:
        return jsonify({"error": "No path found.", "explored": explored}), 404

    return jsonify({"solution": solution, "explored": explored, "cost": cost})

if __name__ == '__main__':
    app.run(debug=True)
