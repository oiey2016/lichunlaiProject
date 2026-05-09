class ChessRules {
    static isInCheck(board, color) {
        const kingPos = board.findKing(color);
        if (!kingPos) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = board.getPiecesByColor(opponentColor);

        for (const { row, col, piece } of opponentPieces) {
            const moves = PieceMovement.getValidMoves(board, row, col);
            if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                return true;
            }
        }

        return false;
    }

    static getLegalMoves(board, row, col) {
        const piece = board.getPiece(row, col);
        if (!piece) return [];

        const validMoves = PieceMovement.getValidMoves(board, row, col);
        const legalMoves = [];

        for (const move of validMoves) {
            const testBoard = board.clone();
            testBoard.movePiece(row, col, move.row, move.col);
            
            if (!this.isInCheck(testBoard, piece.color)) {
                legalMoves.push(move);
            }
        }

        return legalMoves;
    }

    static hasLegalMoves(board, color) {
        const pieces = board.getPiecesByColor(color);

        for (const { row, col } of pieces) {
            const legalMoves = this.getLegalMoves(board, row, col);
            if (legalMoves.length > 0) {
                return true;
            }
        }

        return false;
    }

    static isCheckmate(board, color) {
        return this.isInCheck(board, color) && !this.hasLegalMoves(board, color);
    }

    static isStalemate(board, color) {
        return !this.isInCheck(board, color) && !this.hasLegalMoves(board, color);
    }

    static getCastlingMoves(board, row, col) {
        const piece = board.getPiece(row, col);
        if (!piece || piece.type !== 'king' || piece.hasMoved) return [];

        if (this.isInCheck(board, piece.color)) return [];

        const castlingMoves = [];
        const isWhite = piece.color === 'white';
        const baseRow = isWhite ? 7 : 0;

        if (row !== baseRow || col !== 4) return castlingMoves;

        const kingsideRook = board.getPiece(baseRow, 7);
        if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
            const squaresClear = 
                !board.getPiece(baseRow, 5) && 
                !board.getPiece(baseRow, 6);
            
            if (squaresClear) {
                const testBoard1 = board.clone();
                testBoard1.movePiece(baseRow, 4, baseRow, 5);
                
                const testBoard2 = board.clone();
                testBoard2.movePiece(baseRow, 4, baseRow, 6);

                if (!this.isInCheck(testBoard1, piece.color) && 
                    !this.isInCheck(testBoard2, piece.color)) {
                    castlingMoves.push({ row: baseRow, col: 6, castling: 'kingside' });
                }
            }
        }

        const queensideRook = board.getPiece(baseRow, 0);
        if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
            const squaresClear = 
                !board.getPiece(baseRow, 1) && 
                !board.getPiece(baseRow, 2) && 
                !board.getPiece(baseRow, 3);
            
            if (squaresClear) {
                const testBoard1 = board.clone();
                testBoard1.movePiece(baseRow, 4, baseRow, 3);
                
                const testBoard2 = board.clone();
                testBoard2.movePiece(baseRow, 4, baseRow, 2);

                if (!this.isInCheck(testBoard1, piece.color) && 
                    !this.isInCheck(testBoard2, piece.color)) {
                    castlingMoves.push({ row: baseRow, col: 2, castling: 'queenside' });
                }
            }
        }

        return castlingMoves;
    }

    static getAllLegalMoves(board, row, col) {
        const piece = board.getPiece(row, col);
        if (!piece) return [];

        let legalMoves = this.getLegalMoves(board, row, col);

        if (piece.type === 'king') {
            const castlingMoves = this.getCastlingMoves(board, row, col);
            legalMoves = [...legalMoves, ...castlingMoves];
        }

        return legalMoves;
    }

    static canPromote(piece, toRow) {
        if (!piece || piece.type !== 'pawn') return false;
        
        const promotionRow = piece.color === 'white' ? 0 : 7;
        return toRow === promotionRow;
    }

    static getPromotionPieces(color) {
        return [
            { type: 'queen', symbol: PieceSymbols[color].queen },
            { type: 'rook', symbol: PieceSymbols[color].rook },
            { type: 'bishop', symbol: PieceSymbols[color].bishop },
            { type: 'knight', symbol: PieceSymbols[color].knight }
        ];
    }
}

const Columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function getMoveNotation(piece, fromRow, fromCol, toRow, toCol, capturedPiece, isCheck, isCheckmate) {
    const fromPos = Columns[fromCol] + (8 - fromRow);
    const toPos = Columns[toCol] + (8 - toRow);
    
    let notation = '';
    
    if (piece.type === 'pawn') {
        if (capturedPiece) {
            notation = Columns[fromCol] + 'x' + toPos;
        } else {
            notation = toPos;
        }
    } else {
        const pieceChar = {
            king: 'K',
            queen: 'Q',
            rook: 'R',
            bishop: 'B',
            knight: 'N'
        }[piece.type];
        
        if (capturedPiece) {
            notation = pieceChar + 'x' + toPos;
        } else {
            notation = pieceChar + toPos;
        }
    }
    
    if (isCheckmate) {
        notation += '#';
    } else if (isCheck) {
        notation += '+';
    }
    
    return notation;
}