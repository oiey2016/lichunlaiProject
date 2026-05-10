import { Board } from './Board.js';
import { PLAYER } from './constants.js';

export class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
		
    }

    initialize() {
        this.board.initialize();
        this.currentPlayer = PLAYER.RED;
        this.selectedPiece = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
    }

    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);

        if (this.selectedPiece) {
            const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);

            if (isValidMove) {
                return this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            }

            if (piece && piece.player === this.currentPlayer) {
                this.selectedPiece = piece;
                this.validMoves = this.board.getValidMoves(row, col, this.currentPlayer);
                return { success: true };
            }

            this.selectedPiece = null;
            this.validMoves = [];
            return { success: true };
        }

        if (piece && piece.player === this.currentPlayer) {
            this.selectedPiece = piece;
            this.validMoves = this.board.getValidMoves(row, col, this.currentPlayer);
            return { success: true };
        }

        return { success: false };
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const result = this.board.movePiece(fromRow, fromCol, toRow, toCol);

        if (!result) {
            return { success: false };
        }

        this.selectedPiece = null;
        this.validMoves = [];

        this.checkGameOver();

        if (!this.gameOver) {
            this.currentPlayer = this.currentPlayer === PLAYER.RED ? PLAYER.BLUE : PLAYER.RED;
        }

        return {
            success: true,
            gameOver: this.gameOver,
            winner: this.winner,
            moveResult: result
        };
    }

    checkGameOver() {
        const redFlag = this.board.getFlagPosition(PLAYER.RED);
        const blueFlag = this.board.getFlagPosition(PLAYER.BLUE);

        if (!redFlag) {
            this.gameOver = true;
            this.winner = PLAYER.BLUE;
            return;
        }

        if (!blueFlag) {
            this.gameOver = true;
            this.winner = PLAYER.RED;
            return;
        }

        if (!this.board.hasMovablePieces(PLAYER.RED)) {
            this.gameOver = true;
            this.winner = PLAYER.BLUE;
            return;
        }

        if (!this.board.hasMovablePieces(PLAYER.BLUE)) {
            this.gameOver = true;
            this.winner = PLAYER.RED;
            return;
        }
    }

    getCapturedPieces(player) {
        return this.board.capturedPieces[player] || [];
    }
}
