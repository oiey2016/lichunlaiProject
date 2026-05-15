class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        
        this.input = new InputManager();
        this.effects = new EffectManager();
        this.levelManager = new LevelManager();
        this.ui = new UIManager();
        
        this.player = null;
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.ui.showStartScreen();
    }

    startGame() {
        this.score = 0;
        this.isRunning = true;
        this.isPaused = false;
        
        this.player = new Player(100, GROUND_Y - PLAYER_CONFIG.height);
        this.levelManager.startLevel(0);
        
        this.ui.showGameScreen();
        this.ui.hidePauseOverlay();
        this.ui.updateLevel(this.levelManager.currentLevel);
        this.ui.updateScore(this.score);
        this.ui.showLevelTransition(this.levelManager.getLevelName());
        
        this.input.clear();
        
        requestAnimationFrame(this.gameLoop);
    }

    restartGame() {
        this.isPaused = false;
        this.ui.hidePauseOverlay();
        this.startGame();
    }

    goToHome() {
        this.isRunning = false;
        this.isPaused = false;
        this.ui.hidePauseOverlay();
        this.ui.showStartScreen();
    }

    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.ui.showPauseOverlay();
        } else {
            this.ui.hidePauseOverlay();
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.isPaused) {
            this.update();
            this.draw();
        }

        requestAnimationFrame(this.gameLoop);
    }

    update() {
        this.player.update(this.input, this.levelManager.enemies);
        
        this.levelManager.enemies.forEach(enemy => {
            enemy.update(this.player);
        });
        
        this.levelManager.update();
        this.effects.update();
        
        this.checkGameState();
        this.updateUI();
    }

    draw() {
        this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        this.levelManager.drawBackground(this.ctx);
        
        this.levelManager.enemies.forEach(enemy => {
            enemy.draw(this.ctx);
        });
        
        this.player.draw(this.ctx);
        
        this.effects.draw(this.ctx);
        
        this.drawCombo();
    }

    drawCombo() {
        if (this.player.combo >= 3) {
            this.ctx.save();
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(
                `${Math.floor(this.player.combo)} 连击!`,
                GAME_WIDTH / 2,
                150
            );
            this.ctx.restore();
        }
    }

    checkGameState() {
        if (this.player.isDead) {
            this.gameOver();
            return;
        }

        if (this.levelManager.isLevelComplete) {
            if (this.levelManager.hasNextLevel()) {
                this.nextLevel();
            } else {
                this.victory();
            }
        }
    }

    nextLevel() {
        const nextLevelIndex = this.levelManager.currentLevel + 1;
        this.levelManager.startLevel(nextLevelIndex);
        this.ui.updateLevel(nextLevelIndex);
        this.ui.showLevelTransition(this.levelManager.getLevelName());
        
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
    }

    gameOver() {
        this.isRunning = false;
        this.ui.showGameOverScreen(this.score, this.levelManager.currentLevel);
    }

    victory() {
        this.isRunning = false;
        this.ui.showVictoryScreen(this.score);
    }

    addScore(points) {
        const comboMultiplier = 1 + this.player.combo * 0.1;
        this.score += Math.floor(points * comboMultiplier);
    }

    updateUI() {
        this.ui.updatePlayerHealth(this.player.health, this.player.maxHealth);
        this.ui.updateEnemyCount(this.levelManager.enemies.length);
        this.ui.updateScore(this.score);
    }
}