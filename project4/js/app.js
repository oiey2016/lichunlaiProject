import { Game } from './game/Game.js';
import { Renderer } from './ui/Renderer.js';
import { PLAYER } from './game/constants.js';

class App {
    constructor() {
        this.game = new Game();
        this.canvas = document.getElementById('game-board');
        this.renderer = new Renderer(this.canvas);
        this.initialize();
    }

    initialize() {
        this.game.initialize();
        this.setupEventListeners();
        this.render();
        this.updateUI();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        document.getElementById('new-game-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        document.getElementById('play-again-btn').addEventListener('click', () => this.startNewGame());

        document.querySelector('.close-btn').addEventListener('click', () => this.closeModals());
        window.addEventListener('click', (e) => this.handleModalClick(e));
    }

    handleCanvasClick(event) {
        if (this.game.gameOver) return;

        const pos = this.renderer.getBoardPosition(event.clientX, event.clientY);
        if (!pos) return;

        const result = this.game.selectPiece(pos.row, pos.col);

        if (result.success) {
            this.render();
            this.updateUI();

            if (result.gameOver) {
                this.showGameOver(result.winner);
            }
        }
    }

    render() {
        this.renderer.render(this.game);
        this.updateCapturedPieces();
    }

    updateUI() {
        this.updateCurrentPlayer();
        this.updateGameStatus();
    }

    updateCurrentPlayer() {
        const playerText = document.getElementById('current-player');
        const playerIndicator = document.getElementById('player-indicator');
        
        if (this.game.currentPlayer === PLAYER.RED) {
            playerText.textContent = '红方回合';
            playerIndicator.classList.remove('blue');
        } else {
            playerText.textContent = '蓝方回合';
            playerIndicator.classList.add('blue');
        }
    }

    updateGameStatus() {
        const statusText = document.getElementById('game-status-text');
        
        if (this.game.gameOver) {
            const winner = this.game.winner === PLAYER.RED ? '红方' : '蓝方';
            statusText.textContent = `游戏结束 - ${winner}获胜！`;
        } else {
            statusText.textContent = '游戏进行中';
        }
    }

    updateCapturedPieces() {
        this.renderCapturedPieces('red', 'red-captured');
        this.renderCapturedPieces('blue', 'blue-captured');
    }

    renderCapturedPieces(player, elementId) {
        const container = document.getElementById(elementId);
        const pieces = this.game.getCapturedPieces(player);
        
        container.innerHTML = '';
        
        pieces.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `captured-piece ${player}`;
            pieceElement.textContent = piece.name;
            container.appendChild(pieceElement);
        });
    }

    showGameOver(winner) {
        const modal = document.getElementById('game-over-modal');
        const message = document.getElementById('game-over-message');
        const winnerName = winner === PLAYER.RED ? '红方' : '蓝方';
        
        message.textContent = `${winnerName}获胜！`;
        modal.classList.add('show');
    }

    showHelp() {
        const modal = document.getElementById('help-modal');
        modal.classList.add('show');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    handleModalClick(event) {
        if (event.target.classList.contains('modal')) {
            this.closeModals();
        }
    }

    startNewGame() {
        this.closeModals();
        this.game.initialize();
        this.render();
        this.updateUI();
    }

    restartGame() {
        this.game.initialize();
        this.render();
        this.updateUI();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
