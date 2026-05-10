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
        this.drawMiddleLine();
        
        if (game.validMoves && game.validMoves.length > 0) {
            this.drawValidMoves(game.validMoves);
        }
        
        this.drawPieces(game.board, game.currentPlayer);
        
        if (game.selectedPiece) {
            this.drawSelectedPiece(game.selectedPiece);
        }
    }

    drawBoardBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#c9a75b');
        gradient.addColorStop(0.5, '#d4b483');
        gradient.addColorStop(1, '#c9a75b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'rgba(139, 90, 43, 0.1)';
        for (let i = 0; i < this.canvas.height; i += 10) {
            this.ctx.fillRect(0, i, this.canvas.width, 2);
        }
    }

    drawGridLines() {
        this.ctx.strokeStyle = '#8b5a2b';
        this.ctx.lineWidth = 2;
        
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
        
        for (let i = 0; i < BOARD_CONFIG.ROWS; i++) {
            for (let j = 0; j < BOARD_CONFIG.COLS; j++) {
                const x = j * this.cellSize;
                const y = i * this.cellSize;
                
                this.ctx.fillStyle = 'rgba(139, 90, 43, 0.05)';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    drawRailwayLines() {
        this.drawRailwayHorizontal();
        this.drawRailwayVertical();
        this.drawRailwayJunctions();
    }

    drawRailwayHorizontal() {
        RAILWAY_LINES.horizontal.forEach(line => {
            const y = line.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.strokeStyle = '#5c4033';
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#8b7355';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#a08060';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y - 2);
            this.ctx.lineTo(this.canvas.width, y - 2);
            this.ctx.moveTo(0, y + 2);
            this.ctx.lineTo(this.canvas.width, y + 2);
            this.ctx.stroke();
            
            for (let x = 0; x <= this.canvas.width; x += 30) {
                this.ctx.fillStyle = '#5c4033';
                this.ctx.fillRect(x - 8, y - 4, 16, 8);
            }
        });
    }

    drawRailwayVertical() {
        RAILWAY_LINES.vertical.forEach(line => {
            const x = line.col * this.cellSize + this.cellSize / 2;
            const startY = line.rows[0] * this.cellSize + this.cellSize / 2;
            const endY = line.rows[line.rows.length - 1] * this.cellSize + this.cellSize / 2;
            
            this.ctx.strokeStyle = '#5c4033';
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#8b7355';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#a08060';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 2, startY);
            this.ctx.lineTo(x - 2, endY);
            this.ctx.moveTo(x + 2, startY);
            this.ctx.lineTo(x + 2, endY);
            this.ctx.stroke();
            
            for (let y = startY; y <= endY; y += 30) {
                this.ctx.fillStyle = '#5c4033';
                this.ctx.fillRect(x - 4, y - 8, 8, 16);
            }
        });
    }

    drawRailwayJunctions() {
        const junctions = [
            { row: 1, col: 0 }, { row: 1, col: 4 },
            { row: 5, col: 0 }, { row: 5, col: 4 },
            { row: 6, col: 0 }, { row: 6, col: 4 },
            { row: 10, col: 0 }, { row: 10, col: 4 }
        ];
        
        junctions.forEach(junction => {
            const x = junction.col * this.cellSize + this.cellSize / 2;
            const y = junction.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.fillStyle = '#4a3728';
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = '#8b7355';
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#a08060';
            this.ctx.fill();
        });
    }

    drawCamps() {
        CAMPS.forEach(camp => {
            const x = camp.col * this.cellSize + this.cellSize / 2;
            const y = camp.row * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 2 - 8;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, '#90EE90');
            gradient.addColorStop(0.7, '#228B22');
            gradient.addColorStop(1, '#006400');
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#004d00';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius - 6, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText('营', x, y);
            this.ctx.shadowBlur = 0;
        });
    }

    drawHeadquarters() {
        Object.keys(HEADQUARTERS).forEach(player => {
            HEADQUARTERS[player].forEach(hq => {
                const x = hq.col * this.cellSize + this.cellSize / 2;
                const y = hq.row * this.cellSize + this.cellSize / 2;
                const radius = this.cellSize / 2 - 8;
                
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.5, '#FFA500');
                gradient.addColorStop(1, '#DAA520');
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - radius);
                this.ctx.lineTo(x + radius * 0.866, y - radius * 0.5);
                this.ctx.lineTo(x + radius * 0.866, y + radius * 0.5);
                this.ctx.lineTo(x, y + radius);
                this.ctx.lineTo(x - radius * 0.866, y + radius * 0.5);
                this.ctx.lineTo(x - radius * 0.866, y - radius * 0.5);
                this.ctx.closePath();
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#8B4513';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#8B0000';
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                this.ctx.shadowBlur = 2;
                this.ctx.fillText('帅', x, y);
                this.ctx.shadowBlur = 0;
            });
        });
    }

    drawMiddleLine() {
        const midRow = BOARD_CONFIG.ROWS / 2;
        const y = midRow * this.cellSize - 2;
        
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        const centerX = this.canvas.width / 2;
        const centerY = y;
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 15, centerY - 2);
        this.ctx.lineTo(centerX + 15, centerY - 2);
        this.ctx.lineTo(centerX, centerY - 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 15, centerY + 2);
        this.ctx.lineTo(centerX + 15, centerY + 2);
        this.ctx.lineTo(centerX, centerY + 15);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawValidMoves(moves) {
        moves.forEach(move => {
            const x = move.col * this.cellSize + this.cellSize / 2;
            const y = move.row * this.cellSize + this.cellSize / 2;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 15);
            gradient.addColorStop(0, 'rgba(46, 204, 113, 0.8)');
            gradient.addColorStop(1, 'rgba(46, 204, 113, 0.2)');
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
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
        const x = piece.col * this.cellSize + this.cellSize / 2;
        const y = piece.row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - 6;
        
        const colors = COLORS[piece.player];
        const isCurrentPlayer = piece.player === currentPlayer;
        const shouldReveal = piece.revealed || isCurrentPlayer;
        
        this.ctx.save();
        
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, radius);
        gradient.addColorStop(0, colors.background);
        gradient.addColorStop(1, colors.secondary);
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        if (shouldReveal) {
            this.ctx.fillStyle = colors.text;
            this.ctx.font = 'bold 24px "Microsoft YaHei", "SimHei", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(piece.shortName, x, y);
            
            if (piece.isFlag || piece.isMine || piece.isBomb) {
                this.ctx.font = '10px Arial';
                const subText = piece.isFlag ? '旗' : piece.isMine ? '雷' : '弹';
                this.ctx.fillText(subText, x, y + radius - 8);
            }
        } else {
            this.ctx.fillStyle = colors.primary;
            this.ctx.font = 'bold 22px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('?', x, y);
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawSelectedPiece(piece) {
        const x = piece.col * this.cellSize + this.cellSize / 2;
        const y = piece.row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - 3;
        
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(241, 196, 15, 0.5)';
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = COLORS.board.selected;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
}
