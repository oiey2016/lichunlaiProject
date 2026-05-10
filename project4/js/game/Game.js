import { Board } from './Board.js';
import { PLAYER } from './constants.js';

export class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.gameOver = false;
        this.winner = null;
        this.validMoves = [];
    }
	

    initialize() {
        this.board.initialize();
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.gameOver = false;
        this.winner = null;
        this.validMoves = [];
    }

    selectPiece(row, col) {
        if (this.gameOver) {
            return { success: false, gameOver: false };
        }

        const piece = this.board.getPiece(row, col);

        if (this.selectedPiece) {
            const isValidMove = this.validMoves.some(move => 
                move.row === row && move.col === col
            );

            if (isValidMove) {
                return this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            }

            if (piece && piece.player === this.currentPlayer) {
                this.selectedPiece = piece;
                this.validMoves = this.board.getValidMoves(row, col, this.currentPlayer);
                return { success: true, gameOver: false };
            }

            this.selectedPiece = null;
            this.validMoves = [];
            return { success: true, gameOver: false };
        }

        if (piece && piece.player === this.currentPlayer) {
            this.selectedPiece = piece;
            this.validMoves = this.board.getValidMoves(row, col, this.currentPlayer);
            return { success: true, gameOver: false };
        }

        return { success: false, gameOver: false };
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const result = this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        if (!result) {
            this.selectedPiece = null;
            this.validMoves = [];
            return { success: false, gameOver: false };
        }

        if (result.piece) {
            result.piece.revealed = true;
        }
        if (result.targetPiece) {
            result.targetPiece.revealed = true;
        }

        if (result.battleResult === 1 && result.targetPiece && result.targetPiece.isFlag) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.selectedPiece = null;
            this.validMoves = [];
            return { success: true, gameOver: true, winner: this.winner };
        }

        this.switchPlayer();

        if (!this.board.hasMovablePieces(this.currentPlayer)) {
            this.gameOver = true;
            this.winner = this.currentPlayer === PLAYER.RED ? PLAYER.BLUE : PLAYER.RED;
            this.selectedPiece = null;
            this.validMoves = [];
            return { success: true, gameOver: true, winner: this.winner };
        }

        this.selectedPiece = null;
        this.validMoves = [];
        return { success: true, gameOver: false };
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYER.RED ? PLAYER.BLUE : PLAYER.RED;
    }

    getCapturedPieces(player) {
        return this.board.capturedPieces[player] || [];
    }
}
