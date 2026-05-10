export class Piece {
    constructor(type, player, row, col) {
        this.type = type;
        this.player = player;
        this.row = row;
        this.col = col;
        this.revealed = false;
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
        return this.type.isFlag;
    }

    get isMine() {
        return this.type.isMine;
    }

    get isBomb() {
        return this.type.isBomb;
    }

    get isCommander() {
        return this.type.isCommander;
    }

    static compare(attacker, defender) {
        if (!defender) return 1;

        if (attacker.isBomb || defender.isBomb) {
            return 0;
        }

        if (defender.isFlag) {
            return 1;
        }

        if (defender.isMine) {
            if (attacker.type.id === 11) {
                return 1;
            }
            return 0;
        }

        if (attacker.rank > defender.rank) {
            return 1;
        } else if (attacker.rank < defender.rank) {
            return -1;
        } else {
            return 0;
        }
    }
}
