import { CONFIG } from './config.js';
import { InputHandler } from './input.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacle.js';
import { Renderer } from './renderer.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        this.input = new InputHandler();
        this.player = new Player(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.obstacleManager = new ObstacleManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.renderer = new Renderer(this.ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('templeRunHighScore')) || 0;
        this.speed = CONFIG.GAME.INITIAL_SPEED;
        this.isRunning = false;
        this.animationId = null;
        
        this.initUI();
        this.updateHighScoreDisplay();
    }
    
    initUI() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        startBtn.addEventListener('click', () => this.start());
        restartBtn.addEventListener('click', () => this.restart());
    }
    
    start() {
        document.getElementById('start-screen').classList.add('hidden');
        this.isRunning = true;
        this.gameLoop();
    }
    
    restart() {
        document.getElementById('game-over-screen').classList.add('hidden');
        this.reset();
        this.isRunning = true;
        this.gameLoop();
    }
    
    reset() {
        this.score = 0;
        this.speed = CONFIG.GAME.INITIAL_SPEED;
        this.player.reset();
        this.obstacleManager.reset();
        this.input.reset();
        this.updateScoreDisplay();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        const laneChange = this.input.getLaneChange();
        if (laneChange !== 0) {
            this.player.changeLane(laneChange);
        }
        
        if (this.input.wantsJump()) {
            this.player.jump();
        }
        
        if (this.input.wantsSlide()) {
            this.player.slide();
        }
        
        this.player.update();
        this.obstacleManager.update(this.speed);
        
        if (this.speed < CONFIG.GAME.MAX_SPEED) {
            this.speed += CONFIG.GAME.SPEED_INCREMENT;
        }
        
        this.score += CONFIG.GAME.SCORE_PER_FRAME;
        this.updateScoreDisplay();
        
        if (this.obstacleManager.checkCollision(this.player)) {
            this.gameOver();
        }
    }
    
    render() {
        this.renderer.render(this.speed);
        this.obstacleManager.draw(this.ctx);
        this.player.draw(this.ctx);
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        document.getElementById('highscore').textContent = this.highScore;
    }
    
    gameOver() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('templeRunHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
        
        document.getElementById('final-score').textContent = this.score;
        const newRecordElement = document.querySelector('.new-record');
        if (isNewRecord) {
            newRecordElement.classList.remove('hidden');
        } else {
            newRecordElement.classList.add('hidden');
        }
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
}

window.addEventListener('load', () => {
    new Game();
});