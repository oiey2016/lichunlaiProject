/**
 * 游戏主入口 - 整合所有模块
 */

import { createGameState } from './data.js';
import { 
    initializeBoard, 
    canSwap, 
    swapPieces, 
    findAllMatches, 
    removeMatches, 
    handlePiecesFall, 
    fillEmptySpaces, 
    isGameOver 
} from './logic.js';
import { 
    renderBoard, 
    selectPiece, 
    deselectAllPieces, 
    updateScore, 
    updateMoves, 
    waitForAnimation, 
    showGameOver, 
    getClickedPiece 
} from './ui.js';

class Game {
    constructor() {
        this.gameState = createGameState();
        this.gameBoardElement = document.getElementById('game-board');
        this.restartButton = document.getElementById('restart-btn');
        
        this.init();
    }

    init() {
        this.startNewGame();
        this.bindEvents();
    }

    startNewGame() {
        // 初始化游戏状态
        this.gameState = createGameState();
        this.gameState.board = initializeBoard();
        
        // 更新UI
        renderBoard(this.gameState.board, this.gameBoardElement);
        updateScore(this.gameState.score);
        updateMoves(this.gameState.moves);
    }

    bindEvents() {
        // 棋盘点击事件
        this.gameBoardElement.addEventListener('click', (event) => {
            if (this.gameState.isAnimating || this.gameState.gameOver) return;
            
            const clickedPosition = getClickedPiece(event, this.gameBoardElement);
            if (!clickedPosition) return;
            
            this.handlePieceClick(clickedPosition.row, clickedPosition.col);
        });

        // 重新开始按钮
        this.restartButton.addEventListener('click', () => {
            this.startNewGame();
        });
    }

    async handlePieceClick(row, col) {
        const clickedPiece = this.gameState.board[row][col];
        if (!clickedPiece) return;

        if (this.gameState.selectedPiece === null) {
            // 第一次点击：选中棋子
            this.gameState.selectedPiece = clickedPiece;
            selectPiece(clickedPiece, this.gameBoardElement);
        } else if (this.gameState.selectedPiece === clickedPiece) {
            // 点击同一个棋子：取消选中
            deselectAllPieces(this.gameBoardElement);
            this.gameState.selectedPiece = null;
        } else {
            // 第二次点击：尝试交换
            const selectedPiece = this.gameState.selectedPiece;
            deselectAllPieces(this.gameBoardElement);
            this.gameState.selectedPiece = null;

            if (canSwap(this.gameState.board, selectedPiece, clickedPiece)) {
                await this.performSwap(selectedPiece, clickedPiece);
            }
        }
    }

    async performSwap(piece1, piece2) {
        this.gameState.isAnimating = true;
        
        // 交换棋子
        swapPieces(this.gameState.board, piece1, piece2);
        renderBoard(this.gameState.board, this.gameBoardElement);
        
        // 等待交换动画
        await waitForAnimation(100);
        
        // 消耗一步
        this.gameState.moves--;
        updateMoves(this.gameState.moves);
        
        // 处理消除和连锁反应
        await this.processMatches();
        
        this.gameState.isAnimating = false;
        
        // 检查游戏是否结束
        if (isGameOver(this.gameState)) {
            this.gameState.gameOver = true;
            showGameOver(this.gameState.score, () => this.startNewGame());
        }
    }

    async processMatches() {
        let hasMatches = true;
        
        while (hasMatches) {
            // 查找所有可消除的棋子
            const matchedPieces = findAllMatches(this.gameState.board);
            
            if (matchedPieces.length > 0) {
                // 标记为已匹配
                matchedPieces.forEach(piece => {
                    piece.matched = true;
                });
                renderBoard(this.gameState.board, this.gameBoardElement);
                
                // 等待消除动画
                await waitForAnimation(500);
                
                // 移除匹配的棋子并更新分数
                const score = removeMatches(this.gameState.board, matchedPieces);
                this.gameState.score += score;
                updateScore(this.gameState.score);
                
                // 等待一小段时间
                await waitForAnimation(100);
                
                // 处理下落
                const fallenPieces = handlePiecesFall(this.gameState.board);
                renderBoard(this.gameState.board, this.gameBoardElement);
                
                // 等待下落动画
                await waitForAnimation(300);
                
                // 补充新棋子
                const newPieces = fillEmptySpaces(this.gameState.board);
                renderBoard(this.gameState.board, this.gameBoardElement);
                
                // 等待新棋子出现动画
                await waitForAnimation(400);
                
                // 重置状态
                fallenPieces.forEach(piece => piece.falling = false);
                newPieces.forEach(piece => piece.appearing = false);
            } else {
                hasMatches = false;
            }
        }
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
