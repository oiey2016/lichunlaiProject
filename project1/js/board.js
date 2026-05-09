class Board {
    constructor() {
        this.grid = [];
        this.pieces = [];
        this.initBoard();
    }

    initBoard() {
        this.grid = [];
        for (let y = 0; y < 10; y++) {
            this.grid[y] = [];
            for (let x = 0; x < 9; x++) {
                this.grid[y][x] = null;
            }
        }
        this.pieces = [];
        
        this.placePiece('chariot', 'red', 0, 9);
        this.placePiece('horse', 'red', 1, 9);
        this.placePiece('elephant', 'red', 2, 9);
        this.placePiece('advisor', 'red', 3, 9);
        this.placePiece('king', 'red', 4, 9);
        this.placePiece('advisor', 'red', 5, 9);
        this.placePiece('elephant', 'red', 6, 9);
        this.placePiece('horse', 'red', 7, 9);
        this.placePiece('chariot', 'red', 8, 9);
        this.placePiece('cannon', 'red', 1, 7);
        this.placePiece('cannon', 'red', 7, 7);
        this.placePiece('soldier', 'red', 0, 6);
        this.placePiece('soldier', 'red', 2, 6);
        this.placePiece('soldier', 'red', 4, 6);
        this.placePiece('soldier', 'red', 6, 6);
        this.placePiece('soldier', 'red', 8, 6);
        
        this.placePiece('chariot', 'black', 0, 0);
        this.placePiece('horse', 'black', 1, 0);
        this.placePiece('elephant', 'black', 2, 0);
        this.placePiece('advisor', 'black', 3, 0);
        this.placePiece('king', 'black', 4, 0);
        this.placePiece('advisor', 'black', 5, 0);
        this.placePiece('elephant', 'black', 6, 0);
        this.placePiece('horse', 'black', 7, 0);
        this.placePiece('chariot', 'black', 8, 0);
        this.placePiece('cannon', 'black', 1, 2);
        this.placePiece('cannon', 'black', 7, 2);
        this.placePiece('soldier', 'black', 0, 3);
        this.placePiece('soldier', 'black', 2, 3);
        this.placePiece('soldier', 'black', 4, 3);
        this.placePiece('soldier', 'black', 6, 3);
        this.placePiece('soldier', 'black', 8, 3);
    }

    placePiece(type, color, x, y) {
        const piece = new Piece(type, color, x, y);
        this.grid[y][x] = piece;
        this.pieces.push(piece);
        return piece;
    }

    getPieceAt(x, y) {
        if (x < 0 || x > 8 || y < 0 || y > 9) return null;
        return this.grid[y][x];
    }

    setPieceAt(x, y, piece) {
        if (x >= 0 && x <= 8 && y >= 0 && y <= 9) {
            this.grid[y][x] = piece;
            if (piece) {
                piece.x = x;
                piece.y = y;
            }
        }
    }

    movePiece(fromX, fromY, toX, toY) {
        const piece = this.getPieceAt(fromX, fromY);
        if (!piece) return null;
        
        const capturedPiece = this.getPieceAt(toX, toY);
        
        this.grid[fromY][fromX] = null;
        this.grid[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;
        
        if (capturedPiece) {
            const index = this.pieces.indexOf(capturedPiece);
            if (index > -1) {
                this.pieces.splice(index, 1);
            }
        }
        
        return capturedPiece;
    }

    getPiecesByColor(color) {
        return this.pieces.filter(piece => piece.color === color);
    }

    findKing(color) {
        for (const piece of this.pieces) {
            if (piece.type === 'king' && piece.color === color) {
                return piece;
            }
        }
        return null;
    }

    testMove(piece, toX, toY) {
        const fromX = piece.x;
        const fromY = piece.y;
        const originalPosition = { x: fromX, y: fromY };
        const capturedPiece = this.getPieceAt(toX, toY);
        
        this.grid[fromY][fromX] = null;
        this.grid[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;
        
        if (capturedPiece) {
            const index = this.pieces.indexOf(capturedPiece);
            if (index > -1) {
                this.pieces.splice(index, 1);
            }
        }
        
        const rules = new Rules(this);
        const isSafe = !rules.isInCheck(piece.color);
        
        this.grid[fromY][fromX] = piece;
        this.grid[toY][toX] = capturedPiece;
        piece.x = originalPosition.x;
        piece.y = originalPosition.y;
        
        if (capturedPiece) {
            this.pieces.push(capturedPiece);
        }
        
        return isSafe;
    }

    clone() {
        const newBoard = new Board();
        newBoard.grid = [];
        newBoard.pieces = [];
        
        for (let y = 0; y < 10; y++) {
            newBoard.grid[y] = [];
            for (let x = 0; x < 9; x++) {
                if (this.grid[y][x]) {
                    const piece = this.grid[y][x].clone();
                    newBoard.grid[y][x] = piece;
                    newBoard.pieces.push(piece);
                } else {
                    newBoard.grid[y][x] = null;
                }
            }
        }
        
        return newBoard;
    }
}
