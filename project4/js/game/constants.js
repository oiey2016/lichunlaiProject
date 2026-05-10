export const PLAYER = {
    RED: 'red',
    BLUE: 'blue'
};

export const BOARD_CONFIG = {
    ROWS: 12,
    COLS: 5,
    CELL_SIZE: 60,
    PADDING: 30
};

export const PIECE_TYPES = {
    FLAG: { id: 0, name: '军旗', rank: -1, canMove: false, isFlag: true, isMine: false, isBomb: false, isCommander: false },
    MINE: { id: 1, name: '地雷', rank: -2, canMove: false, isFlag: false, isMine: true, isBomb: false, isCommander: false },
    BOMB: { id: 2, name: '炸弹', rank: -3, canMove: true, isFlag: false, isMine: false, isBomb: true, isCommander: false },
    COMMANDER: { id: 3, name: '司令', rank: 9, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: true },
    GENERAL: { id: 4, name: '军长', rank: 8, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    DIVISION: { id: 5, name: '师长', rank: 7, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    BRIGADE: { id: 6, name: '旅长', rank: 6, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    REGIMENT: { id: 7, name: '团长', rank: 5, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    BATTALION: { id: 8, name: '营长', rank: 4, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    COMPANY: { id: 9, name: '连长', rank: 3, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    PLATOON: { id: 10, name: '排长', rank: 2, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false },
    ENGINEER: { id: 11, name: '工兵', rank: 1, canMove: true, isFlag: false, isMine: false, isBomb: false, isCommander: false }
};

export const PIECE_CONFIG = {
    [PLAYER.RED]: [
        { type: PIECE_TYPES.FLAG, count: 1 },
        { type: PIECE_TYPES.MINE, count: 3 },
        { type: PIECE_TYPES.BOMB, count: 2 },
        { type: PIECE_TYPES.COMMANDER, count: 1 },
        { type: PIECE_TYPES.GENERAL, count: 1 },
        { type: PIECE_TYPES.DIVISION, count: 2 },
        { type: PIECE_TYPES.BRIGADE, count: 2 },
        { type: PIECE_TYPES.REGIMENT, count: 2 },
        { type: PIECE_TYPES.BATTALION, count: 2 },
        { type: PIECE_TYPES.COMPANY, count: 3 },
        { type: PIECE_TYPES.PLATOON, count: 3 },
        { type: PIECE_TYPES.ENGINEER, count: 3 }
    ],
	
    [PLAYER.BLUE]: [
        { type: PIECE_TYPES.FLAG, count: 1 },
        { type: PIECE_TYPES.MINE, count: 3 },
        { type: PIECE_TYPES.BOMB, count: 2 },
        { type: PIECE_TYPES.COMMANDER, count: 1 },
        { type: PIECE_TYPES.GENERAL, count: 1 },
        { type: PIECE_TYPES.DIVISION, count: 2 },
        { type: PIECE_TYPES.BRIGADE, count: 2 },
        { type: PIECE_TYPES.REGIMENT, count: 2 },
        { type: PIECE_TYPES.BATTALION, count: 2 },
        { type: PIECE_TYPES.COMPANY, count: 3 },
        { type: PIECE_TYPES.PLATOON, count: 3 },
        { type: PIECE_TYPES.ENGINEER, count: 3 }
    ]
};

export const RAILWAY_LINES = {
    horizontal: [
        { row: 1, cols: [0, 1, 2, 3, 4] },
        { row: 5, cols: [0, 1, 2, 3, 4] },
        { row: 6, cols: [0, 1, 2, 3, 4] },
        { row: 10, cols: [0, 1, 2, 3, 4] }
    ],
    vertical: [
        { col: 0, rows: [1, 2, 3, 4, 5] },
        { col: 0, rows: [6, 7, 8, 9, 10] },
        { col: 4, rows: [1, 2, 3, 4, 5] },
        { col: 4, rows: [6, 7, 8, 9, 10] }
    ]
};

export const CAMPS = [
    { row: 2, col: 1 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
    { row: 4, col: 1 },
    { row: 4, col: 3 },
    { row: 7, col: 1 },
    { row: 7, col: 3 },
    { row: 8, col: 2 },
    { row: 9, col: 1 },
    { row: 9, col: 3 }
];

export const HEADQUARTERS = {
    [PLAYER.BLUE]: [
        { row: 0, col: 1 },
        { row: 0, col: 3 }
    ],
    [PLAYER.RED]: [
        { row: 11, col: 1 },
        { row: 11, col: 3 }
    ]
};
