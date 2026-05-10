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
        
        this.drawBackground();
        this.drawGrid();
        this.drawCamps();
        this.drawHeadquarters();
        this.drawRailways();
        this.drawValidMoves(game.validMoves);
        this.drawPieces(game.board.grid);
        this.drawSelectedPiece(game.selectedPiece, game.board.grid);
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#DEB887');
        gradient.addColorStop(0.5, '#D2B48C');
        gradient.addColorStop(1, '#BC8F8F');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;

        for (let row = 0; row <= BOARD_CONFIG.ROWS; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + row * this.cellSize);
            this.ctx.lineTo(this.padding + BOARD_CONFIG.COLS * this.cellSize, this.padding + row * this.cellSize);
            this.ctx.stroke();
        }

        for (let col = 0; col <= BOARD_CONFIG.COLS; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + col * this.cellSize, this.padding);
            this.ctx.lineTo(this.padding + col * this.cellSize, this.padding + BOARD_CONFIG.ROWS * this.cellSize);
            this.ctx.stroke();
        }

        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = 1;
        
        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
            for (let col = 0; col < BOARD_CONFIG.COLS; col++) {
                const centerX = this.padding + col * this.cellSize + this.cellSize / 2;
                const centerY = this.padding + row * this.cellSize + this.cellSize / 2;
                
                if (this.isIntersection(row, col)) {
                    this.drawCross(centerX, centerY);
                }
            }
        }
    }

    isIntersection(row, col) {
        return (row >= 1 && row <= 4) || (row >= 7 && row <= 10);
    }

    drawCross(x, y) {
        const size = 8;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fill();
    }

    drawCamps() {
        CAMPS.forEach(camp => {
            const x = this.padding + camp.col * this.cellSize + this.cellSize / 2;
            const y = this.padding + camp.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            
            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                const px = 25 * Math.cos(angle);
                const py = 25 * Math.sin(angle);
                if (i === 0) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            }
            this.ctx.closePath();
            
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            this.ctx.fill();
            this.ctx.strokeStyle = '#DAA520';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }

    drawHeadquarters() {
        Object.entries(HEADQUARTERS).forEach(([player, hqs]) => {
            const color = player === PLAYER.RED ? 'rgba(255, 0, 0, 0.15)' : 'rgba(0, 0, 255, 0.15)';
            const borderColor = player === PLAYER.RED ? '#CC0000' : '#0000CC';
            
            hqs.forEach(hq => {
                const x = this.padding + hq.col * this.cellSize;
                const y = this.padding + hq.row * this.cellSize;
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                
                this.ctx.strokeStyle = borderColor;
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                this.ctx.setLineDash([]);
            });
        });
    }

    drawRailways() {
        this.ctx.strokeStyle = '#4a4a4a';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([8, 4]);

        RAILWAY_LINES.horizontal.forEach(line => {
            const y = this.padding + line.row * this.cellSize + this.cellSize / 2;
            const startX = this.padding + line.cols[0] * this.cellSize + this.cellSize / 2;
            const endX = this.padding + line.cols[line.cols.length - 1] * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        });

        RAILWAY_LINES.vertical.forEach(line => {
            const x = this.padding + line.col * this.cellSize + this.cellSize / 2;
            const startY = this.padding + line.rows[0] * this.cellSize + this.cellSize / 2;
            const endY = this.padding + line.rows[line.rows.length - 1] * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        });

        this.ctx.setLineDash([]);
    }

    drawValidMoves(moves) {
        moves.forEach(move => {
            const x = this.padding + move.col * this.cellSize;
            const y = this.padding + move.row * this.cellSize;
            
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.ctx.fillRect(x + 5, y + 5, this.cellSize - 10, this.cellSize - 10);
            
            this.ctx.strokeStyle = '#00CC00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x + 5, y + 5, this.cellSize - 10, this.cellSize - 10);
        });
    }

    drawPieces(grid) {
        for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
            for (let col = 0; col < BOARD_CONFIG.COLS; col++) {
                const piece = grid[row][col];
                if (piece) {
                    this.drawPiece(piece, row, col);
                }
            }
        }
    }

    drawPiece(piece, row, col) {
        const x = this.padding + col * this.cellSize + this.cellSize / 2;
        const y = this.padding + row * this.cellSize + this.cellSize / 2;
        const radius = 24;

        const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
        if (piece.player === PLAYER.RED) {
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(1, '#CC0000');
        } else {
            gradient.addColorStop(0, '#6B9BFF');
            gradient.addColorStop(1, '#0000CC');
        }

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.ctx.strokeStyle = piece.player === PLAYER.RED ? '#8B0000' : '#000080';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Microsoft YaHei';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(piece.name, x, y);

        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 8, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
    }

    drawSelectedPiece(selected, grid) {
        if (!selected) return;

        const piece = grid[selected.row][selected.col];
        if (!piece) return;

        const x = this.padding + selected.col * this.cellSize + this.cellSize / 2;
        const y = this.padding + selected.row * this.cellSize + this.cellSize / 2;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 28, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 24, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    getBoardPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left - this.padding;
        const y = clientY - rect.top - this.padding;

        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col < 0 || col >= BOARD_CONFIG.COLS || row < 0 || row >= BOARD_CONFIG.ROWS) {
            return null;
        }

        return { row, col };
    }
}