class Rules {
    constructor(board) {
        this.board = board;
    }

    isMoveValid(piece, toX, toY) {
        if (!this.board.isValidPosition(toX, toY)) {
            return false;
        }
        
        const targetPiece = this.board.getPiece(toX, toY);
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }
        
        let isValid = false;
        switch (piece.type) {
            case PieceType.KING:
                isValid = this.isKingMoveValid(piece, toX, toY);
                break;
            case PieceType.ADVISOR:
                isValid = this.isAdvisorMoveValid(piece, toX, toY);
                break;
            case PieceType.ELEPHANT:
                isValid = this.isElephantMoveValid(piece, toX, toY);
                break;
            case PieceType.HORSE:
                isValid = this.isHorseMoveValid(piece, toX, toY);
                break;
            case PieceType.CHARIOT:
                isValid = this.isChariotMoveValid(piece, toX, toY);
                break;
            case PieceType.CANNON:
                isValid = this.isCannonMoveValid(piece, toX, toY);
                break;
            case PieceType.PAWN:
                isValid = this.isPawnMoveValid(piece, toX, toY);
                break;
        }
        
        if (!isValid) return false;
        
        return !this.wouldBeInCheck(piece, toX, toY);
    }

    isKingMoveValid(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            if (this.board.isInPalace(toX, toY, piece.color)) {
                return true;
            }
        }
        
        const targetKing = this.board.getKing(piece.color === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED);
        if (targetKing && piece.x === toX && targetKing.x === toX) {
            const minY = Math.min(piece.y, targetKing.y);
            const maxY = Math.max(piece.y, targetKing.y);
            
            for (let y = minY + 1; y < maxY; y++) {
                if (this.board.getPiece(piece.x, y)) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }

    isAdvisorMoveValid(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if (dx === 1 && dy === 1) {
            return this.board.isInPalace(toX, toY, piece.color);
        }
        
        return false;
    }

    isElephantMoveValid(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if (dx === 2 && dy === 2) {
            if (this.board.hasCrossedRiver(toY, piece.color)) {
                return false;
            }
            
            const eyeX = (piece.x + toX) / 2;
            const eyeY = (piece.y + toY) / 2;
            
            if (this.board.getPiece(eyeX, eyeY)) {
                return false;
            }
            
            return true;
        }
        
        return false;
    }

    isHorseMoveValid(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
            let legX, legY;
            
            if (dx === 2) {
                legX = (piece.x + toX) / 2;
                legY = piece.y;
            } else {
                legX = piece.x;
                legY = (piece.y + toY) / 2;
            }
            
            if (this.board.getPiece(legX, legY)) {
                return false;
            }
            
            return true;
        }
        
        return false;
    }

    isChariotMoveValid(piece, toX, toY) {
        const dx = toX - piece.x;
        const dy = toY - piece.y;
        
        if (dx !== 0 && dy !== 0) {
            return false;
        }
        
        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        
        let x = piece.x + stepX;
        let y = piece.y + stepY;
        
        while (x !== toX || y !== toY) {
            if (this.board.getPiece(x, y)) {
                return false;
            }
            x += stepX;
            y += stepY;
        }
        
        return true;
    }

    isCannonMoveValid(piece, toX, toY) {
        const dx = toX - piece.x;
        const dy = toY - piece.y;
        
        if (dx !== 0 && dy !== 0) {
            return false;
        }
        
        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        
        let x = piece.x + stepX;
        let y = piece.y + stepY;
        let piecesBetween = 0;
        
        while (x !== toX || y !== toY) {
            if (this.board.getPiece(x, y)) {
                piecesBetween++;
            }
            x += stepX;
            y += stepY;
        }
        
        const targetPiece = this.board.getPiece(toX, toY);
        
        if (targetPiece) {
            return piecesBetween === 1;
        } else {
            return piecesBetween === 0;
        }
    }

    isPawnMoveValid(piece, toX, toY) {
        const dx = toX - piece.x;
        const dy = toY - piece.y;
        
        const forward = piece.color === PieceColor.RED ? -1 : 1;
        
        if (dy === forward && dx === 0) {
            return true;
        }
        
        if (this.board.hasCrossedRiver(piece.y, piece.color)) {
            if (dy === 0 && Math.abs(dx) === 1) {
                return true;
            }
        }
        
        return false;
    }

    wouldBeInCheck(piece, toX, toY) {
        const oldX = piece.x;
        const oldY = piece.y;
        const targetPiece = this.board.getPiece(toX, toY);
        
        if (targetPiece) {
            this.board.removePiece(targetPiece);
        }
        
        piece.x = toX;
        piece.y = toY;
        
        const inCheck = this.isInCheck(piece.color);
        
        piece.x = oldX;
        piece.y = oldY;
        
        if (targetPiece) {
            this.board.addPiece(targetPiece);
        }
        
        return inCheck;
    }

    isInCheck(color) {
        const king = this.board.getKing(color);
        if (!king) return true;
        
        const enemyColor = color === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED;
        const enemyPieces = this.board.getPiecesByColor(enemyColor);
        
        for (const piece of enemyPieces) {
            if (this.canAttack(piece, king.x, king.y)) {
                return true;
            }
        }
        
        return false;
    }

    canAttack(piece, toX, toY) {
        switch (piece.type) {
            case PieceType.KING:
                return this.isKingMoveValid(piece, toX, toY);
            case PieceType.ADVISOR:
                return this.isAdvisorMoveValid(piece, toX, toY);
            case PieceType.ELEPHANT:
                return this.isElephantMoveValid(piece, toX, toY);
            case PieceType.HORSE:
                return this.isHorseMoveValid(piece, toX, toY);
            case PieceType.CHARIOT:
                return this.isChariotMoveValid(piece, toX, toY);
            case PieceType.CANNON:
                return this.isCannonMoveValid(piece, toX, toY);
            case PieceType.PAWN:
                return this.isPawnMoveValid(piece, toX, toY);
            default:
                return false;
        }
    }

    getValidMoves(piece) {
        const moves = [];
        
        for (let x = 0; x < this.board.width; x++) {
            for (let y = 0; y < this.board.height; y++) {
                if (this.isMoveValid(piece, x, y)) {
                    moves.push({ x, y });
                }
            }
        }
        
        return moves;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) {
            return false;
        }
        
        const pieces = this.board.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const validMoves = this.getValidMoves(piece);
            if (validMoves.length > 0) {
                return false;
            }
        }
        
        return true;
    }

    isStalemate(color) {
        if (this.isInCheck(color)) {
            return false;
        }
        
        const pieces = this.board.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const validMoves = this.getValidMoves(piece);
            if (validMoves.length > 0) {
                return false;
            }
        }
        
        return true;
    }
}
