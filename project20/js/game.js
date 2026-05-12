import { CONFIG } from './config.js';
import { MazeGenerator } from './maze.js';

export class Game {
    constructor() {
        this.level = 1;
        this.beansCollected = 0;
        this.totalBeans = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isPlaying = false;
        this.isPaused = false;
        
        this.mazeGenerator = new MazeGenerator(CONFIG.MAZE_WIDTH, CONFIG.MAZE_HEIGHT);
        
        this.player = {
            x: 1,
            y: 1,
            pixelX: 0,
            pixelY: 0,
            moving: false,
            direction: null,
            targetX: 0,
            targetY: 0
        };
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.mazeData = null;
    }

    initLevel(level = null) {
        if (level) {
            this.level = level;
        }
        
        this.mazeData = this.mazeGenerator.generate(this.level);
        this.totalBeans = this.mazeData.beans.length;
        this.beansCollected = 0;
        
        this.player.x = this.mazeData.start.x;
        this.player.y = this.mazeData.start.y;
        this.player.pixelX = this.player.x * CONFIG.CELL_SIZE;
        this.player.pixelY = this.player.y * CONFIG.CELL_SIZE;
        this.player.moving = false;
        
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.isPlaying = true;
        this.isPaused = false;
        
        this.startTimer();
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.isPlaying && !this.isPaused) {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    setKey(key, value) {
        if (key === 'ArrowUp' || key === 'KeyW') this.keys.up = value;
        if (key === 'ArrowDown' || key === 'KeyS') this.keys.down = value;
        if (key === 'ArrowLeft' || key === 'KeyA') this.keys.left = value;
        if (key === 'ArrowRight' || key === 'KeyD') this.keys.right = value;
    }

    update() {
        if (!this.isPlaying || this.isPaused) return;

        if (!this.player.moving) {
            let dx = 0, dy = 0;
            
            if (this.keys.up) dy = -1;
            else if (this.keys.down) dy = 1;
            else if (this.keys.left) dx = -1;
            else if (this.keys.right) dx = 1;
            
            if (dx !== 0 || dy !== 0) {
                const newX = this.player.x + dx;
                const newY = this.player.y + dy;
                
                if (this.canMove(newX, newY)) {
                    this.player.moving = true;
                    this.player.targetX = newX * CONFIG.CELL_SIZE;
                    this.player.targetY = newY * CONFIG.CELL_SIZE;
                    this.player.direction = { dx, dy };
                }
            }
        }

        if (this.player.moving) {
            const speed = CONFIG.PLAYER_SPEED;
            
            if (this.player.pixelX < this.player.targetX) {
                this.player.pixelX = Math.min(this.player.pixelX + speed, this.player.targetX);
            } else if (this.player.pixelX > this.player.targetX) {
                this.player.pixelX = Math.max(this.player.pixelX - speed, this.player.targetX);
            }
            
            if (this.player.pixelY < this.player.targetY) {
                this.player.pixelY = Math.min(this.player.pixelY + speed, this.player.targetY);
            } else if (this.player.pixelY > this.player.targetY) {
                this.player.pixelY = Math.max(this.player.pixelY - speed, this.player.targetY);
            }
            
            if (this.player.pixelX === this.player.targetX && 
                this.player.pixelY === this.player.targetY) {
                this.player.moving = false;
                this.player.x = this.player.targetX / CONFIG.CELL_SIZE;
                this.player.y = this.player.targetY / CONFIG.CELL_SIZE;
                
                this.checkBeanCollection();
                this.checkObstacleCollision();
                this.checkExit();
            }
        }
    }

    canMove(x, y) {
        if (x < 0 || x >= CONFIG.MAZE_WIDTH || y < 0 || y >= CONFIG.MAZE_HEIGHT) {
            return false;
        }
        return this.mazeData.maze[y][x] === 0;
    }

    checkBeanCollection() {
        for (const bean of this.mazeData.beans) {
            if (!bean.collected && bean.x === this.player.x && bean.y === this.player.y) {
                bean.collected = true;
                this.beansCollected++;
            }
        }
    }

    checkObstacleCollision() {
        for (const obstacle of this.mazeData.obstacles) {
            if (obstacle.x === this.player.x && obstacle.y === this.player.y) {
                this.player.x = this.mazeData.start.x;
                this.player.y = this.mazeData.start.y;
                this.player.pixelX = this.player.x * CONFIG.CELL_SIZE;
                this.player.pixelY = this.player.y * CONFIG.CELL_SIZE;
            }
        }
    }

    checkExit() {
        if (this.player.x === this.mazeData.exit.x && 
            this.player.y === this.mazeData.exit.y &&
            this.beansCollected === this.totalBeans) {
            return true;
        }
        return false;
    }

    nextLevel() {
        this.level++;
        if (this.level > CONFIG.TOTAL_LEVELS) {
            return false;
        }
        this.initLevel();
        return true;
    }

    restart() {
        this.initLevel(this.level);
    }

    getFormattedTime() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    destroy() {
        this.stopTimer();
    }
}