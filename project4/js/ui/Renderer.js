import { BOARD_CONFIG, PLAYER, CAMPS, HEADQUARTERS, RAILWAY_LINES } from '../game/constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = BOARD_CONFIG.CELL_SIZE;
        this.padding = BOARD_CONFIG.PADDING;
    }

    render(game) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
        this.drawSpecialAreas();
        this.drawRailways();
        this.drawValidMoves(game);
        this.drawPieces(game);
        this.drawSelection(game);
    }

    drawBoard() {
        const { ROWS, COLS } = BOARD_CONFIG;
        
        this.ctx.fillStyle = '#f5e6d3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 2;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = col * this.cellSize + this.padding;
                const y = row * this.cellSize + this.padding;
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    drawSpecialAreas() {
        this.ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
        CAMPS.forEach(camp => {
            const x = camp.col * this.cellSize + this.padding + 5;
            const y = camp.row * this.cellSize + this.padding + 5;
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize / 2 - 5, y + this.cellSize / 2 - 5, 15, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        Object.values(HEADQUARTERS).forEach(hqPositions => {
            hqPositions.forEach(hq => {
                const x = hq.col * this.cellSize + this.padding + 5;
                const y = hq.row * this.cellSize + this.padding + 5;
                this.ctx.fillRect(x, y, this.cellSize - 10, this.cellSize - 10);
            });
        });
    }

    drawRailways() {
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 4]);

        RAILWAY_LINES.horizontal.forEach(line => {
            const y = line.row * this.cellSize + this.padding + this.cellSize / 2;
            const startX = line.cols[0] * this.cellSize + this.padding + this.cellSize / 2;
            const endX = line.cols[line.cols.length - 1] * this.cellSize + this.padding + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        });

        RAILWAY_LINES.vertical.forEach(line => {
            const x = line.col * this.cellSize + this.padding + this.cellSize / 2;
            const startY = line.rows[0] * this.cellSize + this.padding + this.cellSize / 2;
            const endY = line.rows[line.rows.length - 1] * this.cellSize + this.padding + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        });

        this.ctx.setLineDash([]);
    }

    drawValidMoves(game) {
        if (!game.validMoves || game.validMoves.length === 0) return;

        this.ctx.fillStyle = 'rgba(0, 200, 0, 0.3)';
        this.ctx.strokeStyle = 'rgba(0, 200, 0, 0.8)';
        this.ctx.lineWidth = 2;

        game.validMoves.forEach(move => {
            const x = move.col * this.cellSize + this.padding + 5;
            const y = move.row * this.cellSize + this.padding + 5;
            
            const centerX = x + (this.cellSize - 10) / 2;
            const centerY = y + (this.cellSize - 10) / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    drawPieces(game) {
        const { ROWS, COLS } = BOARD_CONFIG;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = game.board.getPiece(row, col);
                if (piece) {
                    this.drawPiece(piece);
                }
            }
        }
    }

    drawPiece(piece) {
        const x = piece.col * this.cellSize + this.padding + 8;
        const y = piece.row * this.cellSize + this.padding + 8;
        const width = this.cellSize - 16;
        const height = this.cellSize - 16;

        this.ctx.fillStyle = piece.player === PLAYER.RED ? '#e53935' : '#1e88e5';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 8);
        this.ctx.fill();

        this.ctx.strokeStyle = piece.player === PLAYER.RED ? '#b71c1c' : '#0d47a1';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(piece.name, x + width / 2, y + height / 2);
    }

    drawSelection(game) {
        if (!game.selectedPiece) return;

        const piece = game.selectedPiece;
        const x = piece.col * this.cellSize + this.padding + 5;
        const y = piece.row * this.cellSize + this.padding + 5;
        const width = this.cellSize - 10;
        const height = this.cellSize - 10;

        this.ctx.strokeStyle = '#ffeb3b';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 10);
        this.ctx.stroke();

        this.ctx.shadowColor = '#ffeb3b';
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    getBoardPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const col = Math.floor((x - this.padding) / this.cellSize);
        const row = Math.floor((y - this.padding) / this.cellSize);

        if (row >= 0 && row < BOARD_CONFIG.ROWS && col >= 0 && col < BOARD_CONFIG.COLS) {
            return { row, col };
        }

        return null;
    }
}
