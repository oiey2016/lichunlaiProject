const PieceTypes = {
    KING: 'king',
    QUEEN: 'queen',
    ROOK: 'rook',
    BISHOP: 'bishop',
    KNIGHT: 'knight',
    PAWN: 'pawn'
};

const PieceSymbols = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

class PieceMovement {
    static getSymbol(piece) {
        if (!piece) return '';
        return PieceSymbols[piece.color][piece.type];
    }

    static getValidMoves(board, row, col) {
        const piece = board.getPiece(row, col);
        if (!piece) return [];

        let moves = [];
        
        switch (piece.type) {
            case PieceTypes.PAWN:
                moves = this.getPawnMoves(board, row, col, piece.color);
                break;
            case PieceTypes.ROOK:
                moves = this.getRookMoves(board, row, col, piece.color);
                break;
            case PieceTypes.KNIGHT:
                moves = this.getKnightMoves(board, row, col, piece.color);
                break;
            case PieceTypes.BISHOP:
                moves = this.getBishopMoves(board, row, col, piece.color);
                break;
            case PieceTypes.QUEEN:
                moves = this.getQueenMoves(board, row, col, piece.color);
                break;
            case PieceTypes.KING:
                moves = this.getKingMoves(board, row, col, piece.color);
                break;
        }

        return moves;
    }

    static isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    static canMoveTo(board, row, col, color) {
        if (!this.isValidPosition(row, col)) return false;
        const piece = board.getPiece(row, col);
        return !piece || piece.color !== color;
    }

    static isCapture(board, row, col, color) {
        const piece = board.getPiece(row, col);
        return piece && piece.color !== color;
    }

    static getPawnMoves(board, row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        const newRow = row + direction;
        if (this.isValidPosition(newRow, col) && !board.getPiece(newRow, col)) {
            moves.push({ row: newRow, col });
            
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!board.getPiece(doubleRow, col)) {
                    moves.push({ row: doubleRow, col });
                }
            }
        }

        const captureCols = [col - 1, col + 1];
        for (const captureCol of captureCols) {
            if (this.isValidPosition(newRow, captureCol)) {
                const targetPiece = board.getPiece(newRow, captureCol);
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: newRow, col: captureCol });
                }
            }
        }

        return moves;
    }

    static getRookMoves(board, row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;

            while (this.isValidPosition(newRow, newCol)) {
                const targetPiece = board.getPiece(newRow, newCol);
                
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }

                newRow += dRow;
                newCol += dCol;
            }
        }

        return moves;
    }

    static getKnightMoves(board, row, col, color) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dRow, dCol] of offsets) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol) && this.canMoveTo(board, newRow, newCol, color)) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }

    static getBishopMoves(board, row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;

            while (this.isValidPosition(newRow, newCol)) {
                const targetPiece = board.getPiece(newRow, newCol);
                
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }

                newRow += dRow;
                newCol += dCol;
            }
        }

        return moves;
    }

    static getQueenMoves(board, row, col, color) {
        return [
            ...this.getRookMoves(board, row, col, color),
            ...this.getBishopMoves(board, row, col, color)
        ];
    }

    static getKingMoves(board, row, col, color) {
        const moves = [];
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dRow, dCol] of offsets) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol) && this.canMoveTo(board, newRow, newCol, color)) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }
}