class ChessGame {
    constructor() {
        this.board = new Chessboard();
        this.currentPlayer = 'white';
        this.gameStatus = 'playing';
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.lastMove = null;
        this.selectedPiece = null;
    }

    restart() {
        this.board = new Chessboard();
        this.currentPlayer = 'white';
        this.gameStatus = 'playing';
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.lastMove = null;
        this.selectedPiece = null;
    }

    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        
        if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
            return ChessRules.getAllLegalMoves(this.board, row, col);
        }
        
        this.selectedPiece = null;
        return [];
    }

    movePiece(toRow, toCol, promotionType = null) {
        if (!this.selectedPiece) return false;

        const { row: fromRow, col: fromCol, piece } = this.selectedPiece;
        const legalMoves = ChessRules.getAllLegalMoves(this.board, fromRow, fromCol);
        
        const isValidMove = legalMoves.some(move => 
            move.row === toRow && move.col === toCol
        );

        if (!isValidMove) {
            this.selectedPiece = null;
            return false;
        }

        if (ChessRules.canPromote(piece, toRow) && !promotionType) {
            return { needsPromotion: true, fromRow, fromCol, toRow, toCol, piece };
        }

        this.executeMove(fromRow, fromCol, toRow, toCol, promotionType);
        return true;
    }

    executeMove(fromRow, fromCol, toRow, toCol, promotionType = null) {
        const piece = this.board.getPiece(fromRow, fromCol);
        const capturedPiece = this.board.getPiece(toRow, toCol);

        const legalMoves = ChessRules.getAllLegalMoves(this.board, fromRow, fromCol);
        const move = legalMoves.find(m => m.row === toRow && m.col === toCol);

        const moveInfo = this.board.movePiece(fromRow, fromCol, toRow, toCol);
        const movedPiece = moveInfo.piece;

        if (promotionType) {
            this.board.setPiece(toRow, toCol, {
                type: promotionType,
                color: movedPiece.color,
                hasMoved: true
            });
        }

        if (move && move.castling) {
            const rookFromCol = move.castling === 'kingside' ? 7 : 0;
            const rookToCol = move.castling === 'kingside' ? 5 : 3;
            this.board.movePiece(toRow, rookFromCol, toRow, rookToCol);
        }

        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }

        const opponentColor = this.currentPlayer === 'white' ? 'black' : 'white';
        
        const isCheck = ChessRules.isInCheck(this.board, opponentColor);
        const isCheckmate = ChessRules.isCheckmate(this.board, opponentColor);
        const isStalemate = ChessRules.isStalemate(this.board, opponentColor);

        const notation = getMoveNotation(
            piece, fromRow, fromCol, toRow, toCol, 
            capturedPiece, isCheck, isCheckmate
        );

        this.moveHistory.push({
            fromRow, fromCol, toRow, toCol,
            piece: movedPiece,
            capturedPiece,
            promotionType,
            notation,
            isCheck,
            isCheckmate,
            isStalemate
        });

        this.lastMove = null;
        this.selectedPiece = null;

        if (isCheckmate) {
            this.gameStatus = 'checkmate';
        } else if (isStalemate) {
            this.gameStatus = 'stalemate';
        } else {
            this.currentPlayer = opponentColor;
        }

        return true;
    }

    undo() {
        if (this.moveHistory.length === 0) return false;

        const lastMove = this.moveHistory.pop();
        const { fromRow, fromCol, toRow, toCol, piece, capturedPiece, promotionType } = lastMove;

        this.board.setPiece(fromRow, fromCol, piece);
        
        if (promotionType) {
            this.board.setPiece(toRow, toCol, capturedPiece);
        } else {
            this.board.setPiece(toRow, toCol, capturedPiece);
        }

        if (capturedPiece) {
            const index = this.capturedPieces[capturedPiece.color].lastIndexOf(capturedPiece);
            if (index > -1) {
                this.capturedPieces[capturedPiece.color].splice(index, 1);
            }
        }

        this.currentPlayer = piece.color;
        this.gameStatus = 'playing';
        this.lastMove = null;

        this.selectedPiece = null;
        return true;
    }

    getGameState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            moveHistory: this.moveHistory,
            capturedPieces: this.capturedPieces,
            lastMove: this.lastMove,
            selectedPiece: this.selectedPiece
        };
    }
}