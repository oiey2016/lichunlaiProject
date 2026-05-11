class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameOver = false;
        this.gameWon = false;
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.newGameBtn = document.getElementById('new-game-btn');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startNewGame();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
    }
    
    handleKeyPress(e) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            'W': 'up',
            's': 'down',
            'S': 'down',
            'a': 'left',
            'A': 'left',
            'd': 'right',
            'D': 'right'
        };
        
        if (keyMap[e.key]) {
            e.preventDefault();
            this.move(keyMap[e.key]);
        }
    }
    
    startNewGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.hideGameMessage();
        this.updateScore();
        
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
    
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                grid[i][j] = null;
            }
        }
        return grid;
    }
    
    getEmptyCells() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === null) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        return emptyCells;
    }
    
    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return false;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }
    
    move(direction) {
        if (this.gameOver) return;
        
        let moved = false;
        const previousGrid = this.copyGrid();
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.render();
            this.checkGameState();
        }
    }
    
    moveLeft() {
        let moved = false;
        
        for (let i = 0; i < this.gridSize; i++) {
            const row = this.grid[i].filter(cell => cell !== null);
            const newRow = [];
            let j = 0;
            
            while (j < row.length) {
                if (j + 1 < row.length && row[j] === row[j + 1]) {
                    const mergedValue = row[j] * 2;
                    newRow.push(mergedValue);
                    this.score += mergedValue;
                    j += 2;
                } else {
                    newRow.push(row[j]);
                    j++;
                }
            }
            
            while (newRow.length < this.gridSize) {
                newRow.push(null);
            }
            
            for (let k = 0; k < this.gridSize; k++) {
                if (this.grid[i][k] !== newRow[k]) {
                    moved = true;
                }
                this.grid[i][k] = newRow[k];
            }
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        
        for (let i = 0; i < this.gridSize; i++) {
            const row = this.grid[i].filter(cell => cell !== null);
            const newRow = [];
            let j = row.length - 1;
            
            while (j >= 0) {
                if (j - 1 >= 0 && row[j] === row[j - 1]) {
                    const mergedValue = row[j] * 2;
                    newRow.unshift(mergedValue);
                    this.score += mergedValue;
                    j -= 2;
                } else {
                    newRow.unshift(row[j]);
                    j--;
                }
            }
            
            while (newRow.length < this.gridSize) {
                newRow.unshift(null);
            }
            
            for (let k = 0; k < this.gridSize; k++) {
                if (this.grid[i][k] !== newRow[k]) {
                    moved = true;
                }
                this.grid[i][k] = newRow[k];
            }
        }
        
        return moved;
    }
    
    moveUp() {
        let moved = false;
        
        for (let j = 0; j < this.gridSize; j++) {
            const column = [];
            for (let i = 0; i < this.gridSize; i++) {
                if (this.grid[i][j] !== null) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const newColumn = [];
            let k = 0;
            
            while (k < column.length) {
                if (k + 1 < column.length && column[k] === column[k + 1]) {
                    const mergedValue = column[k] * 2;
                    newColumn.push(mergedValue);
                    this.score += mergedValue;
                    k += 2;
                } else {
                    newColumn.push(column[k]);
                    k++;
                }
            }
            
            while (newColumn.length < this.gridSize) {
                newColumn.push(null);
            }
            
            for (let i = 0; i < this.gridSize; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        
        for (let j = 0; j < this.gridSize; j++) {
            const column = [];
            for (let i = 0; i < this.gridSize; i++) {
                if (this.grid[i][j] !== null) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const newColumn = [];
            let k = column.length - 1;
            
            while (k >= 0) {
                if (k - 1 >= 0 && column[k] === column[k - 1]) {
                    const mergedValue = column[k] * 2;
                    newColumn.unshift(mergedValue);
                    this.score += mergedValue;
                    k -= 2;
                } else {
                    newColumn.unshift(column[k]);
                    k--;
                }
            }
            
            while (newColumn.length < this.gridSize) {
                newColumn.unshift(null);
            }
            
            for (let i = 0; i < this.gridSize; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        
        return moved;
    }
    
    copyGrid() {
        return this.grid.map(row => [...row]);
    }
    
    checkGameState() {
        this.updateScore();
        
        if (this.checkWin() && !this.gameWon) {
            this.gameWon = true;
            this.showGameMessage('恭喜获胜！', '你已经达到了 2048！', '继续游戏');
            return;
        }
        
        if (this.checkGameOver()) {
            this.gameOver = true;
            this.showGameMessage('游戏结束', '没有可移动的方块了', '重新开始');
        }
    }
    
    checkWin() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        if (this.getEmptyCells().length > 0) {
            return false;
        }
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                
                if (j + 1 < this.gridSize && this.grid[i][j + 1] === current) {
                    return false;
                }
                
                if (i + 1 < this.gridSize && this.grid[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    saveBestScore() {
        try {
            localStorage.setItem('2048-best-score', this.bestScore.toString());
        } catch (e) {
            console.error('无法保存最佳分数:', e);
        }
    }
    
    loadBestScore() {
        try {
            const saved = localStorage.getItem('2048-best-score');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.error('无法加载最佳分数:', e);
            return 0;
        }
    }
    
    showGameMessage(title, message, buttonText) {
        this.gameMessage.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <button class="btn" id="game-message-btn">${buttonText}</button>
        `;
        this.gameMessage.classList.add('show');
        
        document.getElementById('game-message-btn').addEventListener('click', () => {
            if (this.gameOver) {
                this.startNewGame();
            } else {
                this.hideGameMessage();
            }
        });
    }
    
    hideGameMessage() {
        this.gameMessage.classList.remove('show');
    }
    
    render() {
        this.tileContainer.innerHTML = '';
        
        const containerWidth = this.tileContainer.offsetWidth;
        const containerHeight = this.tileContainer.offsetHeight;
        const gap = 12;
        const cellSize = (containerWidth - gap * 3) / 4;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const value = this.grid[i][j];
                if (value !== null) {
                    const tile = document.createElement('div');
                    tile.className = `tile ${value <= 2048 ? `tile-${value}` : 'tile-super'}`;
                    tile.textContent = value;
                    
                    const x = j * (cellSize + gap);
                    const y = i * (cellSize + gap);
                    
                    tile.style.left = `${x}px`;
                    tile.style.top = `${y}px`;
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
