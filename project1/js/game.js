class Game {
    constructor() {
        this.board = new Board();
        this.rules = new Rules(this.board);
        this.currentPlayer = PieceColor.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.moveHistory = [];
        this.canvas = null;
        this.ctx = null;
    }

    initialize(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.board.initialize();
        this.currentPlayer = PieceColor.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.moveHistory = [];
        this.render();
        this.updateTurnIndicator();
        this.clearMessage();
    }

    restart() {
        this.initialize(this.canvas);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw(this.ctx);
        
        if (this.selectedPiece) {
            this.board.highlightPiece(this.ctx, this.selectedPiece);
            
            this.validMoves.forEach(move => {
                const targetPiece = this.board.getPiece(move.x, move.y);
                if (targetPiece) {
                    this.board.highlightCapture(this.ctx, move.x, move.y);
                } else {
                    this.board.highlightMove(this.ctx, move.x, move.y);
                }
            });
        }
    }

    handleClick(screenX, screenY) {
        if (this.gameOver) {
            return;
        }
        
        const clickedPiece = this.board.isClickOnPiece(screenX, screenY);
        
        if (this.selectedPiece) {
            const { x, y } = this.board.screenToBoard(screenX, screenY);
            
            const isValidMove = this.validMoves.some(m => m.x === x && m.y === y);
            
            if (isValidMove) {
                this.makeMove(this.selectedPiece, x, y);
                return;
            }
            
            if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                this.selectPiece(clickedPiece);
                return;
            }
            
            this.deselectPiece();
            return;
        }
        
        if (clickedPiece && clickedPiece.color === this.currentPlayer) {
            this.selectPiece(clickedPiece);
        }
    }

    selectPiece(piece) {
        this.selectedPiece = piece;
        this.validMoves = this.rules.getValidMoves(piece);
        this.render();
    }

    deselectPiece() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.render();
    }

    makeMove(piece, toX, toY) {
        const fromX = piece.x;
        const fromY = piece.y;
        const capturedPiece = this.board.getPiece(toX, toY);
        
        this.moveHistory.push({
            piece: piece.clone(),
            fromX,
            fromY,
            toX,
            toY,
            capturedPiece: capturedPiece ? capturedPiece.clone() : null
        });
        
        this.board.movePiece(piece, toX, toY);
        this.deselectPiece();
        
        if (capturedPiece && capturedPiece.type === PieceType.KING) {
            this.gameOver = true;
            this.showMessage(`${this.currentPlayer === PieceColor.RED ? '红方' : '黑方'}获胜！`, 'checkmate');
            return;
        }
        
        this.switchPlayer();
        
        const enemyInCheck = this.rules.isInCheck(this.currentPlayer);
        const checkmate = this.rules.isCheckmate(this.currentPlayer);
        const stalemate = this.rules.isStalemate(this.currentPlayer);
        
        if (checkmate) {
            this.gameOver = true;
            const winner = this.currentPlayer === PieceColor.RED ? '黑方' : '红方';
            this.showMessage(`将死！${winner}获胜！`, 'checkmate');
        } else if (stalemate) {
            this.gameOver = true;
            this.showMessage('和棋！（困毙）', 'checkmate');
        } else if (enemyInCheck) {
            this.showMessage('将军！', 'check');
        } else {
            this.clearMessage();
        }
        
        this.updateTurnIndicator();
    }

    undo() {
        if (this.moveHistory.length === 0) {
            return;
        }
        
        const lastMove = this.moveHistory.pop();
        
        const piece = this.board.getPiece(lastMove.toX, lastMove.toY);
        if (piece) {
            piece.x = lastMove.fromX;
            piece.y = lastMove.fromY;
        }
        
        if (lastMove.capturedPiece) {
            this.board.addPiece(lastMove.capturedPiece);
        }
        
        this.gameOver = false;
        this.switchPlayer();
        this.deselectPiece();
        this.updateTurnIndicator();
        this.clearMessage();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PieceColor.RED 
            ? PieceColor.BLACK 
            : PieceColor.RED;
    }

    updateTurnIndicator() {
        const turnIndicator = document.getElementById('current-turn');
        const redPlayer = document.querySelector('.red-player');
        const blackPlayer = document.querySelector('.black-player');
        
        if (this.gameOver) {
            turnIndicator.textContent = '游戏结束';
            redPlayer.classList.remove('active');
            blackPlayer.classList.remove('active');
            return;
        }
        
        if (this.currentPlayer === PieceColor.RED) {
            turnIndicator.textContent = '红方回合';
            redPlayer.classList.add('active');
            blackPlayer.classList.remove('active');
        } else {
            turnIndicator.textContent = '黑方回合';
            redPlayer.classList.remove('active');
            blackPlayer.classList.add('active');
        }
    }

    showMessage(message, type = '') {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = message;
        messageElement.className = 'game-message show';
        
        if (type) {
            messageElement.classList.add(type);
        }
    }

    clearMessage() {
        const messageElement = document.getElementById('game-message');
        messageElement.className = 'game-message';
    }
}
