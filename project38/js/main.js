import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');

    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const winScreen = document.getElementById('winScreen');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            game.start();
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            gameOverScreen.classList.add('hidden');
            game.restart();
        });
    }

    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            winScreen.classList.add('hidden');
            game.nextLevel();
        });
    }

    console.log('🐌 跳跃蜗牛游戏已加载！点击开始按钮开始游戏。');
});