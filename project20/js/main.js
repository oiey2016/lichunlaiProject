import { CONFIG } from './config.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';

class GameApp {
    constructor() {
        this.game = new Game();
        this.renderer = new Renderer('gameCanvas');
        this.unlockedLevels = 1;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createLevelButtons();
        this.updateUI();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.game.setKey(e.code, true);
        });

        document.addEventListener('keyup', (e) => {
            this.game.setKey(e.code, false);
        });

        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('modalBtn').addEventListener('click', () => {
            this.handleModalClick();
        });
    }

    createLevelButtons() {
        const container = document.getElementById('levelButtons');
        container.innerHTML = '';
        
        for (let i = 1; i <= CONFIG.TOTAL_LEVELS; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;
            
            if (i > this.unlockedLevels) {
                btn.classList.add('locked');
            } else {
                btn.addEventListener('click', () => {
                    this.selectLevel(i);
                });
            }
            
            container.appendChild(btn);
        }
    }

    startGame() {
        this.game.initLevel(1);
        this.unlockedLevels = 1;
        this.createLevelButtons();
        this.updateLevelButtons();
    }

    selectLevel(level) {
        if (level <= this.unlockedLevels) {
            this.game.initLevel(level);
            this.updateLevelButtons();
        }
    }

    restartGame() {
        this.game.restart();
    }

    handleModalClick() {
        const modal = document.getElementById('gameModal');
        modal.classList.remove('show');
        
        if (this.game.level < CONFIG.TOTAL_LEVELS) {
            this.game.nextLevel();
            this.unlockedLevels = Math.max(this.unlockedLevels, this.game.level);
            this.createLevelButtons();
            this.updateLevelButtons();
        }
    }

    updateLevelButtons() {
        const buttons = document.querySelectorAll('.level-btn');
        buttons.forEach((btn, index) => {
            btn.classList.remove('active');
            if (index + 1 === this.game.level) {
                btn.classList.add('active');
            }
        });
    }

    showWinModal() {
        const modal = document.getElementById('gameModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        const btn = document.getElementById('modalBtn');
        
        if (this.game.level >= CONFIG.TOTAL_LEVELS) {
            title.textContent = '🎉 恭喜通关！';
            message.textContent = `你用 ${this.game.getFormattedTime()} 内完成了所有关卡！`;
            btn.textContent = '重新开始';
        } else {
            title.textContent = '✨ 恭喜过关！';
            message.textContent = `关卡 ${this.game.level} 完成！用时：${this.game.getFormattedTime()}`;
            btn.textContent = '下一关';
        }
        
        modal.classList.add('show');
    }

    updateUI() {
        document.getElementById('level').textContent = this.game.level;
        document.getElementById('beans').textContent = 
            `${this.game.beansCollected}/${this.game.totalBeans}`;
        document.getElementById('timer').textContent = this.game.getFormattedTime();
    }

    gameLoop() {
        if (this.game.mazeData) {
            this.game.update();
            this.renderer.render(this.game);
            this.updateUI();
            
            if (this.game.checkExit()) {
                this.game.isPlaying = false;
                this.game.stopTimer();
                this.showWinModal();
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.game.destroy();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new GameApp();
});