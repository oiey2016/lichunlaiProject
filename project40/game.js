const CONFIG = {
    GRAVITY: 0.5,
    JUMP_FORCE: -10,
    PIPE_SPEED: 3,
    PIPE_SPAWN_INTERVAL: 2000,
    PIPE_GAP: 150,
    PIPE_WIDTH: 70,
    BIRD_WIDTH: 45,
    BIRD_HEIGHT: 45,
    GROUND_HEIGHT: 60
};

const GameState = {
    IDLE: 'idle',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

class Bird {
    constructor(element) {
        this.element = element;
        this.y = 200;
        this.velocity = 0;
        this.rotation = 0;
    }

    jump() {
        this.velocity = CONFIG.JUMP_FORCE;
    }

    update() {
        this.velocity += CONFIG.GRAVITY;
        this.y += this.velocity;
        this.rotation = Math.min(Math.max(this.velocity * 3, -30), 90);
    }

    render() {
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    reset() {
        this.y = 200;
        this.velocity = 0;
        this.rotation = 0;
        this.render();
    }

    getBounds() {
        return {
            left: 80,
            right: 80 + CONFIG.BIRD_WIDTH,
            top: this.y,
            bottom: this.y + CONFIG.BIRD_HEIGHT
        };
    }
}

class Pipe {
    constructor(x, gapY, container) {
        this.x = x;
        this.gapY = gapY;
        this.gapHeight = CONFIG.PIPE_GAP;
        this.passed = false;
        
        this.topPipe = document.createElement('div');
        this.topPipe.className = 'pipe pipe-top';
        this.topPipe.style.height = `${gapY}px`;
        this.topPipe.style.left = `${x}px`;
        
        this.bottomPipe = document.createElement('div');
        this.bottomPipe.className = 'pipe pipe-bottom';
        this.bottomPipe.style.height = `${500 - gapY - this.gapHeight - CONFIG.GROUND_HEIGHT}px`;
        this.bottomPipe.style.left = `${x}px`;
        
        container.appendChild(this.topPipe);
        container.appendChild(this.bottomPipe);
    }

    update() {
        this.x -= CONFIG.PIPE_SPEED;
    }

    render() {
        this.topPipe.style.left = `${this.x}px`;
        this.bottomPipe.style.left = `${this.x}px`;
    }

    remove() {
        this.topPipe.remove();
        this.bottomPipe.remove();
    }

    getBounds() {
        const topHeight = parseInt(this.topPipe.style.height);
        const bottomHeight = parseInt(this.bottomPipe.style.height);
        
        return {
            top: {
                left: this.x,
                right: this.x + CONFIG.PIPE_WIDTH,
                top: 0,
                bottom: topHeight
            },
            bottom: {
                left: this.x,
                right: this.x + CONFIG.PIPE_WIDTH,
                top: 500 - CONFIG.GROUND_HEIGHT - bottomHeight,
                bottom: 500 - CONFIG.GROUND_HEIGHT
            }
        };
    }
}

class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBestScore')) || 0;
        this.currentScoreElement = document.getElementById('currentScore');
        this.bestScoreElement = document.getElementById('bestScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.updateDisplay();
    }

    increment() {
        this.currentScore++;
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            localStorage.setItem('flappyBestScore', this.bestScore);
        }
        this.updateDisplay();
    }

    reset() {
        this.currentScore = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        this.currentScoreElement.textContent = this.currentScore;
        this.bestScoreElement.textContent = this.bestScore;
        this.finalScoreElement.textContent = this.currentScore;
    }
}

class Game {
    constructor() {
        this.gameCanvas = document.getElementById('gameCanvas');
        this.birdElement = document.getElementById('bird');
        this.pipesContainer = document.getElementById('pipesContainer');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.state = GameState.IDLE;
        this.bird = new Bird(this.birdElement);
        this.pipes = [];
        this.scoreManager = new ScoreManager();
        this.lastPipeSpawn = 0;
        this.animationId = null;
        this.canvasHeight = 500;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            }
        });

        this.gameCanvas.addEventListener('click', () => {
            this.handleInput();
        });

        this.startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.start();
        });

        this.restartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.restart();
        });
    }

    handleInput() {
        switch (this.state) {
            case GameState.IDLE:
                this.start();
                break;
            case GameState.PLAYING:
                this.bird.jump();
                break;
            case GameState.GAME_OVER:
                break;
        }
    }

    start() {
        this.state = GameState.PLAYING;
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.scoreManager.reset();
        this.bird.reset();
        this.clearPipes();
        this.lastPipeSpawn = Date.now();
        this.gameLoop();
    }

    restart() {
        this.start();
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        cancelAnimationFrame(this.animationId);
        this.scoreManager.updateDisplay();
        this.gameOverScreen.classList.remove('hidden');
    }

    clearPipes() {
        this.pipes.forEach(pipe => pipe.remove());
        this.pipes = [];
    }

    spawnPipe() {
        const minGapY = 80;
        const maxGapY = this.canvasHeight - CONFIG.GROUND_HEIGHT - CONFIG.PIPE_GAP - 80;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        const pipe = new Pipe(this.gameCanvas.offsetWidth, gapY, this.pipesContainer);
        this.pipes.push(pipe);
    }

    checkCollisions() {
        const birdBounds = this.bird.getBounds();

        if (birdBounds.top <= 0 || birdBounds.bottom >= this.canvasHeight - CONFIG.GROUND_HEIGHT) {
            return true;
        }

        for (const pipe of this.pipes) {
            const pipeBounds = pipe.getBounds();

            if (this.isColliding(birdBounds, pipeBounds.top)) {
                return true;
            }
            if (this.isColliding(birdBounds, pipeBounds.bottom)) {
                return true;
            }

            if (!pipe.passed && birdBounds.left > pipeBounds.top.right) {
                pipe.passed = true;
                this.scoreManager.increment();
            }
        }

        return false;
    }

    isColliding(rect1, rect2) {
        return rect1.left < rect2.right &&
               rect1.right > rect2.left &&
               rect1.top < rect2.bottom &&
               rect1.bottom > rect2.top;
    }

    gameLoop() {
        const now = Date.now();

        if (now - this.lastPipeSpawn > CONFIG.PIPE_SPAWN_INTERVAL) {
            this.spawnPipe();
            this.lastPipeSpawn = now;
        }

        this.bird.update();
        this.bird.render();

        this.pipes.forEach(pipe => {
            pipe.update();
            pipe.render();
        });

        this.pipes = this.pipes.filter(pipe => {
            if (pipe.x + CONFIG.PIPE_WIDTH < 0) {
                pipe.remove();
                return false;
            }
            return true;
        });

        if (this.checkCollisions()) {
            this.gameOver();
            return;
        }

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
