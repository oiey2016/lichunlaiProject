class Chessboard {
    constructor() {
        this.board = this.createEmptyBoard();
        this.initializeBoard();
    }

    createEmptyBoard() {
        return Array(8).fill(null).map(() => Array(8).fill(null));
    }

    initializeBoard() {
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

        for (let col = 0; col < 8; col++) {
            this.board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false };
            this.board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
        }

        for (let col = 0; col < 8; col++) {
            this.board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
            this.board[7][col] = { type: pieceOrder[col], color: 'white', hasMoved: false };
        }
    }

    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    setPiece(row, col, piece) {
        if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
            this.board[row][col] = piece;
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        const capturedPiece = this.getPiece(toRow, toCol);
        this.board[toRow][toCol] = { ...piece, hasMoved: true };
        this.board[fromRow][fromCol] = null;

        return { piece: { ...piece, hasMoved: false }, capturedPiece };
    }

    clone() {
        const newBoard = new Chessboard();
        newBoard.board = this.board.map(row => 
            row.map(piece => piece ? { ...piece } : null)
        );
        return newBoard;
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    getPiecesByColor(color) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    pieces.push({ row, col, piece });
                }
            }
        }
        return pieces;
    }
}