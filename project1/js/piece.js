class Piece {
    constructor(type, color, x, y) {
        this.type = type;
        this.color = color;
        this.x = x;
        this.y = y;
        this.isSelected = false;
        this.name = this.getPieceName();
    }

    getPieceName() {
        const names = {
            red: {
                '帅': '帅', '仕': '仕', '相': '相', '马': '马', '车': '车', '炮': '炮', '兵': '兵'
            },
            black: {
                '帅': '将', '仕': '士', '相': '象', '马': '馬', '车': '車', '炮': '砲', '兵': '卒'
            }
        };
        
        let typeChar;
        switch (this.type) {
            case 'king': typeChar = '帅'; break;
            case 'advisor': typeChar = '仕'; break;
            case 'elephant': typeChar = '相'; break;
            case 'horse': typeChar = '马'; break;
            case 'chariot': typeChar = '车'; break;
            case 'cannon': typeChar = '炮'; break;
            case 'soldier': typeChar = '兵'; break;
            default: typeChar = '';
        }
        
        return names[this.color][typeChar] || '';
    }

    clone() {
        return new Piece(this.type, this.color, this.x, this.y);
    }
}
