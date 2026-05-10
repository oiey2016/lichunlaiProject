class Minesweeper {
    constructor() {
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'medium';
        this.rows = 16;
        this.cols = 16;
        this.mines = 40;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.flagCount = 0;
        this.revealedCount = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.newGame();
    }
    
    bindEvents() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.newGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame());
        document.getElementById('modal-restart').addEventListener('click', () => {
            this.hideModal();
            this.newGame();
        });
        
        document.getElementById('game-board').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                this.handleRightClick(e.target);
            }
        });
        
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleLeftClick(e.target);
            }
        });
        
        document.getElementById('game-board').addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleDoubleClick(e.target);
            }
        });
    }
    
    newGame() {
        const config = this.difficulties[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mines = config.mines;
        
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.timer = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.initializeBoard();
        this.renderBoard();
        this.updateDisplay();
        this.updateStatus('点击任意格子开始游戏');
    }
    
    initializeBoard() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = [];
            this.revealed[r] = [];
            this.flagged[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.board[r][c] = 0;
                this.revealed[r][c] = false;
                this.flagged[r][c] = false;
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        let placed = 0;
        while (placed < this.mines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            
            const isExcluded = Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1;
            
            if (this.board[r][c] !== -1 && !isExcluded) {
                this.board[r][c] = -1;
                placed++;
            }
        }
        
        this.calculateNumbers();
    }
    
    calculateNumbers() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === -1) continue;
                
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (this.isValid(nr, nc) && this.board[nr][nc] === -1) {
                            count++;
                        }
                    }
                }
                this.board[r][c] = count;
            }
        }
    }
    
    isValid(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
    }
    
    renderBoard() {
        const boardEl = document.getElementById('game-board');
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell hidden';
                cell.dataset.row = r;
                cell.dataset.col = c;
                boardEl.appendChild(cell);
            }
        }
    }
    
    handleLeftClick(cellEl) {
        if (this.gameOver) return;
        
        const r = parseInt(cellEl.dataset.row);
        const c = parseInt(cellEl.dataset.col);
        
        if (this.flagged[r][c] || this.revealed[r][c]) return;
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(r, c);
            this.startTimer();
            this.updateStatus('游戏进行中...');
        }
        
        this.revealCell(r, c);
    }
    
    handleRightClick(cellEl) {
        if (this.gameOver) return;
        
        const r = parseInt(cellEl.dataset.row);
        const c = parseInt(cellEl.dataset.col);
        
        if (this.revealed[r][c]) return;
        
        if (this.flagged[r][c]) {
            this.flagged[r][c] = false;
            this.flagCount--;
            cellEl.classList.remove('flagged');
        } else {
            this.flagged[r][c] = true;
            this.flagCount++;
            cellEl.classList.add('flagged');
        }
        
        this.updateDisplay();
        this.checkWin();
    }
    
    handleDoubleClick(cellEl) {
        if (this.gameOver) return;
        
        const r = parseInt(cellEl.dataset.row);
        const c = parseInt(cellEl.dataset.col);
        
        if (!this.revealed[r][c] || this.board[r][c] === 0) return;
        
        let flagCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (this.isValid(nr, nc) && this.flagged[nr][nc]) {
                    flagCount++;
                }
            }
        }
        
        if (flagCount === this.board[r][c]) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (this.isValid(nr, nc) && !this.flagged[nr][nc] && !this.revealed[nr][nc]) {
                        this.revealCell(nr, nc);
                        if (this.gameOver) return;
                    }
                }
            }
        }
    }
    
    revealCell(r, c) {
        if (!this.isValid(r, c) || this.revealed[r][c] || this.flagged[r][c]) return;
        
        this.revealed[r][c] = true;
        this.revealedCount++;
        
        const cellEl = this.getCellElement(r, c);
        cellEl.classList.remove('hidden', 'flagged');
        cellEl.classList.add('revealed');
        
        if (this.board[r][c] === -1) {
            this.gameOver = true;
            this.endGame(false);
            return;
        }
        
        if (this.board[r][c] > 0) {
            cellEl.textContent = this.board[r][c];
            cellEl.dataset.num = this.board[r][c];
        }
        
        if (this.board[r][c] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    this.revealCell(r + dr, c + dc);
                }
            }
        }
        
        this.updateDisplay();
        this.checkWin();
    }
    
    getCellElement(r, c) {
        return document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
    }
    
    checkWin() {
        const totalCells = this.rows * this.cols;
        const safeCells = totalCells - this.mines;
        
        if (this.revealedCount === safeCells) {
            this.gameOver = true;
            this.gameWon = true;
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.stopTimer();
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === -1) {
                    const cellEl = this.getCellElement(r, c);
                    cellEl.classList.remove('hidden');
                    cellEl.classList.add('revealed', 'mine');
                }
            }
        }
        
        if (won) {
            this.updateStatus('🎉 恭喜你赢了！');
            this.showModal('胜利！', `你用了 ${this.timer} 秒完成了游戏！`, true);
        } else {
            this.updateStatus('💥 游戏结束！你踩到地雷了！');
            this.showModal('游戏结束', '很遗憾，你踩到地雷了！再试一次吧！', false);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        document.getElementById('mine-count').textContent = this.mines;
        document.getElementById('flag-count').textContent = this.flagCount;
        document.getElementById('timer').textContent = String(this.timer).padStart(3, '0');
    }
    
    updateStatus(message) {
        document.getElementById('game-status').textContent = message;
    }
    
    showModal(title, message, isWin) {
        const modal = document.getElementById('game-modal');
        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        modalContent.classList.remove('win', 'lose');
        modalContent.classList.add(isWin ? 'win' : 'lose');
        
        modal.classList.remove('hidden');
    }
    
    hideModal() {
        document.getElementById('game-modal').classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
