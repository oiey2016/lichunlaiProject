class UIManager {
    constructor() {
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.victoryScreen = document.getElementById('victoryScreen');
        this.pauseOverlay = document.getElementById('pauseOverlay');
        
        this.playerHealthBar = document.getElementById('playerHealth');
        this.playerHealthText = document.getElementById('playerHealthText');
        this.currentLevelText = document.getElementById('currentLevel');
        this.scoreText = document.getElementById('score');
        this.enemyCountText = document.getElementById('enemyCount');
        this.finalScoreText = document.getElementById('finalScore');
        this.finalLevelText = document.getElementById('finalLevel');
        this.victoryScoreText = document.getElementById('victoryScore');
        
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.restartGameBtn = document.getElementById('restartGameBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => {
            game.startGame();
        });

        this.restartBtn.addEventListener('click', () => {
            game.restartGame();
        });

        this.playAgainBtn.addEventListener('click', () => {
            game.restartGame();
        });

        this.homeBtn.addEventListener('click', () => {
            game.goToHome();
        });

        this.restartGameBtn.addEventListener('click', () => {
            game.restartGame();
        });

        this.pauseBtn.addEventListener('click', () => {
            game.togglePause();
        });

        this.resumeBtn.addEventListener('click', () => {
            game.togglePause();
        });
    }

    showStartScreen() {
        this.hideAllScreens();
        this.startScreen.classList.remove('hidden');
    }

    showGameScreen() {
        this.hideAllScreens();
        this.gameScreen.classList.remove('hidden');
    }

    showGameOverScreen(score, level) {
        this.hideAllScreens();
        this.finalScoreText.textContent = score;
        this.finalLevelText.textContent = level + 1;
        this.gameOverScreen.classList.remove('hidden');
    }

    showVictoryScreen(score) {
        this.hideAllScreens();
        this.victoryScoreText.textContent = score;
        this.victoryScreen.classList.remove('hidden');
    }

    hideAllScreens() {
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
    }

    updatePlayerHealth(health, maxHealth) {
        const percentage = (health / maxHealth) * 100;
        this.playerHealthBar.style.width = percentage + '%';
        this.playerHealthText.textContent = Math.ceil(health);
        
        if (percentage < 30) {
            this.playerHealthBar.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #ee5a24 100%)';
        } else if (percentage < 60) {
            this.playerHealthBar.style.background = 'linear-gradient(180deg, #ffd93d 0%, #f39c12 100%)';
        } else {
            this.playerHealthBar.style.background = 'linear-gradient(180deg, #00ff88 0%, #00cc6a 100%)';
        }
    }

    updateLevel(level) {
        this.currentLevelText.textContent = level + 1;
    }

    updateScore(score) {
        this.scoreText.textContent = score;
    }

    updateEnemyCount(count) {
        this.enemyCountText.textContent = count;
    }

    showLevelTransition(levelName) {
        const transition = document.createElement('div');
        transition.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out forwards;
        `;
        
        const text = document.createElement('div');
        text.style.cssText = `
            color: #00ff88;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 0 0 20px #00ff88;
        `;
        text.textContent = `第 ${game.levelManager.currentLevel + 1} 关: ${levelName}`;
        
        transition.appendChild(text);
        this.gameScreen.appendChild(transition);
        
        setTimeout(() => {
            transition.remove();
        }, 2000);
    }

    showPauseOverlay() {
        this.pauseOverlay.classList.remove('hidden');
        this.pauseBtn.classList.add('paused');
        this.pauseBtn.textContent = '继续';
    }

    hidePauseOverlay() {
        this.pauseOverlay.classList.add('hidden');
        this.pauseBtn.classList.remove('paused');
        this.pauseBtn.textContent = '暂停';
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);