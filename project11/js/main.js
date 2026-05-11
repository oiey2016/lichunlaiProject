import { GameBoard } from './GameBoard.js';

class Game {
    constructor() {
        this.gameBoard = null;
        this.level = 1;
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.startGame();
    }

    setupDOM() {
        this.gameBoardContainer = document.getElementById('gameBoard');
        this.levelElement = document.getElementById('level');
        this.remainingElement = document.getElementById('remaining');
        this.slots = document.querySelectorAll('.slot');
        this.undoBtn = document.getElementById('undoBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalBtn = document.getElementById('modalBtn');
    }

    setupEventListeners() {
        this.undoBtn.addEventListener('click', () => this.undo());
        this.shuffleBtn.addEventListener('click', () => this.shuffle());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.modalBtn.addEventListener('click', () => this.handleModalClose());
    }

    startGame() {
        this.gameBoard = new GameBoard(this.gameBoardContainer);
        this.gameBoard.onStateChangeCallback = () => this.updateUI();
        this.gameBoard.onGameWinCallback = () => this.showWinModal();
        this.gameBoard.onGameLoseCallback = () => this.showLoseModal();
        this.gameBoard.init(this.level);
        this.updateUI();
    }

    updateUI() {
        this.updateStats();
        this.updateSlots();
        this.updateButtons();
    }

    updateStats() {
        this.levelElement.textContent = this.level;
        this.remainingElement.textContent = this.gameBoard.getRemainingCards();
    }

    updateSlots() {
        const selectedCards = this.gameBoard.getSelectedSlots();
        
        this.slots.forEach((slot, index) => {
            slot.innerHTML = '';
            slot.classList.remove('filled', 'warning');
            
            if (index < selectedCards.length) {
                slot.textContent = selectedCards[index].type;
                slot.classList.add('filled');
            }
        });

        if (selectedCards.length >= 5) {
            for (let i = selectedCards.length - 1; i < this.slots.length; i++) {
                this.slots[i].classList.add('warning');
            }
        }
    }

    updateButtons() {
        this.undoBtn.disabled = !this.gameBoard.canUndo();
    }

    undo() {
        if (this.gameBoard.undo()) {
            this.updateUI();
        }
    }

    shuffle() {
        this.gameBoard.shuffle();
    }

    restart() {
        this.hideModal();
        this.level = 1;
        this.startGame();
    }

    nextLevel() {
        this.hideModal();
        this.level++;
        this.startGame();
    }

    showWinModal() {
        this.modalTitle.textContent = '🎉 恭喜过关！';
        this.modalMessage.textContent = `你成功完成了第 ${this.level} 关！`;
        this.modalBtn.textContent = this.level < 12 ? '下一关' : '重新开始';
        this.showModal();
    }

    showLoseModal() {
        this.modalTitle.textContent = '😢 游戏结束';
        this.modalMessage.textContent = '槽位已满，请重新开始！';
        this.modalBtn.textContent = '再试一次';
        this.showModal();
    }

    showModal() {
        this.modal.classList.add('show');
    }

    hideModal() {
        this.modal.classList.remove('show');
    }

    handleModalClose() {
        if (this.modalTitle.textContent.includes('恭喜过关') && this.level < 12) {
            this.nextLevel();
        } else {
            this.restart();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});