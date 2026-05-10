import { 
    BOARD_CONFIG, 
    COLORS, 
    CAMPS, 
    HEADQUARTERS, 
    RAILWAY_LINES,
    PLAYER 
} from '../game/constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = BOARD_CONFIG.CELL_SIZE;
    }

    getBoardPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < BOARD_CONFIG.ROWS && col >= 0 && col < BOARD_CONFIG.COLS) {
            return { row, col };
        }
        return null;
    }

    render(game) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBoardBackground();
        this.drawGridLines();
        this.drawRailwayLines();
        this.drawCamps();
        this.drawHeadquarters();
        
        if (game.validMoves && game.validMoves.length > 0) {
            this.drawValidMoves(game.validMoves);
        }
        
        this.drawPieces(game.board, game.currentPlayer);
        
        if (game.selectedPiece) {
            this.drawSelectedPiece(game.selectedPiece);
        }
    }

    drawBoardBackground() {
        this.ctx.fillStyle = COLORS.board.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGridLines() {
        this.ctx.strokeStyle = COLORS.board.line;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= BOARD_CONFIG.ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let j = 0; j <= BOARD_CONFIG.COLS; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.cellSize, 0);
            this.ctx.lineTo(j * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
    }

    drawRailwayLines() {
        this.ctx.strokeStyle = COLORS.board.railway;
        this.ctx.lineWidth = 3;
        
        RAILWAY_LINES.horizontal.forEach(line => {
            const startX = line.cols[0] * this.cellSize + this.cellSize / 2;
            const endX = line.cols[line.cols.length - 1] * this.cellSize + this.cellSize / 2;
            const y = line.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        });
        
        RAILWAY_LINES.vertical.forEach(line => {
            const startY = line.rows[0] * this.cellSize + this.cellSize / 2;
            const endY = line.rows[line.rows.length - 1] * this.cellSize + this.cellSize / 2;
            const x = line.col * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        });
    }

    drawCamps() {
        this.ctx.fillStyle = 'rgba(39, 174, 96, 0.3)';
        this.ctx.strokeStyle = COLORS.board.camp;
        this.ctx.lineWidth = 2;
        
        CAMPS.forEach(camp => {
            const x = camp.col * this.cellSize;
            const y = camp.row * this.cellSize;
            
            this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            
            this.ctx.fillStyle = COLORS.board.camp;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('营', x + this.cellSize / 2, y + this.cellSize / 2 + 4);
            this.ctx.fillStyle = 'rgba(39, 174, 96, 0.3)';
        });
    }

    drawHeadquarters() {
        this.ctx.fillStyle = 'rgba(243, 156, 18, 0.3)';
        this.ctx.strokeStyle = COLORS.board.headquarters;
        this.ctx.lineWidth = 2;
        
        Object.keys(HEADQUARTERS).forEach(player => {
            HEADQUARTERS[player].forEach(hq => {
                const x = hq.col * this.cellSize;
                const y = hq.row * this.cellSize;
                
                this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                
                this.ctx.fillStyle = COLORS.board.headquarters;
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('营', x + this.cellSize / 2, y + this.cellSize / 2 + 4);
                this.ctx.fillStyle = 'rgba(243, 156, 18, 0.3)';
            });
        });
    }

    drawValidMoves(moves) {
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.4)';
        
        moves.forEach(move => {
            const x = move.col * this.cellSize;
            const y = move.row * this.cellSize;
            
            this.ctx.beginPath();
            this.ctx.arc(
                x + this.cellSize / 2,
                y + this.cellSize / 2,
                this.cellSize / 4,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    drawPieces(board, currentPlayer) {
        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
            for (let col = 0; col < BOARD_CONFIG.COLS; col++) {
                const piece = board.getPiece(row, col);
                if (piece) {
                    this.drawPiece(piece, currentPlayer);
                }
            }
        }
    }

    drawPiece(piece, currentPlayer) {
        const x = piece.col * this.cellSize;
        const y = piece.row * this.cellSize;
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const radius = this.cellSize / 2 - 5;
        
        const colors = COLORS[piece.player];
        const isCurrentPlayer = piece.player === currentPlayer;
        const shouldReveal = piece.revealed || isCurrentPlayer;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = colors.background;
        this.ctx.fill();
        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        if (shouldReveal) {
            this.ctx.fillStyle = colors.text;
            this.ctx.font = 'bold 22px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(piece.shortName, centerX, centerY);
        } else {
            this.ctx.fillStyle = colors.primary;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('?', centerX, centerY);
        }
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fill();
    }

    drawSelectedPiece(piece) {
        const x = piece.col * this.cellSize;
        const y = piece.row * this.cellSize;
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const radius = this.cellSize / 2 - 2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = COLORS.board.selected;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }
}
