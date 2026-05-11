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

/**
 * 显示游戏规则弹窗
 */
export function showRules() {
    const rulesModal = document.createElement('div');
    rulesModal.className = 'rules-modal';
    rulesModal.innerHTML = `
        <div class="rules-content">
            <div class="rules-header">
                <h2>🎮 游戏规则</h2>
                <button class="close-btn" id="close-rules">&times;</button>
            </div>
            <div class="rules-body">
                <div class="rule-section">
                    <h3>游戏目标</h3>
                    <p>在限定步数内，通过消除棋子获得尽可能高的分数！</p>
                </div>
                
                <div class="rule-section">
                    <h3>基本操作</h3>
                    <ul>
                        <li>点击一个棋子将其选中（高亮显示）</li>
                        <li>再点击另一个相邻的棋子进行交换</li>
                        <li>如果再次点击已选中的棋子，则取消选中</li>
                    </ul>
                </div>
                
                <div class="rule-section">
                    <h3>交换规则</h3>
                    <ul>
                        <li>两个棋子必须相邻（上下左右四个方向）</li>
                        <li>交换后必须能形成可消除的组合</li>
                        <li>无效的交换会自动恢复原位</li>
                        <li>每次有效交换消耗一步</li>
                    </ul>
                </div>
                
                <div class="rule-section">
                    <h3>消除规则</h3>
                    <ul>
                        <li>水平方向连续3个或以上相同棋子</li>
                        <li>垂直方向连续3个或以上相同棋子</li>
                        <li>十字形、T形、L形等特殊形状也会消除</li>
                        <li>每个棋子消除得 10 分</li>
                    </ul>
                </div>
                
                <div class="rule-section">
                    <h3>下落与补充</h3>
                    <ul>
                        <li>消除后，上方棋子会自动下落填补空位</li>
                        <li>顶部空位会生成新的随机棋子</li>
                        <li>新棋子可能触发连锁消除！</li>
                    </ul>
                </div>
                
                <div class="rule-section">
                    <h3>游戏结束</h3>
                    <ul>
                        <li>步数用完时游戏结束</li>
                        <li>尝试在有限步数内获得最高分！</li>
                    </ul>
                </div>
                
                <div class="rule-highlight">
                    <p>💡 小提示：多观察棋盘，寻找能触发连锁消除的机会，这样可以获得更高的分数！</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(rulesModal);
    
    const closeBtn = document.getElementById('close-rules');
    closeBtn.addEventListener('click', () => {
        rulesModal.remove();
    });
    
    rulesModal.addEventListener('click', (event) => {
        if (event.target === rulesModal) {
            rulesModal.remove();
        }
    });
    
    document.addEventListener('keydown', function escHandler(event) {
        if (event.key === 'Escape') {
            rulesModal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });
}
