import { Piece } from './Piece.js';
import { 
    PLAYER, 
    BOARD_CONFIG, 
    PIECE_CONFIG, 
    RAILWAY_LINES, 
    CAMPS, 
    HEADQUARTERS 
} from './constants.js';


export class Board {
    constructor() {
        this.rows = BOARD_CONFIG.ROWS;
        this.cols = BOARD_CONFIG.COLS;
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.capturedPieces = {
            [PLAYER.RED]: [],
            [PLAYER.BLUE]: []
        };
        this.flagRevealed = {
            [PLAYER.RED]: false,
            [PLAYER.BLUE]: false
        };
        this.commandersAlive = {
            [PLAYER.RED]: true,
            [PLAYER.BLUE]: true
        };
    }

    initialize() {
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.capturedPieces = {
            [PLAYER.RED]: [],
            [PLAYER.BLUE]: []
        };
        this.flagRevealed = {
            [PLAYER.RED]: false,
            [PLAYER.BLUE]: false
        };
        this.commandersAlive = {
            [PLAYER.RED]: true,
            [PLAYER.BLUE]: true
        };

        this.setupPlayerPieces(PLAYER.BLUE, 0, 5);
        this.setupPlayerPieces(PLAYER.RED, 6, 11);
    }

    setupPlayerPieces(player, startRow, endRow) {
        const pieces = [];
        PIECE_CONFIG[player].forEach(config => {
            for (let i = 0; i < config.count; i++) {
                pieces.push(config.type);
            }
        });

        this.shuffleArray(pieces);

        const hqPositions = HEADQUARTERS[player];
        const flagIndex = pieces.findIndex(p => p.id === 0);
        const mineIndices = [];
        pieces.forEach((p, i) => {
            if (p.id === 1) mineIndices.push(i);
        });

        const flagHq = hqPositions[Math.floor(Math.random() * hqPositions.length)];
        this.grid[flagHq.row][flagHq.col] = new Piece(pieces[flagIndex], player, flagHq.row, flagHq.col);
        pieces.splice(flagIndex, 1);

        const otherHq = hqPositions.find(pos => pos.row !== flagHq.row || pos.col !== flagHq.col);
        if (mineIndices.length > 0) {
            const mineIndex = pieces.findIndex(p => p.id === 1);
            if (mineIndex !== -1) {
                this.grid[otherHq.row][otherHq.col] = new Piece(pieces[mineIndex], player, otherHq.row, otherHq.col);
                pieces.splice(mineIndex, 1);
            }
        }

        if (!this.grid[otherHq.row][otherHq.col]) {
            const randomIndex = Math.floor(Math.random() * pieces.length);
            this.grid[otherHq.row][otherHq.col] = new Piece(pieces[randomIndex], player, otherHq.row, otherHq.col);
            pieces.splice(randomIndex, 1);
        }

        let pieceIndex = 0;
        for (let row = startRow; row <= endRow && pieceIndex < pieces.length; row++) {
            for (let col = 0; col < this.cols && pieceIndex < pieces.length; col++) {
                if (this.grid[row][col]) continue;
                
                if (this.isHeadquarters(row, col, player)) continue;
                
                if (this.isCamp(row, col)) continue;

                this.grid[row][col] = new Piece(pieces[pieceIndex], player, row, col);
                pieceIndex++;
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    isCamp(row, col) {
        return CAMPS.some(camp => camp.row === row && camp.col === col);
    }

    isHeadquarters(row, col, player) {
        if (player) {
            return HEADQUARTERS[player].some(hq => hq.row === row && hq.col === col);
        }
        return HEADQUARTERS[PLAYER.RED].some(hq => hq.row === row && hq.col === col) ||
               HEADQUARTERS[PLAYER.BLUE].some(hq => hq.row === row && hq.col === col);
    }

    isOnRailway(row, col) {
        for (const line of RAILWAY_LINES.horizontal) {
            if (line.row === row && line.cols.includes(col)) {
                return true;
            }
        }
        for (const line of RAILWAY_LINES.vertical) {
            if (line.col === col && line.rows.includes(row)) {
                return true;
            }
        }
        return false;
    }

    getPiece(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.grid[row][col];
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    canMoveTo(fromRow, fromCol, toRow, toCol, currentPlayer) {
        const piece = this.getPiece(fromRow, fromCol);
        
        if (!piece || piece.player !== currentPlayer) {
            return false;
        }

        if (!piece.canMove) {
            return false;
        }

        if (fromRow === toRow && fromCol === toCol) {
            return false;
        }

        if (!this.isValidPosition(toRow, toCol)) {
            return false;
        }

        const targetPiece = this.getPiece(toRow, toCol);
        if (targetPiece && targetPiece.player === currentPlayer) {
            return false;
        }

        if (this.isCamp(toRow, toCol) && targetPiece) {
            return false;
        }

        const isAdjacent = this.isAdjacent(fromRow, fromCol, toRow, toCol);
        const isRailwayMove = this.isValidRailwayMove(fromRow, fromCol, toRow, toCol);

        return isAdjacent || isRailwayMove;
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    isValidRailwayMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isOnRailway(fromRow, fromCol) || !this.isOnRailway(toRow, toCol)) {
            return false;
        }

        if (fromRow === toRow) {
            const minCol = Math.min(fromCol, toCol);
            const maxCol = Math.max(fromCol, toCol);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.getPiece(fromRow, col)) {
                    return false;
                }
            }
            return true;
        }

        if (fromCol === toCol) {
            const minRow = Math.min(fromRow, toRow);
            const maxRow = Math.max(fromRow, toRow);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.getPiece(row, fromCol)) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    getValidMoves(row, col, currentPlayer) {
        const moves = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.canMoveTo(row, col, r, c, currentPlayer)) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        const targetPiece = this.getPiece(toRow, toCol);

        if (!piece) {
            return null;
        }

        let battleResult = null;

        if (targetPiece) {
            battleResult = this.resolveBattle(piece, targetPiece);
        }

        this.grid[fromRow][fromCol] = null;
        
        if (battleResult === null || battleResult === 1) {
            piece.row = toRow;
            piece.col = toCol;
            this.grid[toRow][toCol] = piece;
            
            if (targetPiece) {
                this.capturedPieces[piece.player].push(targetPiece);
                if (targetPiece.isCommander) {
                    this.commandersAlive[targetPiece.player] = false;
                }
            }
        } else if (battleResult === -1) {
            this.capturedPieces[targetPiece.player].push(piece);
            if (piece.isCommander) {
                this.commandersAlive[piece.player] = false;
            }
        } else {
            this.capturedPieces[piece.player].push(targetPiece);
            this.capturedPieces[targetPiece.player].push(piece);
            this.grid[toRow][toCol] = null;
            
            if (piece.isCommander) {
                this.commandersAlive[piece.player] = false;
            }
            if (targetPiece.isCommander) {
                this.commandersAlive[targetPiece.player] = false;
            }
        }

        return {
            piece,
            targetPiece,
            battleResult
        };
    }

    resolveBattle(attacker, defender) {
        return Piece.compare(attacker, defender);
    }

    hasMovablePieces(player) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.player === player && piece.canMove) {
                    return true;
                }
            }
        }
        return false;
    }

    getFlagPosition(player) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.player === player && piece.isFlag) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    getPieces(player) {
        const pieces = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.player === player) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }
}
