export const PLAYER = {
    RED: 'red',
    BLUE: 'blue'
};

export const PIECE_TYPE = {
    FLAG: { id: 0, name: '军旗', rank: -1, canMove: false },
    MINE: { id: 1, name: '地雷', rank: -2, canMove: false },
    BOMB: { id: 2, name: '炸弹', rank: 14, canMove: true },
    SOLDIER: { id: 3, name: '工兵', rank: 1, canMove: true },
    PLATOON: { id: 4, name: '排长', rank: 2, canMove: true },
    COMPANY: { id: 5, name: '连长', rank: 3, canMove: true },
    BATTALION: { id: 6, name: '营长', rank: 4, canMove: true },
    REGIMENT: { id: 7, name: '团长', rank: 5, canMove: true },
    BRIGADE: { id: 8, name: '旅长', rank: 6, canMove: true },
    DIVISION: { id: 9, name: '师长', rank: 7, canMove: true },
    CORPS: { id: 10, name: '军长', rank: 8, canMove: true },
    COMMANDER: { id: 11, name: '司令', rank: 9, canMove: true }
};

export const BOARD_CONFIG = {
    CELL_SIZE: 60,
    COLS: 5,
    ROWS: 12,
    PADDING: 30
};

export const PIECE_CONFIG = {
    [PLAYER.RED]: [
        { type: PIECE_TYPE.FLAG, count: 1 },
        { type: PIECE_TYPE.MINE, count: 3 },
        { type: PIECE_TYPE.BOMB, count: 2 },
        { type: PIECE_TYPE.SOLDIER, count: 3 },
        { type: PIECE_TYPE.PLATOON, count: 3 },
        { type: PIECE_TYPE.COMPANY, count: 3 },
        { type: PIECE_TYPE.BATTALION, count: 2 },
        { type: PIECE_TYPE.REGIMENT, count: 2 },
        { type: PIECE_TYPE.BRIGADE, count: 2 },
        { type: PIECE_TYPE.DIVISION, count: 2 },
        { type: PIECE_TYPE.CORPS, count: 1 },
        { type: PIECE_TYPE.COMMANDER, count: 1 }
    ],
    [PLAYER.BLUE]: [
        { type: PIECE_TYPE.FLAG, count: 1 },
        { type: PIECE_TYPE.MINE, count: 3 },
        { type: PIECE_TYPE.BOMB, count: 2 },
        { type: PIECE_TYPE.SOLDIER, count: 3 },
        { type: PIECE_TYPE.PLATOON, count: 3 },
        { type: PIECE_TYPE.COMPANY, count: 3 },
        { type: PIECE_TYPE.BATTALION, count: 2 },
        { type: PIECE_TYPE.REGIMENT, count: 2 },
        { type: PIECE_TYPE.BRIGADE, count: 2 },
        { type: PIECE_TYPE.DIVISION, count: 2 },
        { type: PIECE_TYPE.CORPS, count: 1 },
        { type: PIECE_TYPE.COMMANDER, count: 1 }
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
    [PLAYER.RED]: [
        { row: 11, col: 1 },
        { row: 11, col: 3 }
    ],
    [PLAYER.BLUE]: [
        { row: 0, col: 1 },
        { row: 0, col: 3 }
    ]
};