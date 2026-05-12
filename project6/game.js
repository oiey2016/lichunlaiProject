const PIECE_TYPES = {
    ELEPHANT: { name: '象', emoji: '🐘', rank: 8 },
    LION: { name: '狮', emoji: '🦁', rank: 7 },
    TIGER: { name: '虎', emoji: '🐅', rank: 6 },
    LEOPARD: { name: '豹', emoji: '🐆', rank: 5 },
    WOLF: { name: '狼', emoji: '🐺', rank: 4 },
    DOG: { name: '狗', emoji: '🐕', rank: 3 },
    CAT: { name: '猫', emoji: '🐱', rank: 2 },
    MOUSE: { name: '鼠', emoji: '🐭', rank: 1 }
};

const PLAYERS = {
    RED: 'red',
    BLUE: 'blue'
};

const CELL_TYPES = {
    LAND: 'land',
    WATER: 'water',
    TRAP: 'trap',
    DEN: 'den'
};

class Piece {
    constructor(type, player, row, col) {
        this.type = type;
        this.player = player;
        this.row = row;
        this.col = col;
        this.isAlive = true;
    }

    get emoji() {
        return PIECE_TYPES[this.type].emoji;
    }

    get name() {
        return PIECE_TYPES[this.type].name;
    }

    get rank() {
        return PIECE_TYPES[this.type].rank;
    }

    canJumpRiver() {
        return this.type === 'LION' || this.type === 'TIGER';
    }

    canEnterWater() {
        return this.type === 'MOUSE';
    }
}

class Board {
    constructor() {
        this.rows = 9;
        this.cols = 7;
        this.cells = this.createCells();
        this.pieces = [];
        this.initPieces();
    }

    createCells() {
        const cells = [];
        for (let row = 0; row < this.rows; row++) {
            cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                cells[row][col] = this.getCellType(row, col);
            }
        }
        return cells;
    }

    getCellType(row, col) {
        if ((row >= 3 && row <= 5) && (col === 1 || col === 2 || col === 4 || col === 5)) {
            return CELL_TYPES.WATER;
        }

        if ((row === 0 && col === 3) || (row === 8 && col === 3)) {
            return CELL_TYPES.DEN;
        }

        if ((row === 0 && (col === 2 || col === 4)) || (row === 1 && col === 3)) {
            return CELL_TYPES.TRAP;
        }

        if ((row === 8 && (col === 2 || col === 4)) || (row === 7 && col === 3)) {
            return CELL_TYPES.TRAP;
        }

        return CELL_TYPES.LAND;
    }

    initPieces() {
        const redPositions = [
            { type: 'ELEPHANT', row: 8, col: 6 },
            { type: 'LION', row: 8, col: 0 },
            { type: 'TIGER', row: 6, col: 0 },
            { type: 'LEOPARD', row: 6, col: 4 },
            { type: 'WOLF', row: 6, col: 2 },
            { type: 'DOG', row: 7, col: 5 },
            { type: 'CAT', row: 7, col: 1 },
            { type: 'MOUSE', row: 6, col: 6 }
        ];

        const bluePositions = [
            { type: 'ELEPHANT', row: 0, col: 0 },
            { type: 'LION', row: 0, col: 6 },
            { type: 'TIGER', row: 2, col: 6 },
            { type: 'LEOPARD', row: 2, col: 2 },
            { type: 'WOLF', row: 2, col: 4 },
            { type: 'DOG', row: 1, col: 1 },
            { type: 'CAT', row: 1, col: 5 },
            { type: 'MOUSE', row: 2, col: 0 }
        ];

        redPositions.forEach(pos => {
            this.pieces.push(new Piece(pos.type, PLAYERS.RED, pos.row, pos.col));
        });

        bluePositions.forEach(pos => {
            this.pieces.push(new Piece(pos.type, PLAYERS.BLUE, pos.row, pos.col));
        });
    }

    getPieceAt(row, col) {
        return this.pieces.find(p => p.isAlive && p.row === row && p.col === col);
    }

    isWater(row, col) {
        return this.cells[row][col] === CELL_TYPES.WATER;
    }

    isTrap(row, col) {
        return this.cells[row][col] === CELL_TYPES.TRAP;
    }

    isDen(row, col) {
        return this.cells[row][col] === CELL_TYPES.DEN;
    }

    getEnemyDenPlayer(row, col) {
        if (row === 0 && col === 3) return PLAYERS.BLUE;
        if (row === 8 && col === 3) return PLAYERS.RED;
        return null;
    }

    isMouseInRiver() {
        return this.pieces.some(p => 
            p.isAlive && 
            p.type === 'MOUSE' && 
            this.isWater(p.row, p.col)
        );
    }
}

class GameLogic {
    constructor(board) {
        this.board = board;
    }

    isValidMove(piece, toRow, toCol) {
        if (toRow < 0 || toRow >= this.board.rows || toCol < 0 || toCol >= this.board.cols) {
            return false;
        }

        if (this.board.isDen(toRow, toCol)) {
            const denPlayer = this.board.getEnemyDenPlayer(toRow, toCol);
            if (denPlayer === piece.player) {
                return false;
            }
        }

        if (this.board.isWater(toRow, toCol) && !piece.canEnterWater()) {
            return false;
        }

        const rowDiff = Math.abs(toRow - piece.row);
        const colDiff = Math.abs(toCol - piece.col);

        if (piece.canJumpRiver() && (rowDiff > 1 || colDiff > 1)) {
            return this.canJumpRiver(piece, toRow, toCol);
        }

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            const targetPiece = this.board.getPieceAt(toRow, toCol);
            if (targetPiece && targetPiece.player === piece.player) {
                return false;
            }

            if (targetPiece && targetPiece.player !== piece.player) {
                return this.canCapture(piece, targetPiece);
            }

            return true;
        }

        return false;
    }

    canJumpRiver(piece, toRow, toCol) {
        if (this.board.isMouseInRiver()) {
            return false;
        }

        if (piece.row === toRow) {
            const minCol = Math.min(piece.col, toCol);
            const maxCol = Math.max(piece.col, toCol);
            
            for (let col = minCol + 1; col < maxCol; col++) {
                if (!this.board.isWater(piece.row, col)) {
                    return false;
                }
            }

            const targetPiece = this.board.getPieceAt(toRow, toCol);
            if (targetPiece && targetPiece.player === piece.player) {
                return false;
            }

            if (targetPiece && targetPiece.player !== piece.player) {
                return this.canCapture(piece, targetPiece);
            }

            return true;
        }

        if (piece.col === toCol) {
            const minRow = Math.min(piece.row, toRow);
            const maxRow = Math.max(piece.row, toRow);

            for (let row = minRow + 1; row < maxRow; row++) {
                if (!this.board.isWater(row, piece.col)) {
                    return false;
                }
            }

            const targetPiece = this.board.getPieceAt(toRow, toCol);
            if (targetPiece && targetPiece.player === piece.player) {
                return false;
            }

            if (targetPiece && targetPiece.player !== piece.player) {
                return this.canCapture(piece, targetPiece);
            }

            return true;
        }

        return false;
    }

    canCapture(attacker, defender) {
        if (this.board.isTrap(defender.row, defender.col)) {
            const trapOwner = defender.row < 4 ? PLAYERS.BLUE : PLAYERS.RED;
            if (trapOwner !== defender.player) {
                return true;
            }
        }

        if (attacker.type === 'MOUSE' && defender.type === 'ELEPHANT') {
            const attackerInWater = this.board.isWater(attacker.row, attacker.col);
            const defenderInWater = this.board.isWater(defender.row, defender.col);
            return attackerInWater === defenderInWater;
        }

        if (defender.type === 'MOUSE' && attacker.type === 'ELEPHANT') {
            return false;
        }

        return attacker.rank >= defender.rank;
    }

    getValidMoves(piece) {
        const moves = [];
        const directions = [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 }
        ];

        directions.forEach(dir => {
            const newRow = piece.row + dir.row;
            const newCol = piece.col + dir.col;
            if (this.isValidMove(piece, newRow, newCol)) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        if (piece.canJumpRiver()) {
            const jumpDirections = [
                { row: -4, col: 0 },
                { row: 4, col: 0 },
                { row: 0, col: -3 },
                { row: 0, col: 3 }
            ];

            jumpDirections.forEach(dir => {
                const newRow = piece.row + dir.row;
                const newCol = piece.col + dir.col;
                if (this.isValidMove(piece, newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                }
            });
        }

        return moves;
    }

    movePiece(piece, toRow, toCol) {
        const capturedPiece = this.board.getPieceAt(toRow, toCol);
        if (capturedPiece) {
            capturedPiece.isAlive = false;
        }

        piece.row = toRow;
        piece.col = toCol;

        return capturedPiece;
    }

    checkWinCondition(piece) {
        if (this.board.isDen(piece.row, piece.col)) {
            return true;
        }

        const enemyPlayer = piece.player === PLAYERS.RED ? PLAYERS.BLUE : PLAYERS.RED;
        const enemyPieces = this.board.pieces.filter(p => p.isAlive && p.player === enemyPlayer);
        
        if (enemyPieces.length === 0) {
            return true;
        }

        return false;
    }
}

class GameUI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('board');
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveCount = 0;
        this.init();
    }

    init() {
        this.renderBoard();
        this.renderPieces();
        this.renderPlayerInfo();
        this.setupEventListeners();
        this.updateTurnIndicator();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        for (let row = 0; row < this.game.board.rows; row++) {
            for (let col = 0; col < this.game.board.cols; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${this.game.board.cells[row][col]}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.onCellClick(row, col));
                this.boardElement.appendChild(cell);
            }
        }
    }

    renderPieces() {
        const cells = this.boardElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            const pieceElement = cell.querySelector('.piece');
            if (pieceElement) {
                pieceElement.remove();
            }
        });

        this.game.board.pieces.filter(p => p.isAlive).forEach(piece => {
            const cell = this.getCellElement(piece.row, piece.col);
            if (cell) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece.player}`;
                pieceElement.textContent = piece.emoji;
                pieceElement.title = `${piece.player === PLAYERS.RED ? '红方' : '蓝方'}${piece.name}`;
                cell.appendChild(pieceElement);
            }
        });
    }

    getCellElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    onCellClick(row, col) {
        const piece = this.game.board.getPieceAt(row, col);

        if (this.selectedPiece) {
            const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);
            
            if (isValidMove) {
                this.makeMove(this.selectedPiece, row, col);
            } else if (piece && piece.player === this.game.currentPlayer) {
                this.selectPiece(piece);
            } else {
                this.clearSelection();
            }
        } else if (piece && piece.player === this.game.currentPlayer) {
            this.selectPiece(piece);
        }
    }

    selectPiece(piece) {
        this.clearSelection();
        this.selectedPiece = piece;
        this.validMoves = this.game.gameLogic.getValidMoves(piece);

        const cell = this.getCellElement(piece.row, piece.col);
        if (cell) {
            cell.classList.add('selected');
        }

        this.validMoves.forEach(move => {
            const moveCell = this.getCellElement(move.row, move.col);
            if (moveCell) {
                moveCell.classList.add('valid-move');
            }
        });
    }

    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];

        const cells = this.boardElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('selected', 'valid-move');
        });
    }

    makeMove(piece, toRow, toCol) {
        const capturedPiece = this.game.gameLogic.movePiece(piece, toRow, toCol);
        
        this.moveCount++;
        this.addMoveHistory(piece, toRow, toCol, capturedPiece);

        if (this.game.gameLogic.checkWinCondition(piece)) {
            this.showWinModal(piece.player, capturedPiece);
            return;
        }

        this.game.switchPlayer();
        this.clearSelection();
        this.renderPieces();
        this.renderPlayerInfo();
        this.updateTurnIndicator();
    }

    addMoveHistory(piece, toRow, toCol, capturedPiece) {
        const historyList = document.getElementById('moveHistory');
        const playerName = piece.player === PLAYERS.RED ? '红方' : '蓝方';
        let message = `${this.moveCount}. ${playerName}${piece.name} 移动到 (${toRow}, ${toCol})`;
        
        if (capturedPiece) {
            message += `，吃掉了 ${capturedPiece.player === PLAYERS.RED ? '红方' : '蓝方'}${capturedPiece.name}`;
        }

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = message;
        historyList.insertBefore(historyItem, historyList.firstChild);
    }

    renderPlayerInfo() {
        const redPiecesContainer = document.getElementById('redPieces');
        const bluePiecesContainer = document.getElementById('bluePieces');

        redPiecesContainer.innerHTML = '';
        bluePiecesContainer.innerHTML = '';

        this.game.board.pieces.filter(p => p.isAlive).forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `piece ${piece.player}`;
            pieceElement.textContent = piece.emoji;
            pieceElement.title = piece.name;

            if (piece.player === PLAYERS.RED) {
                redPiecesContainer.appendChild(pieceElement);
            } else {
                bluePiecesContainer.appendChild(pieceElement);
            }
        });
    }

    updateTurnIndicator() {
        const turnIndicator = document.getElementById('currentTurn');
        const indicatorContainer = turnIndicator.parentElement;
        
        if (this.game.currentPlayer === PLAYERS.RED) {
            turnIndicator.textContent = '红方回合';
            indicatorContainer.className = 'turn-indicator red-turn';
        } else {
            turnIndicator.textContent = '蓝方回合';
            indicatorContainer.className = 'turn-indicator blue-turn';
        }
    }

    showWinModal(winner, capturedPiece) {
        const modal = document.getElementById('winModal');
        const winMessage = document.getElementById('winMessage');
        const winDetails = document.getElementById('winDetails');

        const winnerName = winner === PLAYERS.RED ? '红方' : '蓝方';
        winMessage.textContent = `🎉 恭喜 ${winnerName} 获胜！`;

        if (capturedPiece) {
            winDetails.textContent = `通过吃掉对方所有棋子获胜！`;
        } else {
            winDetails.textContent = `通过攻入对方兽穴获胜！`;
        }

        modal.style.display = 'block';
    }

    setupEventListeners() {
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.game.reset();
            this.reset();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            document.getElementById('winModal').style.display = 'none';
            this.game.reset();
            this.reset();
        });

        document.getElementById('rulesBtn').addEventListener('click', () => {
            document.getElementById('rulesModal').style.display = 'block';
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('rulesModal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            const rulesModal = document.getElementById('rulesModal');
            if (e.target === rulesModal) {
                rulesModal.style.display = 'none';
            }
        });
    }

    reset() {
        this.moveCount = 0;
        document.getElementById('moveHistory').innerHTML = '';
        this.clearSelection();
        this.renderPieces();
        this.renderPlayerInfo();
        this.updateTurnIndicator();
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.gameLogic = new GameLogic(this.board);
        this.currentPlayer = PLAYERS.RED;
        this.ui = null;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYERS.RED ? PLAYERS.BLUE : PLAYERS.RED;
    }

    reset() {
        this.board = new Board();
        this.gameLogic = new GameLogic(this.board);
        this.currentPlayer = PLAYERS.RED;
    }

    init() {
        this.ui = new GameUI(this);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
