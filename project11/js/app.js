import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('cardBoard');
    const slotsElement = document.getElementById('slots');
    
    const game = new Game(boardElement, slotsElement);
    game.startGame(1);
    
    const restartBtn = document.getElementById('restartBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const undoBtn = document.getElementById('undoBtn');
    const modalBtn = document.getElementById('modalBtn');
    const modal = document.getElementById('gameModal');
    
    restartBtn.addEventListener('click', () => {
        game.startGame(game.level);
    });
    
    shuffleBtn.addEventListener('click', () => {
        game.shuffle();
    });
    
    undoBtn.addEventListener('click', () => {
        game.undo();
    });
    
    modalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        const title = document.getElementById('modalTitle');
        
        if (title.textContent.includes('恭喜')) {
            game.startGame(game.level + 1);
        } else {
            game.startGame(game.level);
        }
    });
});
