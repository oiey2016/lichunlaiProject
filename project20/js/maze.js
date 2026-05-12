import { CONFIG } from './config.js';

export class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generate(level) {
        const maze = this.createMaze();
        const beans = this.placeBeans(maze, level);
        const obstacles = this.placeObstacles(maze, level);
        const { start, exit } = this.placeStartAndExit(maze);
        
        return { maze, beans, obstacles, start, exit };
    }

    createMaze() {
        const maze = Array(this.height).fill(null).map(() => Array(this.width).fill(1));
        
        const stack = [];
        const startX = 1;
        const startY = 1;
        
        maze[startY][startX] = 0;
        stack.push({ x: startX, y: startY });

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(maze, current.x, current.y);

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                const wallX = current.x + (next.x - current.x) / 2;
                const wallY = current.y + (next.y - current.y) / 2;
                maze[wallY][wallX] = 0;
                maze[next.y][next.x] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        return maze;
    }

    getUnvisitedNeighbors(maze, x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -2 },
            { dx: 0, dy: 2 },
            { dx: -2, dy: 0 },
            { dx: 2, dy: 0 }
        ];

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            
            if (nx > 0 && nx < this.width - 1 && 
                ny > 0 && ny < this.height - 1 && 
                maze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    placeBeans(maze, level) {
        const beans = [];
        const beanCount = 5 + level * 2;
        let placed = 0;
        let attempts = 0;

        while (placed < beanCount && attempts < 1000) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            
            if (maze[y][x] === 0 && !beans.some(b => b.x === x && b.y === y)) {
                beans.push({
                    x,
                    y,
                    color: CONFIG.COLORS.BEAN_COLORS[Math.floor(Math.random() * CONFIG.COLORS.BEAN_COLORS.length)],
                    collected: false
                });
                placed++;
            }
            attempts++;
        }

        return beans;
    }

    placeObstacles(maze, level) {
        const obstacles = [];
        const obstacleCount = Math.min(level, 5);
        let placed = 0;
        let attempts = 0;

        while (placed < obstacleCount && attempts < 1000) {
            const x = Math.floor(Math.random() * (this.width - 4)) + 2;
            const y = Math.floor(Math.random() * (this.height - 4)) + 2;
            
            if (maze[y][x] === 0 && 
                !obstacles.some(o => o.x === x && o.y === y) &&
                !(x <= 2 && y <= 2)) {
                obstacles.push({ x, y });
                placed++;
            }
            attempts++;
        }

        return obstacles;
    }

    placeStartAndExit(maze) {
        const start = { x: 1, y: 1 };
        let exit = { x: this.width - 2, y: this.height - 2 };
        
        maze[start.y][start.x] = 0;
        maze[exit.y][exit.x] = 0;
        
        if (maze[exit.y][exit.x - 1] === 1 && maze[exit.y - 1][exit.x] === 1) {
            for (let y = this.height - 2; y > 0; y--) {
                for (let x = this.width - 2; x > 0; x--) {
                    if (maze[y][x] === 0) {
                        exit = { x, y };
                        return { start, exit };
                    }
                }
            }
        }
        
        return { start, exit };
    }
}