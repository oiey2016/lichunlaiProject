import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('cardBoard');
    const slotsElement = document.getElementById('slots');
    
    const game = new Game(boardElement, slotsElement);
    game.startGame(1);
    
    const restartBtn = document.getElementById('restartBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const undoBtn = document.getElementById('undoBtn');
    const rulesBtn = document.getElementById('rulesBtn');
    const closeRulesBtn = document.getElementById('closeRulesBtn');
    const modalBtn = document.getElementById('modalBtn');
    const modal = document.getElementById('gameModal');
    const rulesModal = document.getElementById('rulesModal');
    
    restartBtn.addEventListener('click', () => {
        game.startGame(game.level);
    });
    
    shuffleBtn.addEventListener('click', () => {
        game.shuffle();
    });
    
    undoBtn.addEventListener('click', () => {
        game.undo();
    });
    
    rulesBtn.addEventListener('click', () => {
        rulesModal.classList.add('show');
    });
    
    closeRulesBtn.addEventListener('click', () => {
        rulesModal.classList.remove('show');
    });
    
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.classList.remove('show');
        }
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
