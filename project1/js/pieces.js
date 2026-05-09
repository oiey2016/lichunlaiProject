const PieceType = {
    KING: 'king',
    ADVISOR: 'advisor',
    ELEPHANT: 'elephant',
    HORSE: 'horse',
    CHARIOT: 'chariot',
    CANNON: 'cannon',
    PAWN: 'pawn'
};

const PieceColor = {
    RED: 'red',
    BLACK: 'black'
};

const PieceNames = {
    [PieceColor.RED]: {
        [PieceType.KING]: '帅',
        [PieceType.ADVISOR]: '仕',
        [PieceType.ELEPHANT]: '相',
        [PieceType.HORSE]: '马',
        [PieceType.CHARIOT]: '车',
        [PieceType.CANNON]: '炮',
        [PieceType.PAWN]: '兵'
    },
    [PieceColor.BLACK]: {
        [PieceType.KING]: '将',
        [PieceType.ADVISOR]: '士',
        [PieceType.ELEPHANT]: '象',
        [PieceType.HORSE]: '马',
        [PieceType.CHARIOT]: '车',
        [PieceType.CANNON]: '炮',
        [PieceType.PAWN]: '卒'
    }
};

class Piece {
    constructor(type, color, x, y) {
        this.type = type;
        this.color = color;
        this.x = x;
        this.y = y;
        this.id = `${color}-${type}-${x}-${y}-${Date.now()}`;
    }

    getName() {
        return PieceNames[this.color][this.type];
    }

    clone() {
        return new Piece(this.type, this.color, this.x, this.y);
    }
}

const InitialPieces = [
    { type: PieceType.CHARIOT, color: PieceColor.RED, x: 0, y: 9 },
    { type: PieceType.HORSE, color: PieceColor.RED, x: 1, y: 9 },
    { type: PieceType.ELEPHANT, color: PieceColor.RED, x: 2, y: 9 },
    { type: PieceType.ADVISOR, color: PieceColor.RED, x: 3, y: 9 },
    { type: PieceType.KING, color: PieceColor.RED, x: 4, y: 9 },
    { type: PieceType.ADVISOR, color: PieceColor.RED, x: 5, y: 9 },
    { type: PieceType.ELEPHANT, color: PieceColor.RED, x: 6, y: 9 },
    { type: PieceType.HORSE, color: PieceColor.RED, x: 7, y: 9 },
    { type: PieceType.CHARIOT, color: PieceColor.RED, x: 8, y: 9 },
    { type: PieceType.CANNON, color: PieceColor.RED, x: 1, y: 7 },
    { type: PieceType.CANNON, color: PieceColor.RED, x: 7, y: 7 },
    { type: PieceType.PAWN, color: PieceColor.RED, x: 0, y: 6 },
    { type: PieceType.PAWN, color: PieceColor.RED, x: 2, y: 6 },
    { type: PieceType.PAWN, color: PieceColor.RED, x: 4, y: 6 },
    { type: PieceType.PAWN, color: PieceColor.RED, x: 6, y: 6 },
    { type: PieceType.PAWN, color: PieceColor.RED, x: 8, y: 6 },
    
    { type: PieceType.CHARIOT, color: PieceColor.BLACK, x: 0, y: 0 },
    { type: PieceType.HORSE, color: PieceColor.BLACK, x: 1, y: 0 },
    { type: PieceType.ELEPHANT, color: PieceColor.BLACK, x: 2, y: 0 },
    { type: PieceType.ADVISOR, color: PieceColor.BLACK, x: 3, y: 0 },
    { type: PieceType.KING, color: PieceColor.BLACK, x: 4, y: 0 },
    { type: PieceType.ADVISOR, color: PieceColor.BLACK, x: 5, y: 0 },
    { type: PieceType.ELEPHANT, color: PieceColor.BLACK, x: 6, y: 0 },
    { type: PieceType.HORSE, color: PieceColor.BLACK, x: 7, y: 0 },
    { type: PieceType.CHARIOT, color: PieceColor.BLACK, x: 8, y: 0 },
    { type: PieceType.CANNON, color: PieceColor.BLACK, x: 1, y: 2 },
    { type: PieceType.CANNON, color: PieceColor.BLACK, x: 7, y: 2 },
    { type: PieceType.PAWN, color: PieceColor.BLACK, x: 0, y: 3 },
    { type: PieceType.PAWN, color: PieceColor.BLACK, x: 2, y: 3 },
    { type: PieceType.PAWN, color: PieceColor.BLACK, x: 4, y: 3 },
    { type: PieceType.PAWN, color: PieceColor.BLACK, x: 6, y: 3 },
    { type: PieceType.PAWN, color: PieceColor.BLACK, x: 8, y: 3 }
];
