/**
 * 数据模块 - 定义游戏常量和数据结构
 */

// 游戏配置常量
export const GAME_CONFIG = {
    BOARD_SIZE: 8,           // 棋盘大小 8x8
    TOTAL_MOVES: 30,         // 总步数
    MIN_MATCH: 3,            // 最小消除数量（3个及以上）
    SCORE_PER_PIECE: 10,     // 每个棋子的基础分数
};

// 棋子类型定义
export const PIECE_TYPES = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange'
];

/**
 * 创建棋子数据
 * @param {number} row - 行位置
 * @param {number} col - 列位置
 * @param {string} type - 棋子类型
 * @returns {object} 棋子对象
 */
export function createPiece(row, col, type) {
    return {
        id: `piece-${row}-${col}`,
        row,
        col,
        type,
        matched: false,
        falling: false,
        appearing: false
    };
}

/**
 * 创建游戏状态对象
 * @returns {object} 游戏状态
 */
export function createGameState() {
    return {
        board: [],
        score: 0,
        moves: GAME_CONFIG.TOTAL_MOVES,
        selectedPiece: null,
        isAnimating: false,
        gameOver: false
    };
}
