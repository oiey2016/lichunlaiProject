class Game {
    constructor() {
        this.board = new Board();
        this.rules = new Rules(this.board);
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.history = [];
        this.moveCount = 0;
    }

    reset() {
        this.board = new Board();
        this.rules = new Rules(this.board);
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.history = [];
        this.moveCount = 0;
    }

    selectPiece(x, y) {
        if (this.gameOver) return false;
        
        const piece = this.board.getPieceAt(x, y);
        
        if (this.selectedPiece) {
            if (this.isValidMove(x, y)) {
                this.movePiece(x, y);
                return true;
            } else if (piece && piece.color === this.currentPlayer) {
                this.selectedPiece = piece;
                this.validMoves = this.rules.getValidMoves(piece);
                this.filterValidMoves();
                return true;
            } else {
                this.selectedPiece = null;
                this.validMoves = [];
                return true;
            }
        } else if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = piece;
            this.validMoves = this.rules.getValidMoves(piece);
            this.filterValidMoves();
            return true;
        }
        
        return false;
    }

    isValidMove(x, y) {
        if (!this.selectedPiece) return false;
        
        for (const move of this.validMoves) {
            if (move.x === x && move.y === y) {
                return true;
            }
        }
        
        return false;
    }

    filterValidMoves() {
        if (!this.selectedPiece) return;
        
        const validMoves = [];
        for (const move of this.validMoves) {
            if (this.board.testMove(this.selectedPiece, move.x, move.y)) {
                validMoves.push(move);
            }
        }
        this.validMoves = validMoves;
    }

    movePiece(toX, toY) {
        if (!this.selectedPiece) return;
        
        const fromX = this.selectedPiece.x;
        const fromY = this.selectedPiece.y;
        
        this.history.push({
            fromX,
            fromY,
            toX,
            toY,
            piece: this.selectedPiece.clone(),
            capturedPiece: this.board.getPieceAt(toX, toY) ? this.board.getPieceAt(toX, toY).clone() : null
        });
        
        this.board.movePiece(fromX, fromY, toX, toY);
        this.moveCount++;
        
        this.selectedPiece = null;
        this.validMoves = [];
        
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        
        this.checkGameEnd();
    }

    undo() {
        if (this.history.length === 0) return false;
        
        const lastMove = this.history.pop();
        
        this.board.setPieceAt(lastMove.fromX, lastMove.fromY, lastMove.piece);
        this.board.setPieceAt(lastMove.toX, lastMove.toY, lastMove.capturedPiece);
        
        if (lastMove.capturedPiece) {
            this.board.pieces.push(lastMove.capturedPiece);
        }
        
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.gameOver = false;
        this.moveCount = Math.max(0, this.moveCount - 1);
        
        return true;
    }

    checkGameEnd() {
        if (this.rules.isCheckmate(this.currentPlayer)) {
            this.gameOver = true;
            return 'checkmate';
        } else if (this.rules.isStalemate(this.currentPlayer)) {
            this.gameOver = true;
            return 'stalemate';
        }
        
        return null;
    }

    getMoveNotation(fromX, fromY, toX, toY) {
        const piece = this.board.getPieceAt(toX, toY);
        if (!piece) return '';
        
        const colNames = ['九', '八', '七', '六', '五', '四', '三', '二', '一'];
        const blackColNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        const fromCol = piece.color === 'red' ? colNames[8 - fromX] : blackColNames[fromX];
        const toCol = piece.color === 'red' ? colNames[8 - toX] : blackColNames[toX];
        
        let direction = '';
        let distance = '';
        
        if (fromY === toY) {
            direction = '平';
            distance = toCol;
        } else {
            if (piece.color === 'red') {
                direction = fromY > toY ? '进' : '退';
                distance = Math.abs(fromY - toY).toString();
            } else {
                direction = fromY < toY ? '进' : '退';
                distance = Math.abs(fromY - toY).toString();
            }
        }
        
        return `${piece.name}${fromCol}${direction}${distance}`;
    }

    getHint() {
        if (this.gameOver) return null;
        
        const pieces = this.board.getPiecesByColor(this.currentPlayer);
        const allMoves = [];
        
        for (const piece of pieces) {
            const moves = this.rules.getValidMoves(piece);
            for (const move of moves) {
                if (this.board.testMove(piece, move.x, move.y)) {
                    const capturedPiece = this.board.getPieceAt(move.x, move.y);
                    const score = capturedPiece ? this.getPieceScore(capturedPiece) : 0;
                    
                    allMoves.push({
                        piece,
                        move,
                        score
                    });
                }
            }
        }
        
        if (allMoves.length === 0) return null;
        
        allMoves.sort((a, b) => b.score - a.score);
        
        return allMoves[0];
    }

    getPieceScore(piece) {
        const scores = {
            'king': 1000,
            'chariot': 9,
            'horse': 4,
            'cannon': 4,
            'elephant': 2,
            'advisor': 2,
            'soldier': 1
        };
        
        return scores[piece.type] || 0;
    }
}
