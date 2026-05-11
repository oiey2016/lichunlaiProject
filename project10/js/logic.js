/**
 * 游戏逻辑模块 - 包含核心游戏规则
 * 
 * 【游戏规则说明】
 * 
 * 一、交换判定规则：
 * 1. 玩家点击一个棋子选中它，再点击另一个棋子进行交换
 * 2. 两个棋子必须是相邻的（上下左右四个方向之一）
 * 3. 交换后必须能形成至少一个可消除的组合（3个或以上相同棋子）
 * 4. 如果交换后无法形成消除组合，则交换无效，棋子恢复原位
 * 5. 只有当游戏不处于动画状态时才能进行交换
 * 
 * 二、消除判定规则：
 * 1. 水平消除：在同一行中连续3个或以上相同类型的棋子
 * 2. 垂直消除：在同一列中连续3个或以上相同类型的棋子
 * 3. 十字形、T形、L形等特殊形状的消除会同时消除所有相关棋子
 * 4. 消除时计算所有满足条件的棋子，无论属于哪个方向的组合
 * 5. 消除的棋子会触发分数计算（基础分：每个棋子10分）
 * 
 * 三、下落判定规则：
 * 1. 消除完成后，所有棋子从上到下检查
 * 2. 如果某个位置是空的（棋子已消除），上方的棋子会依次下落填补空位
 * 3. 下落方向：垂直向下（从高行号向低行号方向）
 * 4. 棋子下落时更新其行列坐标
 * 5. 多个空洞会导致上方多个棋子依次下落
 * 
 * 四、补新棋子判定规则：
 * 1. 下落完成后，检查每列的顶部空位
 * 2. 每列顶部有几个空位，就生成几个新的随机棋子
 * 3. 新棋子的类型从可用类型中随机选择
 * 4. 新棋子从顶部进入棋盘，具有出现动画效果
 * 5. 补新棋子后，需要再次检查是否有新的可消除组合（连锁反应）
 */

import { GAME_CONFIG, PIECE_TYPES, createPiece } from './data.js';

/**
 * 初始化棋盘
 * 生成随机棋子，但确保初始状态没有可消除的组合
 */
export function initializeBoard() {
    const board = [];
    
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
            let type;
            do {
                type = getRandomPieceType();
            } while (wouldCreateMatch(board, row, col, type));
            
            board[row][col] = createPiece(row, col, type);
        }
    }
    
    return board;
}

/**
 * 获取随机棋子类型
 */
function getRandomPieceType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

/**
 * 检查在某个位置放置某种类型的棋子是否会立即形成可消除组合
 * 用于初始化棋盘时避免初始状态就有可消除的组合
 */
function wouldCreateMatch(board, row, col, type) {
    // 检查水平方向（左侧2个位置）
    let horizontalCount = 1;
    if (col >= 2 && 
        board[row][col - 1]?.type === type && 
        board[row][col - 2]?.type === type) {
        return true;
    }
    
    // 检查垂直方向（上方2个位置）
    if (row >= 2 && 
        board[row - 1]?.[col]?.type === type && 
        board[row - 2]?.[col]?.type === type) {
        return true;
    }
    
    return false;
}

/**
 * 检查两个棋子是否可以交换
 * 判定规则：
 * 1. 两个棋子必须是相邻的（上下左右四个方向之一）
 * 2. 交换后必须能形成可消除的组合
 */
export function canSwap(board, piece1, piece2) {
    // 检查是否相邻
    if (!isAdjacent(piece1, piece2)) {
        return false;
    }
    
    // 模拟交换并检查是否会形成消除
    swapPieces(board, piece1, piece2);
    const hasMatch = findAllMatches(board).length > 0;
    swapPieces(board, piece1, piece2); // 换回来
    
    return hasMatch;
}

/**
 * 检查两个棋子是否相邻
 * 只允许上下左右四个方向的交换
 */
function isAdjacent(piece1, piece2) {
    const rowDiff = Math.abs(piece1.row - piece2.row);
    const colDiff = Math.abs(piece1.col - piece2.col);
    
    // 上下左右相邻：行差为1且列相同，或列差为1且行相同
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * 交换两个棋子在棋盘上的位置
 */
export function swapPieces(board, piece1, piece2) {
    const tempRow = piece1.row;
    const tempCol = piece1.col;
    
    // 更新棋盘数组
    board[piece1.row][piece1.col] = piece2;
    board[piece2.row][piece2.col] = piece1;
    
    // 更新棋子对象的坐标
    const piece1Row = piece1.row;
    const piece1Col = piece1.col;
    piece1.row = piece2.row;
    piece1.col = piece2.col;
    piece2.row = tempRow;
    piece2.col = tempCol;
}

/**
 * 查找所有可消除的棋子
 * 判定规则：
 * - 水平方向：连续3个或以上相同类型
 * - 垂直方向：连续3个或以上相同类型
 */
export function findAllMatches(board) {
    const matchedPieces = new Set();
    
    // 检查水平方向的匹配
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
        let matchStart = 0;
        let currentType = board[row][0]?.type;
        
        for (let col = 1; col <= GAME_CONFIG.BOARD_SIZE; col++) {
            const piece = board[row][col];
            const type = piece?.type;
            
            if (type !== currentType || col === GAME_CONFIG.BOARD_SIZE) {
                const matchLength = col - matchStart;
                if (matchLength >= GAME_CONFIG.MIN_MATCH) {
                    for (let i = matchStart; i < col; i++) {
                        if (board[row][i]) {
                            matchedPieces.add(board[row][i]);
                        }
                    }
                }
                matchStart = col;
                currentType = type;
            }
        }
    }
    
    // 检查垂直方向的匹配
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        let matchStart = 0;
        let currentType = board[0]?.[col]?.type;
        
        for (let row = 1; row <= GAME_CONFIG.BOARD_SIZE; row++) {
            const piece = board[row]?.[col];
            const type = piece?.type;
            
            if (type !== currentType || row === GAME_CONFIG.BOARD_SIZE) {
                const matchLength = row - matchStart;
                if (matchLength >= GAME_CONFIG.MIN_MATCH) {
                    for (let i = matchStart; i < row; i++) {
                        if (board[i]?.[col]) {
                            matchedPieces.add(board[i][col]);
                        }
                    }
                }
                matchStart = row;
                currentType = type;
            }
        }
    }
    
    return Array.from(matchedPieces);
}

/**
 * 移除匹配的棋子
 */
export function removeMatches(board, matchedPieces) {
    matchedPieces.forEach(piece => {
        board[piece.row][piece.col] = null;
    });
    
    // 计算分数
    return matchedPieces.length * GAME_CONFIG.SCORE_PER_PIECE;
}

/**
 * 处理棋子下落
 * 判定规则：
 * 1. 从底部向上检查每一列
 * 2. 如果某个位置为空，将上方的棋子依次下落
 * 3. 下落方向：从高行号向低行号（即向下）
 */
export function handlePiecesFall(board) {
    const fallenPieces = [];
    
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        let emptyRow = GAME_CONFIG.BOARD_SIZE - 1;
        
        // 从底部向上扫描
        for (let row = GAME_CONFIG.BOARD_SIZE - 1; row >= 0; row--) {
            if (board[row][col] !== null) {
                if (row !== emptyRow) {
                    // 移动棋子到空位
                    const piece = board[row][col];
                    piece.row = emptyRow;
                    piece.falling = true;
                    board[emptyRow][col] = piece;
                    board[row][col] = null;
                    fallenPieces.push(piece);
                }
                emptyRow--;
            }
        }
    }
    
    return fallenPieces;
}

/**
 * 补充新棋子
 * 判定规则：
 * 1. 检查每列的顶部空位
 * 2. 为每个空位生成新的随机棋子
 * 3. 新棋子从顶部进入
 */
export function fillEmptySpaces(board) {
    const newPieces = [];
    
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
            if (board[row][col] === null) {
                const type = getRandomPieceType();
                const piece = createPiece(row, col, type);
                piece.appearing = true;
                board[row][col] = piece;
                newPieces.push(piece);
            }
        }
    }
    
    return newPieces;
}

/**
 * 检查游戏是否结束
 * 判定规则：步数用完
 */
export function isGameOver(gameState) {
    return gameState.moves <= 0;
}

/**
 * 检查是否还有可能的移动
 * 用于提前结束游戏（可选功能）
 */
export function hasValidMoves(board) {
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
        for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
            const currentPiece = board[row][col];
            
            // 检查与右边的棋子交换
            if (col < GAME_CONFIG.BOARD_SIZE - 1) {
                const rightPiece = board[row][col + 1];
                if (canSwap(board, currentPiece, rightPiece)) {
                    return true;
                }
            }
            
            // 检查与下边的棋子交换
            if (row < GAME_CONFIG.BOARD_SIZE - 1) {
                const bottomPiece = board[row + 1][col];
                if (canSwap(board, currentPiece, bottomPiece)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}
