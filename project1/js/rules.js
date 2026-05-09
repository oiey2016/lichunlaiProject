class Rules {
    constructor(board) {
        this.board = board;
    }

    isValidMove(piece, toX, toY) {
        if (!piece) return false;
        if (toX < 0 || toX > 8 || toY < 0 || toY > 9) return false;
        
        const targetPiece = this.board.getPieceAt(toX, toY);
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        switch (piece.type) {
            case 'king':
                return this.isValidKingMove(piece, toX, toY);
            case 'advisor':
                return this.isValidAdvisorMove(piece, toX, toY);
            case 'elephant':
                return this.isValidElephantMove(piece, toX, toY);
            case 'horse':
                return this.isValidHorseMove(piece, toX, toY);
            case 'chariot':
                return this.isValidChariotMove(piece, toX, toY);
            case 'cannon':
                return this.isValidCannonMove(piece, toX, toY);
            case 'soldier':
                return this.isValidSoldierMove(piece, toX, toY);
            default:
                return false;
        }
    }

    isValidKingMove(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if (piece.color === 'red') {
            if (toX < 3 || toX > 5 || toY < 7 || toY > 9) return false;
        } else {
            if (toX < 3 || toX > 5 || toY < 0 || toY > 2) return false;
        }
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) return true;
        
        if (dx === 0 && dy > 0) {
            const enemyKing = this.board.findKing(piece.color === 'red' ? 'black' : 'red');
            if (enemyKing && enemyKing.x === piece.x) {
                const minY = Math.min(piece.y, enemyKing.y);
                const maxY = Math.max(piece.y, enemyKing.y);
                
                let hasPiece = false;
                for (let y = minY + 1; y < maxY; y++) {
                    if (this.board.getPieceAt(piece.x, y)) {
                        hasPiece = true;
                        break;
                    }
                }
                
                if (!hasPiece && ((piece.color === 'red' && toY <= enemyKing.y) || 
                                   (piece.color === 'black' && toY >= enemyKing.y))) {
                    return true;
                }
            }
        }
        
        return false;
    }

    isValidAdvisorMove(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if (piece.color === 'red') {
            if (toX < 3 || toX > 5 || toY < 7 || toY > 9) return false;
        } else {
            if (toX < 3 || toX > 5 || toY < 0 || toY > 2) return false;
        }
        
        return dx === 1 && dy === 1;
    }

    isValidElephantMove(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if (piece.color === 'red') {
            if (toY < 5) return false;
        } else {
            if (toY > 4) return false;
        }
        
        if (dx !== 2 || dy !== 2) return false;
        
        const eyeX = (piece.x + toX) / 2;
        const eyeY = (piece.y + toY) / 2;
        
        return !this.board.getPieceAt(eyeX, eyeY);
    }

    isValidHorseMove(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
        
        let legX = piece.x;
        let legY = piece.y;
        
        if (dx === 2) {
            legX = (piece.x + toX) / 2;
        } else {
            legY = (piece.y + toY) / 2;
        }
        
        return !this.board.getPieceAt(legX, legY);
    }

    isValidChariotMove(piece, toX, toY) {
        const dx = toX - piece.x;
        const dy = toY - piece.y;
        
        if (dx !== 0 && dy !== 0) return false;
        
        if (dx === 0) {
            const step = dy > 0 ? 1 : -1;
            for (let y = piece.y + step; y !== toY; y += step) {
                if (this.board.getPieceAt(piece.x, y)) return false;
            }
        } else {
            const step = dx > 0 ? 1 : -1;
            for (let x = piece.x + step; x !== toX; x += step) {
                if (this.board.getPieceAt(x, piece.y)) return false;
            }
        }
        
        return true;
    }

    isValidCannonMove(piece, toX, toY) {
        const dx = toX - piece.x;
        const dy = toY - piece.y;
        
        if (dx !== 0 && dy !== 0) return false;
        
        const targetPiece = this.board.getPieceAt(toX, toY);
        let pieceCount = 0;
        
        if (dx === 0) {
            const step = dy > 0 ? 1 : -1;
            for (let y = piece.y + step; y !== toY; y += step) {
                if (this.board.getPieceAt(piece.x, y)) pieceCount++;
            }
        } else {
            const step = dx > 0 ? 1 : -1;
            for (let x = piece.x + step; x !== toX; x += step) {
                if (this.board.getPieceAt(x, piece.y)) pieceCount++;
            }
        }
        
        if (targetPiece) {
            return pieceCount === 1;
        } else {
            return pieceCount === 0;
        }
    }

    isValidSoldierMove(piece, toX, toY) {
        const dx = toX - piece.x;
        const dy = toY - piece.y;
        
        if (piece.color === 'red') {
            if (dy > 0) return false;
            
            if (piece.y > 4) {
                return dy === -1 && dx === 0;
            } else {
                return (dy === -1 && dx === 0) || (dy === 0 && Math.abs(dx) === 1);
            }
        } else {
            if (dy < 0) return false;
            
            if (piece.y < 5) {
                return dy === 1 && dx === 0;
            } else {
                return (dy === 1 && dx === 0) || (dy === 0 && Math.abs(dx) === 1);
            }
        }
    }

    getValidMoves(piece) {
        const moves = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                if (this.isValidMove(piece, x, y)) {
                    moves.push({ x, y });
                }
            }
        }
        return moves;
    }

    isInCheck(color) {
        const king = this.board.findKing(color);
        if (!king) return false;
        
        const enemyColor = color === 'red' ? 'black' : 'red';
        const pieces = this.board.getPiecesByColor(enemyColor);
        
        for (const piece of pieces) {
            if (this.isValidMove(piece, king.x, king.y)) {
                return true;
            }
        }
        
        return false;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        
        const pieces = this.board.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const moves = this.getValidMoves(piece);
            for (const move of moves) {
                if (this.board.testMove(piece, move.x, move.y)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    isStalemate(color) {
        if (this.isInCheck(color)) return false;
        
        const pieces = this.board.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const moves = this.getValidMoves(piece);
            for (const move of moves) {
                if (this.board.testMove(piece, move.x, move.y)) {
                    return false;
                }
            }
        }
        
        return true;
    }
}
