import { CONFIG } from './config.js';
import { Snail } from './snail.js';
import { ObstacleManager } from './obstacle.js';
import { Renderer } from './renderer.js';

export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    LEVEL_COMPLETE: 'levelComplete'
};

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = GameState.MENU;
        this.score = 0;
        this.level = 1;
        this.speed = CONFIG.LEVEL.BASE_SPEED;
        
        this.snail = new Snail();
        this.obstacleManager = new ObstacleManager();
        this.renderer = new Renderer(this.ctx);
        
        this.animationId = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
        });
    }

    handleInput() {
        switch (this.state) {
            case GameState.PLAYING:
                this.snail.jump();
                break;
        }
    }

    start() {
        this.state = GameState.PLAYING;
        this.score = 0;
        this.level = 1;
        this.speed = CONFIG.LEVEL.BASE_SPEED;
        this.snail.reset();
        this.obstacleManager.reset();
        this.gameLoop();
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.speed = CONFIG.LEVEL.BASE_SPEED;
        this.snail.reset();
        this.obstacleManager.reset();
        this.state = GameState.PLAYING;
        this.gameLoop();
    }

    nextLevel() {
        this.level++;
        this.speed = CONFIG.LEVEL.BASE_SPEED + (this.level - 1) * CONFIG.LEVEL.SPEED_INCREMENT;
        this.snail.reset();
        this.obstacleManager.reset();
        this.state = GameState.PLAYING;
        this.gameLoop();
    }

    gameLoop() {
        if (this.state !== GameState.PLAYING) {
            return;
        }

        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.snail.update();
        this.obstacleManager.update(this.speed, this.level);

        const snailBounds = this.snail.getBounds();
        
        if (this.obstacleManager.checkCollision(snailBounds)) {
            this.gameOver();
            return;
        }

        if (this.obstacleManager.checkFinish(this.snail.x + this.snail.width)) {
            this.levelComplete();
            return;
        }

        const passed = this.obstacleManager.getPassedCount();
        this.score = Math.max(this.score, passed * 100);
    }

    render() {
        this.renderer.render(this.snail, this.obstacleManager, this.speed);
        this.updateUI();
    }

    updateUI() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const finalScore = document.getElementById('finalScore');
        const finalLevel = document.getElementById('finalLevel');
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        if (finalScore) finalScore.textContent = this.score;
        if (finalLevel) finalLevel.textContent = this.level;
        if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    }

    levelComplete() {
        this.state = GameState.LEVEL_COMPLETE;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const levelScore = document.getElementById('levelScore');
        const winScreen = document.getElementById('winScreen');
        
        this.score += 500 * this.level;
        
        if (levelScore) levelScore.textContent = this.score;
        if (winScreen) winScreen.classList.remove('hidden');
    }

    getState() {
        return this.state;
    }

    getScore() {
        return this.score;
    }

    getLevel() {
        return this.level;
    }
}