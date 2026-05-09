class GameUI {
    constructor() {
        this.game = new Game();
        this.boardElement = document.getElementById('board');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameStatusElement = document.getElementById('game-status');
        this.moveHistoryElement = document.getElementById('move-history');
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        
        this.CELL_SIZE = 60;
        this.PIECE_SIZE = 50;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.game.reset();
            this.updateUI();
            this.hideModal();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            if (this.game.undo()) {
                this.updateUI();
                if (this.moveHistoryElement.lastChild) {
                    this.moveHistoryElement.removeChild(this.moveHistoryElement.lastChild);
                }
            }
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('modal-btn').addEventListener('click', () => {
            this.hideModal();
        });

        this.boardElement.addEventListener('click', (e) => {
            const rect = this.boardElement.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left) / this.CELL_SIZE);
            const y = Math.round((e.clientY - rect.top) / this.CELL_SIZE);
            
            if (x >= 0 && x < 9 && y >= 0 && y < 10) {
                this.handleClick(x, y);
            }
        });
    }

    handleClick(x, y) {
        if (this.game.gameOver) return;
        
        const game = this.game;
        const historyLengthBefore = game.history.length;
        const selectedPieceBefore = game.selectedPiece;
        
        const result = game.selectPiece(x, y);
        
        if (game.history.length > historyLengthBefore && selectedPieceBefore) {
            const lastMove = game.history[game.history.length - 1];
            const notation = game.getMoveNotation(lastMove.fromX, lastMove.fromY, lastMove.toX, lastMove.toY);
            this.addMoveToHistory(notation);
        }
        
        this.updateUI();
    }

    updateUI() {
        this.render();
        this.updatePlayerInfo();
        this.checkGameStatus();
    }

    updatePlayerInfo() {
        const playerName = this.game.currentPlayer === 'red' ? '红方' : '黑方';
        this.currentPlayerElement.textContent = playerName;
        this.currentPlayerElement.className = `player-${this.game.currentPlayer}`;
    }

    checkGameStatus() {
        const status = this.game.checkGameEnd();
        
        if (status === 'checkmate') {
            const winner = this.game.currentPlayer === 'red' ? '黑方' : '红方';
            this.gameStatusElement.textContent = '将军！';
            this.showModal('游戏结束', `${winner}获胜！`);
        } else if (status === 'stalemate') {
            this.gameStatusElement.textContent = '困毙！';
            this.showModal('游戏结束', '和棋！');
        } else if (this.game.rules.isInCheck(this.game.currentPlayer)) {
            this.gameStatusElement.textContent = '将军！';
        } else {
            this.gameStatusElement.textContent = '游戏进行中';
        }
    }

    showHint() {
        const hint = this.game.getHint();
        if (!hint) return;
        
        this.game.selectedPiece = hint.piece;
        this.game.validMoves = [hint.move];
        this.render();
    }

    addMoveToHistory(notation) {
        const moveElement = document.createElement('div');
        moveElement.className = 'move-item';
        moveElement.textContent = `${Math.ceil(this.game.moveCount / 2)}. ${notation}`;
        this.moveHistoryElement.appendChild(moveElement);
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }

    render() {
        this.boardElement.innerHTML = '';
        
        const boardWidth = this.CELL_SIZE * 8 + 40;
        const boardHeight = this.CELL_SIZE * 9 + 40;
        
        this.boardElement.style.width = `${boardWidth}px`;
        this.boardElement.style.height = `${boardHeight}px`;
        
        this.renderGrid();
        this.renderPieces();
        this.renderValidMoves();
        this.renderSelectedPiece();
    }

    renderGrid() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.CELL_SIZE * 8 + 40);
        svg.setAttribute('height', this.CELL_SIZE * 9 + 40);
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.pointerEvents = 'none';
        
        for (let i = 0; i < 9; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', i * this.CELL_SIZE + 20);
            line.setAttribute('y1', 20);
            line.setAttribute('x2', i * this.CELL_SIZE + 20);
            line.setAttribute('y2', 9 * this.CELL_SIZE + 20);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }
        
        for (let i = 0; i < 10; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 20);
            line.setAttribute('y1', i * this.CELL_SIZE + 20);
            line.setAttribute('x2', 8 * this.CELL_SIZE + 20);
            line.setAttribute('y2', i * this.CELL_SIZE + 20);
            line.setAttribute('stroke', '#000');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }
        
        const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftLine.setAttribute('x1', 20);
        leftLine.setAttribute('y1', 20);
        leftLine.setAttribute('x2', 20);
        leftLine.setAttribute('y2', 4 * this.CELL_SIZE + 20);
        leftLine.setAttribute('stroke', '#000');
        leftLine.setAttribute('stroke-width', '1');
        svg.appendChild(leftLine);
        
        const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightLine.setAttribute('x1', 20);
        rightLine.setAttribute('y1', 5 * this.CELL_SIZE + 20);
        rightLine.setAttribute('x2', 20);
        rightLine.setAttribute('y2', 9 * this.CELL_SIZE + 20);
        rightLine.setAttribute('stroke', '#000');
        rightLine.setAttribute('stroke-width', '1');
        svg.appendChild(rightLine);
        
        const diag1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        diag1.setAttribute('x1', 3 * this.CELL_SIZE + 20);
        diag1.setAttribute('y1', 20);
        diag1.setAttribute('x2', 5 * this.CELL_SIZE + 20);
        diag1.setAttribute('y2', 2 * this.CELL_SIZE + 20);
        diag1.setAttribute('stroke', '#000');
        diag1.setAttribute('stroke-width', '1');
        svg.appendChild(diag1);
        
        const diag2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        diag2.setAttribute('x1', 5 * this.CELL_SIZE + 20);
        diag2.setAttribute('y1', 20);
        diag2.setAttribute('x2', 3 * this.CELL_SIZE + 20);
        diag2.setAttribute('y2', 2 * this.CELL_SIZE + 20);
        diag2.setAttribute('stroke', '#000');
        diag2.setAttribute('stroke-width', '1');
        svg.appendChild(diag2);
        
        const diag3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        diag3.setAttribute('x1', 3 * this.CELL_SIZE + 20);
        diag3.setAttribute('y1', 7 * this.CELL_SIZE + 20);
        diag3.setAttribute('x2', 5 * this.CELL_SIZE + 20);
        diag3.setAttribute('y2', 9 * this.CELL_SIZE + 20);
        diag3.setAttribute('stroke', '#000');
        diag3.setAttribute('stroke-width', '1');
        svg.appendChild(diag3);
        
        const diag4 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        diag4.setAttribute('x1', 5 * this.CELL_SIZE + 20);
        diag4.setAttribute('y1', 7 * this.CELL_SIZE + 20);
        diag4.setAttribute('x2', 3 * this.CELL_SIZE + 20);
        diag4.setAttribute('y2', 9 * this.CELL_SIZE + 20);
        diag4.setAttribute('stroke', '#000');
        diag4.setAttribute('stroke-width', '1');
        svg.appendChild(diag4);
        
        const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text1.setAttribute('x', 2 * this.CELL_SIZE + 20);
        text1.setAttribute('y', 4.5 * this.CELL_SIZE + 20);
        text1.setAttribute('text-anchor', 'middle');
        text1.setAttribute('dominant-baseline', 'middle');
        text1.setAttribute('font-size', '24px');
        text1.setAttribute('fill', '#000');
        text1.textContent = '楚河';
        svg.appendChild(text1);
        
        const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text2.setAttribute('x', 6 * this.CELL_SIZE + 20);
        text2.setAttribute('y', 4.5 * this.CELL_SIZE + 20);
        text2.setAttribute('text-anchor', 'middle');
        text2.setAttribute('dominant-baseline', 'middle');
        text2.setAttribute('font-size', '24px');
        text2.setAttribute('fill', '#000');
        text2.textContent = '漢界';
        svg.appendChild(text2);
        
        this.boardElement.appendChild(svg);
    }

    renderPieces() {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = this.game.board.getPieceAt(x, y);
                if (piece) {
                    this.renderPiece(piece);
                }
            }
        }
    }

    renderPiece(piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece piece-${piece.color}`;
        pieceElement.style.left = `${piece.x * this.CELL_SIZE + 20 - this.PIECE_SIZE / 2}px`;
        pieceElement.style.top = `${piece.y * this.CELL_SIZE + 20 - this.PIECE_SIZE / 2}px`;
        pieceElement.style.width = `${this.PIECE_SIZE}px`;
        pieceElement.style.height = `${this.PIECE_SIZE}px`;
        pieceElement.textContent = piece.name;
        pieceElement.dataset.x = piece.x;
        pieceElement.dataset.y = piece.y;
        
        if (this.game.selectedPiece === piece) {
            pieceElement.classList.add('selected');
        }
        
        this.boardElement.appendChild(pieceElement);
    }

    renderValidMoves() {
        for (const move of this.game.validMoves) {
            const moveElement = document.createElement('div');
            moveElement.className = 'valid-move';
            moveElement.style.left = `${move.x * this.CELL_SIZE + 20 - 10}px`;
            moveElement.style.top = `${move.y * this.CELL_SIZE + 20 - 10}px`;
            
            const targetPiece = this.game.board.getPieceAt(move.x, move.y);
            if (targetPiece) {
                moveElement.classList.add('capture');
            }
            
            this.boardElement.appendChild(moveElement);
        }
    }

    renderSelectedPiece() {
        if (!this.game.selectedPiece) return;
        
        const selectedElement = document.createElement('div');
        selectedElement.className = 'selected-highlight';
        selectedElement.style.left = `${this.game.selectedPiece.x * this.CELL_SIZE + 20 - this.PIECE_SIZE / 2 - 5}px`;
        selectedElement.style.top = `${this.game.selectedPiece.y * this.CELL_SIZE + 20 - this.PIECE_SIZE / 2 - 5}px`;
        selectedElement.style.width = `${this.PIECE_SIZE + 10}px`;
        selectedElement.style.height = `${this.PIECE_SIZE + 10}px`;
        
        this.boardElement.appendChild(selectedElement);
    }

    showModal(title, message) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modal.style.display = 'flex';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameUI = new GameUI();
});
