/**
 * UI模块 - 负责游戏界面渲染和交互
 */

import { GAME_CONFIG } from './data.js';

/**
 * 渲染整个游戏棋盘
 */
export function renderBoard(board, gameBoardElement) {
    gameBoardElement.innerHTML = '';
    
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceElement = createPieceElement(piece);
                gameBoardElement.appendChild(pieceElement);
            }
        }
    }
}

/**
 * 创建单个棋子的DOM元素
 */
export function createPieceElement(piece) {
    const element = document.createElement('div');
    element.className = `piece ${piece.type}`;
    element.dataset.row = piece.row;
    element.dataset.col = piece.col;
    
    // 添加状态类
    if (piece.matched) {
        element.classList.add('matched');
    }
    if (piece.falling) {
        element.classList.add('falling');
    }
    if (piece.appearing) {
        element.classList.add('appearing');
    }
    
    return element;
}

/**
 * 标记棋子为选中状态
 */
export function selectPiece(piece, gameBoardElement) {
    const element = gameBoardElement.querySelector(
        `[data-row="${piece.row}"][data-col="${piece.col}"]`
    );
    if (element) {
        element.classList.add('selected');
    }
}

/**
 * 取消选中棋子
 */
export function deselectPiece(piece, gameBoardElement) {
    const element = gameBoardElement.querySelector(
        `[data-row="${piece.row}"][data-col="${piece.col}"]`
    );
    if (element) {
        element.classList.remove('selected');
    }
}

/**
 * 取消所有选中状态
 */
export function deselectAllPieces(gameBoardElement) {
    const selected = gameBoardElement.querySelectorAll('.selected');
    selected.forEach(el => el.classList.remove('selected'));
}

/**
 * 更新分数显示
 */
export function updateScore(score) {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
        // 添加分数变化动画
        scoreElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * 更新步数显示
 */
export function updateMoves(moves) {
    const movesElement = document.getElementById('moves');
    if (movesElement) {
        movesElement.textContent = moves;
    }
}

/**
 * 等待动画完成
 */
export function waitForAnimation(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 显示游戏结束界面
 */
export function showGameOver(score, onRestart) {
    const gameOverElement = document.createElement('div');
    gameOverElement.className = 'game-over';
    gameOverElement.innerHTML = `
        <div class="game-over-content">
            <h2>游戏结束!</h2>
            <p>最终得分: <span>${score}</span></p>
            <button class="btn" id="game-over-restart">再玩一次</button>
        </div>
    `;
    
    document.body.appendChild(gameOverElement);
    
    const restartBtn = document.getElementById('game-over-restart');
    restartBtn.addEventListener('click', () => {
        gameOverElement.remove();
        if (onRestart) {
            onRestart();
        }
    });
}

/**
 * 获取点击的棋子坐标
 */
export function getClickedPiece(event, gameBoardElement) {
    const clickedElement = event.target.closest('.piece');
    if (!clickedElement) return null;
    
    const row = parseInt(clickedElement.dataset.row);
    const col = parseInt(clickedElement.dataset.col);
    
    return { row, col };
}
