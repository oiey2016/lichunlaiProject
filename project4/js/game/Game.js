import { Board } from './Board.js';
import { PLAYER } from './constants.js';

export class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = PLAYER.RED;
        this.gameOver = false;
        this.winner = null;
        this.selectedPiece = null;
        this.validMoves = [];
    }

    initialize() {
        this.board.initialize();
        this.currentPlayer = PLAYER.RED;
        this.gameOver = false;
        this.winner = null;
        this.selectedPiece = null;
        this.validMoves = [];
    }

    selectPiece(row, col) {
        if (this.gameOver) {
            return { success: false, message: '游戏已结束' };
        }

        const piece = this.board.getPiece(row, col);

        if (piece && piece.player === this.currentPlayer) {
            this.selectedPiece = { row, col };
            this.validMoves = this.board.getValidMoves(row, col, this.currentPlayer);
            return { 
                success: true, 
                selected: true,
                piece,
                validMoves: this.validMoves
            };
        }

        if (this.selectedPiece) {
            return this.tryMove(row, col);
        }

        return { success: false, message: '请选择己方棋子' };
    }

    tryMove(toRow, toCol) {
        if (!this.selectedPiece) {
            return { success: false, message: '请先选择棋子' };
        }

        const { row: fromRow, col: fromCol } = this.selectedPiece;

        if (!this.board.canMoveTo(fromRow, fromCol, toRow, toCol, this.currentPlayer)) {
            return { success: false, message: '无效的移动' };
        }

        const moveResult = this.board.movePiece(fromRow, fromCol, toRow, toCol);

        if (!moveResult) {
            return { success: false, message: '移动失败' };
        }

        this.selectedPiece = null;
        this.validMoves = [];

        const gameOverResult = this.checkGameOver();
        if (gameOverResult.gameOver) {
            this.gameOver = true;
            this.winner = gameOverResult.winner;
            return {
                success: true,
                moveResult,
                gameOver: true,
                winner: this.winner
            };
        }

        this.switchPlayer();

        return {
            success: true,
            moveResult,
            gameOver: false,
            currentPlayer: this.currentPlayer
        };
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === PLAYER.RED ? PLAYER.BLUE : PLAYER.RED;
    }

    checkGameOver() {
        const redFlag = this.board.getFlagPosition(PLAYER.RED);
        const blueFlag = this.board.getFlagPosition(PLAYER.BLUE);

        if (!redFlag) {
            return { gameOver: true, winner: PLAYER.BLUE, reason: '红方军旗被吃' };
        }

        if (!blueFlag) {
            return { gameOver: true, winner: PLAYER.RED, reason: '蓝方军旗被吃' };
        }

        if (!this.board.hasMovablePieces(PLAYER.RED)) {
            return { gameOver: true, winner: PLAYER.BLUE, reason: '红方无棋可走' };
        }

        if (!this.board.hasMovablePieces(PLAYER.BLUE)) {
            return { gameOver: true, winner: PLAYER.RED, reason: '蓝方无棋可走' };
        }

        return { gameOver: false, winner: null };
    }

    getCapturedPieces(player) {
        return this.board.capturedPieces[player];
    }

    getBoardState() {
        return {
            grid: this.board.grid,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            winner: this.winner,
            selectedPiece: this.selectedPiece,
            validMoves: this.validMoves
        };
    }

    restart() {
        this.initialize();
    }
}