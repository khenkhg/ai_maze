from flask import Flask, request, jsonify
from collections import deque
import heapq

app = Flask(__name__)

# Représentation du labyrinthe sous forme de graphe
maze_graph = {
    'A': ['1', '15'], '1': ['A', '2'], '2': ['1', '3', '4'], '3': ['2'],
    '4': ['2', '5', '20'], '5': ['4', '6', '7'], '6': ['5'], '7': ['5', '14'],
    '8': ['9', '11', '18', '19', 'B'], '9': ['8', '10', '12', '13'],
    '10': ['9'], '11': ['8'], '12': ['9'], '13': ['9'], '14': ['7', '17'],
    '15': ['A', '16'], '16': ['15'], '17': ['14'], '18': ['8'], '19': ['8'],
    '20': ['4', '21'], '21': ['20', 'B'], 'B': ['8', '21']
}

# Heuristic values for A*
heuristic = {
    'A': 8, '1': 6, '2': 6, '3': 6, '4': 7, '5': 4, '6': 12, '7': 7,
    '8': 15, '9': 18, '10': 6, '11': 8, '12': 6, '13': 5, '14': 4, '15': 8,
    '16': 6, '17': 3, '18': 5, '19': 5, '20': 2, '21': 1, 'B': 0
}

# BFS Algorithm
def bfs(start, goal):
    queue = deque([(start, [start])])
    visited = set()
    while queue:
        node, path = queue.popleft()
        if node == goal:
            return path
        if node not in visited:
            visited.add(node)
            for neighbor in maze_graph.get(node, []):
                queue.append((neighbor, path + [neighbor]))
    return []

# DFS Algorithm
def dfs(start, goal, path=None, visited=None):
    if path is None:
        path = [start]
    if visited is None:
        visited = set()
    if start == goal:
        return path
    visited.add(start)
    for neighbor in maze_graph.get(start, []):
        if neighbor not in visited:
            new_path = dfs(neighbor, goal, path + [neighbor], visited)
            if new_path:
                return new_path
    return []

# A* Algorithm
def astar(start, goal):
    open_list = [(0, start, [start])]
    g_costs = {start: 0}
    while open_list:
        _, node, path = heapq.heappop(open_list)
        if node == goal:
            return path
        for neighbor in maze_graph.get(node, []):
            new_cost = g_costs[node] + 1
            if neighbor not in g_costs or new_cost < g_costs[neighbor]:
                g_costs[neighbor] = new_cost
                priority = new_cost + heuristic[neighbor]
                heapq.heappush(open_list, (priority, neighbor, path + [neighbor]))
    return []

@app.route('/solve', methods=['GET'])
def solve_maze():
    algorithm = request.args.get('algo')
    start, goal = 'A', 'B'
    if algorithm == 'bfs':
        path = bfs(start, goal)
    elif algorithm == 'dfs':
        path = dfs(start, goal)
    elif algorithm == 'astar':
        path = astar(start, goal)
    else:
        return jsonify({'error': 'Invalid algorithm'}), 400
    return jsonify({'algorithm': algorithm, 'path': path})

if __name__ == '__main__':
    app.run(debug=True)
