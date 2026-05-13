class Game {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartGameBtn = document.getElementById('restart-game-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.finalScoreElement = document.getElementById('final-score');
        this.newRecordElement = document.getElementById('new-record');

        this.rows = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('blackTileHighScore')) || 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameSpeed = 2;
        this.speedIncrement = 0.1;
        this.rowsPerLevel = 10;
        this.rowsCreated = 0;
        this.rowHeight = 100;
        this.animationId = null;
        this.lastTime = 0;

        this.init();
    }

    init() {
        this.highScoreElement.textContent = this.highScore;
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartGameBtn.addEventListener('click', () => this.restartGameInGame());
        this.homeBtn.addEventListener('click', () => this.goHome());
    }

    showGameControls() {
        this.restartGameBtn.classList.remove('hidden');
        this.homeBtn.classList.remove('hidden');
    }

    hideGameControls() {
        this.restartGameBtn.classList.add('hidden');
        this.homeBtn.classList.add('hidden');
    }

    startGame() {
        this.score = 0;
        this.gameSpeed = 2;
        this.rowsCreated = 0;
        this.rows = [];
        this.isPlaying = true;
        this.isPaused = false;
        
        this.updateScore();
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseBtn.disabled = false;
        this.pauseBtn.textContent = '暂停';
        this.showGameControls();
        
        this.clearBoard();
        this.createInitialRows();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restartGameInGame() {
        this.startGame();
    }

    goHome() {
        this.isPlaying = false;
        this.isPaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.score = 0;
        this.updateScore();
        this.clearBoard();
        
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.hideGameControls();
        this.gameOverScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
    }

    restartGame() {
        this.startGame();
    }

    togglePause() {
        if (!this.isPlaying) return;
        
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        
        if (!this.isPaused) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    clearBoard() {
        const tiles = this.gameBoard.querySelectorAll('.row');
        tiles.forEach(tile => tile.remove());
    }

    createInitialRows() {
        for (let i = 0; i < 6; i++) {
            this.createRow(-i * this.rowHeight);
        }
    }

    createRow(yPosition) {
        const row = document.createElement('div');
        row.className = 'row';
        row.style.top = `${yPosition}px`;
        
        const blackTileIndex = Math.floor(Math.random() * 4);
        
        for (let i = 0; i < 4; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            
            if (i === blackTileIndex) {
                tile.classList.add('black');
                tile.dataset.isBlack = 'true';
            } else {
                tile.classList.add('white');
                tile.dataset.isBlack = 'false';
            }
            
            tile.addEventListener('click', (e) => this.handleTileClick(e, tile));
            row.appendChild(tile);
        }
        
        this.gameBoard.appendChild(row);
        this.rows.push({
            element: row,
            y: yPosition,
            clicked: false
        });
        
        this.rowsCreated++;
    }

    handleTileClick(event, tile) {
        if (!this.isPlaying || this.isPaused) return;
        
        event.stopPropagation();
        
        if (tile.dataset.isBlack === 'true') {
            if (!tile.classList.contains('clicked')) {
                tile.classList.add('clicked');
                tile.textContent = '✓';
                this.score++;
                this.updateScore();
                
                const rowData = this.rows.find(r => r.element === tile.parentElement);
                if (rowData) {
                    rowData.clicked = true;
                }
                
                if (this.score % this.rowsPerLevel === 0) {
                    this.gameSpeed += this.speedIncrement;
                }
            }
        } else {
            tile.classList.add('wrong');
            tile.textContent = '✗';
            this.gameOver('wrong');
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    gameLoop(currentTime = 0) {
        if (!this.isPlaying || this.isPaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.updateRows(deltaTime);
        this.checkMissedTiles();
        this.addNewRows();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    updateRows(deltaTime) {
        const moveDistance = (this.gameSpeed * deltaTime) / 16;
        
        this.rows.forEach(rowData => {
            rowData.y += moveDistance;
            rowData.element.style.top = `${rowData.y}px`;
        });
    }

    checkMissedTiles() {
        const boardHeight = 500;
        
        for (let i = this.rows.length - 1; i >= 0; i--) {
            const rowData = this.rows[i];
            
            if (rowData.y > boardHeight - this.rowHeight && !rowData.clicked) {
                const blackTile = rowData.element.querySelector('.tile.black');
                if (blackTile && !blackTile.classList.contains('clicked')) {
                    blackTile.classList.add('missed');
                    blackTile.textContent = '!';
                    this.gameOver('missed');
                    return;
                }
            }
            
            if (rowData.y > boardHeight + 50) {
                rowData.element.remove();
                this.rows.splice(i, 1);
            }
        }
    }

    addNewRows() {
        const topRow = this.rows.reduce((min, row) => row.y < min.y ? row : min, this.rows[0]);
        
        if (topRow && topRow.y > -this.rowHeight) {
            this.createRow(topRow.y - this.rowHeight);
        }
    }

    gameOver(reason) {
        this.isPlaying = false;
        this.pauseBtn.disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        setTimeout(() => {
            this.finalScoreElement.textContent = this.score;
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('blackTileHighScore', this.highScore);
                this.highScoreElement.textContent = this.highScore;
                this.newRecordElement.classList.remove('hidden');
            } else {
                this.newRecordElement.classList.add('hidden');
            }
            
            this.hideGameControls();
            this.gameOverScreen.classList.remove('hidden');
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
