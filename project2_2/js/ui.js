class ChessUI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('chess-board');
        this.turnIndicator = document.getElementById('current-turn');
        this.gameStatus = document.getElementById('game-status');
        this.capturedWhite = document.getElementById('captured-white');
        this.capturedBlack = document.getElementById('captured-black');
        this.moveHistoryElement = document.getElementById('move-history');
        this.restartBtn = document.getElementById('restart-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.legalMoves = [];
        this.pendingPromotion = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.restartBtn.addEventListener('click', () => this.restart());
        this.undoBtn.addEventListener('click', () => this.undo());
    }

    render() {
        this.renderBoard();
        this.renderGameInfo();
        this.renderCapturedPieces();
        this.renderMoveHistory();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        const { board, selectedPiece, lastMove } = this.game.getGameState();

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                    square.classList.add('selected');
                }

                if (lastMove && 
                    ((lastMove.fromRow === row && lastMove.fromCol === col) ||
                     (lastMove.toRow === row && lastMove.toCol === col))) {
                    square.classList.add('last-move');
                }

                const isValidMove = this.legalMoves.some(m => m.row === row && m.col === col);
                if (isValidMove) {
                    square.classList.add('valid-move');
                    const pieceAtPos = board.getPiece(row, col);
                    if (pieceAtPos) {
                        square.classList.add('valid-capture');
                    }
                }

                const piece = board.getPiece(row, col);
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = `piece ${piece.color}`;
                    pieceElement.textContent = PieceMovement.getSymbol(piece);
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                this.boardElement.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        if (this.game.gameStatus !== 'playing') return;
        if (this.pendingPromotion) return;

        const piece = this.game.board.getPiece(row, col);

        if (this.game.selectedPiece) {
            const isValidMove = this.legalMoves.some(m => m.row === row && m.col === col);
            
            if (isValidMove) {
                const result = this.game.movePiece(row, col);
                
                if (result && result.needsPromotion) {
                    this.showPromotionModal(result);
                    return;
                }
                
                this.legalMoves = [];
            } else if (piece && piece.color === this.game.currentPlayer) {
                this.legalMoves = this.game.selectPiece(row, col);
            } else {
                this.game.selectedPiece = null;
                this.legalMoves = [];
            }
        } else {
            if (piece && piece.color === this.game.currentPlayer) {
                this.legalMoves = this.game.selectPiece(row, col);
            }
        }

        this.render();
    }

    showPromotionModal(promotionInfo) {
        this.pendingPromotion = promotionInfo;
        
        const modal = document.createElement('div');
        modal.className = 'promotion-modal';
        
        const content = document.createElement('div');
        content.className = 'promotion-content';
        
        const title = document.createElement('h3');
        title.textContent = '选择升变棋子';
        content.appendChild(title);
        
        const options = document.createElement('div');
        options.className = 'promotion-options';
        
        const promotionPieces = ChessRules.getPromotionPieces(promotionInfo.piece.color);
        
        for (const pieceInfo of promotionPieces) {
            const pieceOption = document.createElement('div');
            pieceOption.className = `promotion-piece ${promotionInfo.piece.color}`;
            pieceOption.textContent = pieceInfo.symbol;
            pieceOption.addEventListener('click', () => this.handlePromotion(pieceInfo.type, modal));
            options.appendChild(pieceOption);
        }
        
        content.appendChild(options);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    handlePromotion(promotionType, modal) {
        if (!this.pendingPromotion) return;
        
        const { fromRow, fromCol, toRow, toCol } = this.pendingPromotion;
        this.game.executeMove(fromRow, fromCol, toRow, toCol, promotionType);
        
        this.pendingPromotion = null;
        this.legalMoves = [];
        modal.remove();
        this.render();
    }

    renderGameInfo() {
        const { currentPlayer, gameStatus } = this.game.getGameState();
        
        this.turnIndicator.textContent = currentPlayer === 'white' ? '白方' : '黑方';
        
        this.gameStatus.classList.remove('check', 'checkmate', 'stalemate');
        
        if (gameStatus === 'checkmate') {
            const winner = currentPlayer === 'white' ? '黑方' : '白方';
            this.gameStatus.textContent = `将死！${winner}获胜！`;
            this.gameStatus.classList.add('checkmate');
        } else if (gameStatus === 'stalemate') {
            this.gameStatus.textContent = '和棋（逼和）';
            this.gameStatus.classList.add('stalemate');
        } else {
            const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
            const inCheck = ChessRules.isInCheck(this.game.board, currentPlayer);
            
            if (inCheck) {
                this.gameStatus.textContent = '将军！';
                this.gameStatus.classList.add('check');
            } else {
                this.gameStatus.textContent = '游戏进行中';
            }
        }
        
        this.undoBtn.disabled = this.game.moveHistory.length === 0;
    }

    renderCapturedPieces() {
        const { capturedPieces } = this.game.getGameState();
        
        this.capturedWhite.innerHTML = '';
        this.capturedBlack.innerHTML = '';
        
        for (const piece of capturedPieces.white) {
            const pieceEl = document.createElement('span');
            pieceEl.className = 'captured-piece white';
            pieceEl.textContent = PieceMovement.getSymbol(piece);
            this.capturedWhite.appendChild(pieceEl);
        }
        
        for (const piece of capturedPieces.black) {
            const pieceEl = document.createElement('span');
            pieceEl.className = 'captured-piece black';
            pieceEl.textContent = PieceMovement.getSymbol(piece);
            this.capturedBlack.appendChild(pieceEl);
        }
    }

    renderMoveHistory() {
        const { moveHistory } = this.game.getGameState();
        this.moveHistoryElement.innerHTML = '';
        
        for (let i = 0; i < moveHistory.length; i += 2) {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = Math.floor(i / 2) + 1;
            let moveText = `<span class="move-number">${moveNumber}.</span> ${moveHistory[i].notation}`;
            
            if (moveHistory[i + 1]) {
                moveText += ` ${moveHistory[i + 1].notation}`;
            }
            
            moveItem.innerHTML = moveText;
            this.moveHistoryElement.appendChild(moveItem);
        }
        
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }

    restart() {
        this.game.restart();
        this.legalMoves = [];
        this.pendingPromotion = null;
        this.render();
    }

    undo() {
        if (this.game.undo()) {
            this.legalMoves = [];
            this.render();
        }
    }
}