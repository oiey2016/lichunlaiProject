export class Piece {
    constructor(type, player, row, col) {
        this.id = type.id;
        this.name = type.name;
        this.rank = type.rank;
        this.canMove = type.canMove;
        this.isFlag = type.isFlag;
        this.isMine = type.isMine;
        this.isBomb = type.isBomb;
        this.isCommander = type.isCommander;
        this.isEngineer = type.isEngineer;
        this.player = player;
        this.row = row;
        this.col = col;
        this.revealed = false;
    }
	

    static compare(attacker, defender) {
        if (!attacker || !defender) {
            return null;
        }

        if (attacker.isBomb || defender.isBomb) {
            return 0;
        }

        if (defender.isFlag) {
            return 1;
        }

        if (defender.isMine) {
            if (attacker.isEngineer) {
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

    get shortName() {
        if (this.isFlag) return '旗';
        if (this.isMine) return '雷';
        if (this.isBomb) return '炸';
        if (this.isCommander) return '司';
        if (this.rank === 8) return '军';
        if (this.rank === 7) return '师';
        if (this.rank === 6) return '旅';
        if (this.rank === 5) return '团';
        if (this.rank === 4) return '营';
        if (this.rank === 3) return '连';
        if (this.rank === 2) return '排';
        if (this.isEngineer) return '工';
        return this.name.charAt(0);
    }
}
