class FocusTrainer {
    constructor() {
        this.gridSize = 4;
        this.currentNumber = 1;
        this.totalNumbers = 0;
        this.timer = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.gameActive = false;
        this.bestScores = this.loadScores();
        
        this.initElements();
        this.initEventListeners();
        this.updateBestScoresDisplay();
    }

    initElements() {
        this.screens = {
            start: document.getElementById('start-screen'),
            rules: document.getElementById('rules-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };

        this.timerDisplay = document.getElementById('timer');
        this.currentNumberDisplay = document.getElementById('current-number');
        this.progressDisplay = document.getElementById('progress');
        this.gameGrid = document.getElementById('game-grid');
        this.bestScoresContainer = document.getElementById('best-scores');
    }

    initEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('rules-btn').addEventListener('click', () => this.showScreen('rules'));
        document.getElementById('back-to-start').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('home-btn').addEventListener('click', () => this.showScreen('start'));

        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target));
        });
    }

    selectDifficulty(btn) {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gridSize = parseInt(btn.dataset.size);
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    startGame() {
        this.currentNumber = 1;
        this.totalNumbers = this.gridSize * this.gridSize;
        this.elapsedTime = 0;
        this.gameActive = true;
        
        this.updateDisplay();
        this.generateGrid();
        this.showScreen('game');
        this.startTimer();
    }

    generateGrid() {
        this.gameGrid.innerHTML = '';
        this.gameGrid.className = `game-grid size-${this.gridSize}`;
        
        const numbers = Array.from({ length: this.totalNumbers }, (_, i) => i + 1);
        this.shuffleArray(numbers);

        numbers.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = num;
            cell.dataset.number = num;
            cell.addEventListener('click', () => this.handleCellClick(cell, num));
            this.gameGrid.appendChild(cell);
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    handleCellClick(cell, number) {
        if (!this.gameActive) return;

        if (number === this.currentNumber) {
            cell.classList.add('correct');
            this.currentNumber++;
            
            if (this.currentNumber > this.totalNumbers) {
                this.endGame();
            } else {
                this.updateDisplay();
            }
        } else {
            cell.classList.add('wrong');
            setTimeout(() => cell.classList.remove('wrong'), 300);
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
            this.timerDisplay.textContent = `${this.elapsedTime.toFixed(2)}s`;
        }, 10);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateDisplay() {
        this.currentNumberDisplay.textContent = this.currentNumber;
        this.progressDisplay.textContent = `${this.currentNumber - 1}/${this.totalNumbers}`;
    }

    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        const rating = this.calculateRating();
        this.saveScore(rating);
        this.showResult(rating);
    }

    calculateRating() {
        const avgTimePerNumber = this.elapsedTime / this.totalNumbers;
        
        const thresholds = {
            3: { S: 0.5, A: 0.8, B: 1.2 },
            4: { S: 0.6, A: 0.9, B: 1.3 },
            5: { S: 0.7, A: 1.0, B: 1.4 },
            6: { S: 0.8, A: 1.1, B: 1.5 }
        };

        const t = thresholds[this.gridSize];
        
        if (avgTimePerNumber <= t.S) return 'S';
        if (avgTimePerNumber <= t.A) return 'A';
        if (avgTimePerNumber <= t.B) return 'B';
        return 'C';
    }

    getRatingMessage(rating) {
        const messages = {
            S: '太神了！你的专注力已经达到大师级别！🏆',
            A: '非常棒！你的专注力非常出色！⭐',
            B: '不错！继续训练会有更大进步！💪',
            C: '加油！多练习就能看到明显提升！🎯'
        };
        return messages[rating];
    }

    showResult(rating) {
        document.getElementById('final-time').textContent = `${this.elapsedTime.toFixed(2)}s`;
        document.getElementById('final-difficulty').textContent = `${this.gridSize}×${this.gridSize}`;
        document.getElementById('final-rating').textContent = rating;
        document.getElementById('result-message').textContent = this.getRatingMessage(rating);
        
        const icons = { S: '🏆', A: '⭐', B: '💪', C: '🎯' };
        document.getElementById('result-icon').textContent = icons[rating];
        
        this.showScreen('result');
    }

    restartGame() {
        this.stopTimer();
        this.startGame();
    }

    quitGame() {
        this.gameActive = false;
        this.stopTimer();
        this.showScreen('start');
    }

    loadScores() {
        const saved = localStorage.getItem('focusTrainerScores');
        return saved ? JSON.parse(saved) : [];
    }

    saveScore(rating) {
        const score = {
            size: this.gridSize,
            time: this.elapsedTime,
            rating: rating,
            date: new Date().toISOString()
        };

        this.bestScores.push(score);
        this.bestScores.sort((a, b) => a.time - b.time);
        this.bestScores = this.bestScores.slice(0, 10);
        
        localStorage.setItem('focusTrainerScores', JSON.stringify(this.bestScores));
        this.updateBestScoresDisplay();
    }

    updateBestScoresDisplay() {
        if (this.bestScores.length === 0) {
            this.bestScoresContainer.innerHTML = '<p class="no-record">暂无记录，开始你的第一次训练吧！</p>';
            return;
        }

        const difficultyNames = { 3: '3×3', 4: '4×4', 5: '5×5', 6: '6×6' };
        
        this.bestScoresContainer.innerHTML = this.bestScores.map(score => `
            <div class="score-item">
                <span class="score-difficulty">${difficultyNames[score.size]}</span>
                <span class="score-time">${score.time.toFixed(2)}s</span>
                <span class="score-rating ${score.rating}">${score.rating}</span>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FocusTrainer();
});
