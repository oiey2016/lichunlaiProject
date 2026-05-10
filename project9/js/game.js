class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

        this.gameState = GAME_STATE.IDLE;
        this.score = 0;
        this.highScore = this.getHighScore();
        this.gameSpeed = GAME_CONFIG.INITIAL_SPEED;
        this.lastUpdateTime = 0;
        this.animationFrameId = null;

        this.snake = [];
        this.food = null;
        this.currentDirection = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;

        this.initializeUI();
        this.bindEvents();
        this.updateUI();
        this.draw();
    }

    initializeUI() {
        document.getElementById('highScore').textContent = this.highScore;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }

    handleKeyPress(e) {
        const key = e.key.toLowerCase();

        if (key === ' ' || key === 'enter') {
            e.preventDefault();
            if (this.gameState === GAME_STATE.IDLE || this.gameState === GAME_STATE.GAME_OVER) {
                this.startGame();
            } else if (this.gameState === GAME_STATE.PLAYING) {
                this.togglePause();
            } else if (this.gameState === GAME_STATE.PAUSED) {
                this.togglePause();
            }
            return;
        }

        if (this.gameState !== GAME_STATE.PLAYING) return;

        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.currentDirection !== DIRECTIONS.DOWN) {
                    this.nextDirection = DIRECTIONS.UP;
                }
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                if (this.currentDirection !== DIRECTIONS.UP) {
                    this.nextDirection = DIRECTIONS.DOWN;
                }
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                if (this.currentDirection !== DIRECTIONS.RIGHT) {
                    this.nextDirection = DIRECTIONS.LEFT;
                }
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                if (this.currentDirection !== DIRECTIONS.LEFT) {
                    this.nextDirection = DIRECTIONS.RIGHT;
                }
                e.preventDefault();
                break;
        }
    }

    startGame() {
        if (this.gameState === GAME_STATE.PLAYING) return;

        this.initGame();
        this.gameState = GAME_STATE.PLAYING;
        this.updateUI();
        this.lastUpdateTime = performance.now();
        this.gameLoop();
    }

    initGame() {
        this.score = 0;
        this.gameSpeed = GAME_CONFIG.INITIAL_SPEED;
        this.currentDirection = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;

        const cols = Math.floor(this.canvas.width / GAME_CONFIG.GRID_SIZE);
        const rows = Math.floor(this.canvas.height / GAME_CONFIG.GRID_SIZE);
        const startX = Math.floor(cols / 2);
        const startY = Math.floor(rows / 2);

        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        this.spawnFood();
    }

    spawnFood() {
        const cols = Math.floor(this.canvas.width / GAME_CONFIG.GRID_SIZE);
        const rows = Math.floor(this.canvas.height / GAME_CONFIG.GRID_SIZE);

        let validPosition = false;
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows)
            };

            validPosition = !this.snake.some(segment => 
                segment.x === this.food.x && segment.y === this.food.y
            );
        }
    }

    togglePause() {
        if (this.gameState === GAME_STATE.PLAYING) {
            this.gameState = GAME_STATE.PAUSED;
            cancelAnimationFrame(this.animationFrameId);
        } else if (this.gameState === GAME_STATE.PAUSED) {
            this.gameState = GAME_STATE.PLAYING;
            this.lastUpdateTime = performance.now();
            this.gameLoop();
        }
        this.updateUI();
    }

    restartGame() {
        cancelAnimationFrame(this.animationFrameId);
        this.gameState = GAME_STATE.IDLE;
        this.startGame();
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== GAME_STATE.PLAYING) return;

        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));

        const deltaTime = currentTime - this.lastUpdateTime;
        if (deltaTime < this.gameSpeed) return;

        this.lastUpdateTime = currentTime - (deltaTime % this.gameSpeed);

        this.update();
        this.draw();
    }

    update() {
        this.currentDirection = this.nextDirection;

        const head = this.snake[0];
        const newHead = {
            x: head.x + this.currentDirection.x,
            y: head.y + this.currentDirection.y
        };

        if (this.checkCollision(newHead)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += GAME_CONFIG.FOOD_POINTS;
            this.increaseSpeed();
            this.spawnFood();
        } else {
            this.snake.pop();
        }

        this.updateUI();
    }

    checkCollision(head) {
        const cols = Math.floor(this.canvas.width / GAME_CONFIG.GRID_SIZE);
        const rows = Math.floor(this.canvas.height / GAME_CONFIG.GRID_SIZE);

        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            return true;
        }

        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }

        return false;
    }

    increaseSpeed() {
        if (this.gameSpeed > GAME_CONFIG.MIN_SPEED) {
            this.gameSpeed -= GAME_CONFIG.SPEED_INCREMENT;
        }
    }

    gameOver() {
        this.gameState = GAME_STATE.GAME_OVER;
        cancelAnimationFrame(this.animationFrameId);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        this.updateUI();
    }

    draw() {
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();

        if (this.food) {
            this.drawFood();
        }

        if (this.snake.length > 0) {
            this.drawSnake();
        }
    }

    drawGrid() {
        const gridSize = GAME_CONFIG.GRID_SIZE;
        this.ctx.strokeStyle = GAME_CONFIG.COLORS.GRID;
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        const gridSize = GAME_CONFIG.GRID_SIZE;

        this.snake.forEach((segment, index) => {
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;

            if (index === 0) {
                this.ctx.fillStyle = GAME_CONFIG.COLORS.SNAKE_HEAD;
                this.ctx.shadowColor = GAME_CONFIG.COLORS.SNAKE_HEAD;
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.fillStyle = GAME_CONFIG.COLORS.SNAKE_BODY;
                this.ctx.shadowBlur = 0;
            }

            const padding = 2;
            this.ctx.beginPath();
            this.ctx.roundRect(
                x + padding,
                y + padding,
                gridSize - padding * 2,
                gridSize - padding * 2,
                5
            );
            this.ctx.fill();
        });

        this.ctx.shadowBlur = 0;
    }

    drawFood() {
        const gridSize = GAME_CONFIG.GRID_SIZE;
        const x = this.food.x * gridSize;
        const y = this.food.y * gridSize;

        this.ctx.fillStyle = GAME_CONFIG.COLORS.FOOD;
        this.ctx.shadowColor = GAME_CONFIG.COLORS.FOOD;
        this.ctx.shadowBlur = 15;

        const padding = 3;
        const centerX = x + gridSize / 2;
        const centerY = y + gridSize / 2;
        const radius = (gridSize - padding * 2) / 2;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;

        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        const overlay = document.getElementById('gameOverlay');
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayMessage = document.getElementById('overlayMessage');

        switch (this.gameState) {
            case GAME_STATE.IDLE:
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                restartBtn.disabled = true;
                overlay.classList.remove('hidden');
                overlayTitle.textContent = '准备开始';
                overlayMessage.textContent = '按空格键开始游戏';
                break;
            case GAME_STATE.PLAYING:
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                restartBtn.disabled = false;
                pauseBtn.textContent = '暂停';
                overlay.classList.add('hidden');
                break;
            case GAME_STATE.PAUSED:
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                restartBtn.disabled = false;
                pauseBtn.textContent = '继续';
                overlay.classList.remove('hidden');
                overlayTitle.textContent = '游戏暂停';
                overlayMessage.textContent = '按空格键继续游戏';
                break;
            case GAME_STATE.GAME_OVER:
                startBtn.disabled = true;
                pauseBtn.disabled = true;
                restartBtn.disabled = false;
                overlay.classList.remove('hidden');
                overlayTitle.textContent = '游戏结束';
                overlayMessage.textContent = `最终分数: ${this.score} | 按空格键重新开始`;
                break;
        }
    }

    getHighScore() {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
