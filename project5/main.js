class CheckersGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.validJumps = [];
        this.isJumping = false;
        this.gameOver = false;
        
        this.initGame();
        this.setupEventListeners();
    }

    initGame() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.validJumps = [];
        this.isJumping = false;
        this.gameOver = false;
        
        this.hideRulesModal();
        this.renderBoard();
        this.updateGameInfo();
        this.hideMessage();
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { player: 'blue', king: false };
                }
            }
        }
        
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { player: 'red', king: false };
                }
            }
        }
        
        return board;
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.player} ${piece.king ? 'king' : ''}`;
                    
                    if (this.selectedPiece && 
                        this.selectedPiece.row === row && 
                        this.selectedPiece.col === col) {
                        pieceElement.classList.add('selected-piece');
                    }
                    
                    cell.appendChild(pieceElement);
                }
                
                if (this.isValidMove(row, col)) {
                    cell.classList.add('valid-move');
                }
                
                if (this.isValidJump(row, col)) {
                    cell.classList.add('valid-jump');
                }
                
                if (this.selectedPiece && 
                    this.selectedPiece.row === row && 
                    this.selectedPiece.col === col) {
                    cell.classList.add('selected');
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }

    isValidJump(row, col) {
        return this.validJumps.some(move => move.row === row && move.col === col);
    }

    handleCellClick(row, col) {
        if (this.gameOver) return;
        
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            if (this.isValidMove(row, col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                return;
            }
            
            if (this.isValidJump(row, col)) {
                this.jumpPiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                return;
            }
            
            if (piece && piece.player === this.currentPlayer && !this.isJumping) {
                this.selectPiece(row, col);
                return;
            }
            
            if (!this.isJumping) {
                this.selectedPiece = null;
                this.validMoves = [];
                this.validJumps = [];
                this.renderBoard();
            }
        } else {
            if (piece && piece.player === this.currentPlayer) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = [];
        this.validJumps = [];
        
        const allJumps = this.getAllJumpsForPlayer(this.currentPlayer);
        
        if (allJumps.length > 0) {
            const pieceJumps = allJumps.filter(jump => 
                jump.fromRow === row && jump.fromCol === col
            );
            
            if (pieceJumps.length > 0) {
                this.validJumps = pieceJumps.map(jump => ({
                    row: jump.toRow,
                    col: jump.toCol,
                    capturedRow: jump.capturedRow,
                    capturedCol: jump.capturedCol
                }));
                this.renderBoard();
                return;
            }
        }
        
        if (!this.isJumping) {
            this.validMoves = this.getValidMoves(row, col);
            this.renderBoard();
        }
    }

    getValidMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        if (!piece) return moves;
        
        const directions = this.getDirections(piece);
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol });
            }
        }
        
        return moves;
    }

    getValidJumps(row, col) {
        const jumps = [];
        const piece = this.board[row][col];
        if (!piece) return jumps;
        
        const directions = this.getDirections(piece);
        
        for (const [dr, dc] of directions) {
            const jumpRow = row + dr;
            const jumpCol = col + dc;
            const landRow = row + 2 * dr;
            const landCol = col + 2 * dc;
            
            if (this.isValidPosition(landRow, landCol) &&
                this.board[jumpRow][jumpCol] &&
                this.board[jumpRow][jumpCol].player !== piece.player &&
                !this.board[landRow][landCol]) {
                jumps.push({
                    row: landRow,
                    col: landCol,
                    capturedRow: jumpRow,
                    capturedCol: jumpCol
                });
            }
        }
        
        return jumps;
    }

    getAllJumpsForPlayer(player) {
        const jumps = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.player === player) {
                    const pieceJumps = this.getValidJumps(row, col);
                    for (const jump of pieceJumps) {
                        jumps.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: jump.row,
                            toCol: jump.col,
                            capturedRow: jump.capturedRow,
                            capturedCol: jump.capturedCol
                        });
                    }
                }
            }
        }
        
        return jumps;
    }

    getDirections(piece) {
        if (piece.king) {
            return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        }
        
        return piece.player === 'red' 
            ? [[-1, -1], [-1, 1]]
            : [[1, -1], [1, 1]];
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        this.checkKingPromotion(toRow, toCol);
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.validJumps = [];
        
        this.switchPlayer();
        this.renderBoard();
        this.updateGameInfo();
        this.checkGameOver();
    }

    jumpPiece(fromRow, fromCol, toRow, toCol) {
        const jump = this.validJumps.find(j => j.row === toRow && j.col === toCol);
        if (!jump) return;
        
        const piece = this.board[fromRow][fromCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        this.board[jump.capturedRow][jump.capturedCol] = null;
        
        this.checkKingPromotion(toRow, toCol);
        
        const moreJumps = this.getValidJumps(toRow, toCol);
        
        if (moreJumps.length > 0) {
            this.selectedPiece = { row: toRow, col: toCol };
            this.isJumping = true;
            this.validJumps = moreJumps;
            this.validMoves = [];
            this.showMessage('可以继续跳跃！');
        } else {
            this.selectedPiece = null;
            this.validJumps = [];
            this.isJumping = false;
            this.switchPlayer();
        }
        
        this.renderBoard();
        this.updateGameInfo();
        this.checkGameOver();
    }

    checkKingPromotion(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.king) return;
        
        if ((piece.player === 'red' && row === 0) || 
            (piece.player === 'blue' && row === 7)) {
            piece.king = true;
            this.showMessage(`${piece.player === 'red' ? '红色' : '蓝色'}棋子升级为国王！`);
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
    }

    checkGameOver() {
        const opponent = this.currentPlayer === 'red' ? 'blue' : 'red';
        
        let hasPieces = false;
        let canMove = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.player === this.currentPlayer) {
                    hasPieces = true;
                    const moves = this.getValidMoves(row, col);
                    const jumps = this.getValidJumps(row, col);
                    if (moves.length > 0 || jumps.length > 0) {
                        canMove = true;
                    }
                }
            }
        }
        
        if (!hasPieces || !canMove) {
            this.gameOver = true;
            this.showMessage(`游戏结束！${opponent === 'red' ? '红色' : '蓝色'}玩家获胜！`);
        }
    }

    updateGameInfo() {
        const playerIndicator = document.getElementById('player-indicator');
        playerIndicator.textContent = this.currentPlayer === 'red' ? '红色' : '蓝色';
        playerIndicator.style.color = this.currentPlayer === 'red' ? '#ff6b6b' : '#4d96ff';
        
        let redCount = 0;
        let blueCount = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.player === 'red') redCount++;
                    else blueCount++;
                }
            }
        }
        
        document.getElementById('red-score').textContent = redCount;
        document.getElementById('blue-score').textContent = blueCount;
    }

    showMessage(message) {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = message;
        messageElement.style.display = 'block';
    }

    hideMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = '';
        messageElement.style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.initGame();
        });
        
        document.getElementById('rules-btn').addEventListener('click', () => {
            this.showRulesModal();
        });
        
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideRulesModal();
        });
        
        document.getElementById('rules-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('rules-modal')) {
                this.hideRulesModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideRulesModal();
            }
        });
    }
    
    showRulesModal() {
        const modal = document.getElementById('rules-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
    
    hideRulesModal() {
        const modal = document.getElementById('rules-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CheckersGame();
});
