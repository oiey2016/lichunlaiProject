export class Piece {
    constructor(type, player, row, col) {
        this.type = type;
        this.player = player;
        this.row = row;
        this.col = col;
        this.id = `${player}-${type.id}-${Date.now()}-${Math.random()}`;
    }

    get name() {
        return this.type.name;
    }

    get rank() {
        return this.type.rank;
    }

    get canMove() {
        return this.type.canMove;
    }

    get isFlag() {
        return this.type.id === 0;
    }

    get isMine() {
        return this.type.id === 1;
    }

    get isBomb() {
        return this.type.id === 2;
    }

    get isSoldier() {
        return this.type.id === 3;
    }

    get isCommander() {
        return this.type.id === 11;
    }

    clone() {
        return new Piece(this.type, this.player, this.row, this.col);
    }

    static compare(piece1, piece2) {
        if (piece1.isFlag || piece2.isFlag) {
            return piece1.isFlag ? -1 : 1;
        }

        if (piece1.isBomb || piece2.isBomb) {
            return 0;
        }

        if (piece1.isMine || piece2.isMine) {
            if (piece1.isSoldier && piece2.isMine) {
                return 1;
            }
            if (piece2.isSoldier && piece1.isMine) {
                return -1;
            }
            return 0;
        }

        if (piece1.rank > piece2.rank) {
            return 1;
        } else if (piece1.rank < piece2.rank) {
            return -1;
        } else {
            return 0;
        }
    }
}