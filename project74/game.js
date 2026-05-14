class Match3Game {
    constructor() {
        this.boardSize = 8;
        this.gemTypes = 7;
        this.gemEmojis = ['💎', '🔮', '⭐', '💜', '💙', '🔷', '💚'];
        this.board = [];
        this.selectedGem = null;
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.targetScore = 1000;
        this.combo = 0;
        this.isAnimating = false;
        this.hintUsed = 0;
        this.shuffleUsed = 0;

        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        this.bindEvents();
        this.checkForMatchesAndProcess();
    }

    createBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                let gemType;
                do {
                    gemType = Math.floor(Math.random() * this.gemTypes);
                } while (this.wouldCreateMatch(row, col, gemType));
                this.board[row][col] = gemType;
            }
        }
    }

    wouldCreateMatch(row, col, type) {
        if (col >= 2 &&
            this.board[row][col - 1] === type &&
            this.board[row][col - 2] === type) {
            return true;
        }
        if (row >= 2 &&
            this.board[row - 1][col] === type &&
            this.board[row - 2][col] === type) {
            return true;
        }
        return false;
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const gem = document.createElement('div');
                gem.className = `gem gem-${this.board[row][col]}`;
                gem.textContent = this.gemEmojis[this.board[row][col]];
                gem.dataset.row = row;
                gem.dataset.col = col;
                gem.addEventListener('click', () => this.handleGemClick(row, col));
                gameBoard.appendChild(gem);
            }
        }
    }

    bindEvents() {
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffleBoard());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRules());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('modalBtn').addEventListener('click', () => this.handleModalClose());
        document.getElementById('closeRulesBtn').addEventListener('click', () => this.closeRules());
    }

    handleGemClick(row, col) {
        if (this.isAnimating) return;

        const gemElement = this.getGemElement(row, col);

        if (this.selectedGem === null) {
            this.selectedGem = { row, col };
            gemElement.classList.add('selected');
        } else {
            const prevSelected = this.selectedGem;
            this.getGemElement(prevSelected.row, prevSelected.col).classList.remove('selected');

            if (this.areAdjacent(prevSelected.row, prevSelected.col, row, col)) {
                this.swapGems(prevSelected.row, prevSelected.col, row, col);
            } else {
                this.selectedGem = { row, col };
                gemElement.classList.add('selected');
                return;
            }

            this.selectedGem = null;
        }
    }

    areAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async swapGems(row1, col1, row2, col2) {
        this.isAnimating = true;

        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;

        this.renderBoard();

        const matches = this.findAllMatches();

        if (matches.length > 0) {
            this.moves--;
            this.combo = 0;
            await this.processMatches();
        } else {
            const temp = this.board[row1][col1];
            this.board[row1][col1] = this.board[row2][col2];
            this.board[row2][col2] = temp;
            this.renderBoard();
        }

        this.updateUI();
        this.checkGameState();
        this.isAnimating = false;
    }

    findAllMatches() {
        const matches = new Set();

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                const type = this.board[row][col];
                if (type !== null &&
                    this.board[row][col + 1] === type &&
                    this.board[row][col + 2] === type) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row},${col + 1}`);
                    matches.add(`${row},${col + 2}`);
                }
            }
        }

        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize - 2; row++) {
                const type = this.board[row][col];
                if (type !== null &&
                    this.board[row + 1][col] === type &&
                    this.board[row + 2][col] === type) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row + 1},${col}`);
                    matches.add(`${row + 2},${col}`);
                }
            }
        }

        return Array.from(matches).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return { row, col };
        });
    }

    async processMatches() {
        let matches = this.findAllMatches();

        while (matches.length > 0) {
            this.combo++;

            if (this.combo > 1) {
                this.showCombo(this.combo);
            }

            const baseScore = matches.length * 10;
            const comboMultiplier = this.combo;
            const earnedScore = baseScore * comboMultiplier;
            this.score += earnedScore;

            matches.forEach(({ row, col }) => {
                const gem = this.getGemElement(row, col);
                if (gem) gem.classList.add('matching');
            });

            await this.sleep(400);

            matches.forEach(({ row, col }) => {
                this.board[row][col] = null;
            });

            await this.dropGems();
            await this.fillEmptySpaces();
            this.updateUI();

            matches = this.findAllMatches();
        }
    }

    async dropGems() {
        let dropped = false;

        for (let col = 0; col < this.boardSize; col++) {
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] === null) {
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        if (this.board[aboveRow][col] !== null) {
                            this.board[row][col] = this.board[aboveRow][col];
                            this.board[aboveRow][col] = null;
                            dropped = true;
                            break;
                        }
                    }
                }
            }
        }

        if (dropped) {
            this.renderBoard();
            document.querySelectorAll('.gem').forEach(gem => {
                gem.classList.add('falling');
            });
            await this.sleep(300);
        }
    }

    async fillEmptySpaces() {
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = Math.floor(Math.random() * this.gemTypes);
                }
            }
        }

        this.renderBoard();
        document.querySelectorAll('.gem').forEach(gem => {
            gem.classList.add('falling');
        });
        await this.sleep(300);
    }

    async checkForMatchesAndProcess() {
        let matches = this.findAllMatches();
        if (matches.length > 0) {
            this.combo = 0;
            await this.processMatches();
        }
    }

    findPossibleMoves() {
        const moves = [];

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (col < this.boardSize - 1) {
                    this.board[row][col] = [this.board[row][col + 1], this.board[row][col + 1] = this.board[row][col]][0];
                    if (this.findAllMatches().length > 0) {
                        moves.push([{ row, col }, { row, col: col + 1 }]);
                    }
                    this.board[row][col] = [this.board[row][col + 1], this.board[row][col + 1] = this.board[row][col]][0];
                }

                if (row < this.boardSize - 1) {
                    this.board[row][col] = [this.board[row + 1][col], this.board[row + 1][col] = this.board[row][col]][0];
                    if (this.findAllMatches().length > 0) {
                        moves.push([{ row, col }, { row: row + 1, col }]);
                    }
                    this.board[row][col] = [this.board[row + 1][col], this.board[row + 1][col] = this.board[row][col]][0];
                }
            }
        }

        return moves;
    }

    showHint() {
        if (this.isAnimating) return;

        const moves = this.findPossibleMoves();
        if (moves.length > 0) {
            this.hintUsed++;
            const [gem1, gem2] = moves[0];
            const element1 = this.getGemElement(gem1.row, gem1.col);
            const element2 = this.getGemElement(gem2.row, gem2.col);

            element1.classList.add('hint');
            element2.classList.add('hint');

            setTimeout(() => {
                element1.classList.remove('hint');
                element2.classList.remove('hint');
            }, 2000);
        } else {
            this.shuffleBoard();
        }
    }

    shuffleBoard() {
        if (this.isAnimating) return;

        this.shuffleUsed++;

        const gems = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                gems.push(this.board[row][col]);
            }
        }

        for (let i = gems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gems[i], gems[j]] = [gems[j], gems[i]];
        }

        let index = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = gems[index++];
            }
        }

        this.renderBoard();
        this.checkForMatchesAndProcess();
    }

    showCombo(comboNum) {
        const comboDisplay = document.getElementById('comboDisplay');
        comboDisplay.textContent = `${comboNum}x 连击!`;
        comboDisplay.classList.add('show');

        setTimeout(() => {
            comboDisplay.classList.remove('show');
        }, 800);
    }

    getGemElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('target').textContent = this.targetScore;

        const progress = Math.min((this.score / this.targetScore) * 100, 100);
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    checkGameState() {
        if (this.score >= this.targetScore) {
            this.showModal('🎉 恭喜过关!', `你成功达到了 ${this.targetScore} 分!`, '下一关');
        } else if (this.moves <= 0) {
            this.showModal('💔 游戏结束', '步数用完了，再试一次吧!', '重新开始');
        } else {
            const moves = this.findPossibleMoves();
            if (moves.length === 0) {
                this.shuffleBoard();
            }
        }
    }

    showModal(title, message, buttonText) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('modalBtn').textContent = buttonText;
        document.getElementById('gameOverModal').classList.add('show');
    }

    showRules() {
        document.getElementById('rulesModal').classList.add('show');
    }

    closeRules() {
        document.getElementById('rulesModal').classList.remove('show');
    }

    handleModalClose() {
        document.getElementById('gameOverModal').classList.remove('show');

        if (this.score >= this.targetScore) {
            this.nextLevel();
        } else {
            this.restartGame();
        }
    }

    nextLevel() {
        this.level++;
        this.moves = 30 + (this.level - 1) * 5;
        this.targetScore = 1000 * this.level;
        this.score = 0;
        this.combo = 0;
        this.hintUsed = 0;
        this.shuffleUsed = 0;
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        this.checkForMatchesAndProcess();
    }

    restartGame() {
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.targetScore = 1000;
        this.combo = 0;
        this.hintUsed = 0;
        this.shuffleUsed = 0;
        this.selectedGem = null;
        this.isAnimating = false;
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        this.checkForMatchesAndProcess();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Match3Game();
});