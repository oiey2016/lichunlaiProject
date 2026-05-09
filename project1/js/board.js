class Board {
    constructor() {
        this.pieces = [];
        this.cellSize = 60;
        this.margin = 30;
        this.width = 9;
        this.height = 10;
    }

    initialize() {
        this.pieces = InitialPieces.map(p => new Piece(p.type, p.color, p.x, p.y));
    }

    getPiece(x, y) {
        return this.pieces.find(p => p.x === x && p.y === y);
    }

    getPiecesByColor(color) {
        return this.pieces.filter(p => p.color === color);
    }

    removePiece(piece) {
        const index = this.pieces.indexOf(piece);
        if (index !== -1) {
            return this.pieces.splice(index, 1)[0];
        }
        return null;
    }

    addPiece(piece) {
        this.pieces.push(piece);
    }

    movePiece(piece, toX, toY) {
        const targetPiece = this.getPiece(toX, toY);
        if (targetPiece) {
            this.removePiece(targetPiece);
        }
        piece.x = toX;
        piece.y = toY;
        return targetPiece;
    }

    clone() {
        const newBoard = new Board();
        newBoard.pieces = this.pieces.map(p => p.clone());
        return newBoard;
    }

    getKing(color) {
        return this.pieces.find(p => p.type === PieceType.KING && p.color === color);
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    isInPalace(x, y, color) {
        if (x < 3 || x > 5) return false;
        if (color === PieceColor.RED) {
            return y >= 7 && y <= 9;
        } else {
            return y >= 0 && y <= 2;
        }
    }

    hasCrossedRiver(y, color) {
        if (color === PieceColor.RED) {
            return y <= 4;
        } else {
            return y >= 5;
        }
    }

    draw(ctx) {
        this.drawBoard(ctx);
        this.drawPieces(ctx);
    }

    drawBoard(ctx) {
        const boardWidth = (this.width - 1) * this.cellSize;
        const boardHeight = (this.height - 1) * this.cellSize;
        
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, this.margin * 2 + boardWidth, this.margin * 2 + boardHeight);
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < this.width; i++) {
            const x = this.margin + i * this.cellSize;
            ctx.beginPath();
            if (i === 0 || i === this.width - 1) {
                ctx.moveTo(x, this.margin);
                ctx.lineTo(x, this.margin + boardHeight);
            } else {
                ctx.moveTo(x, this.margin);
                ctx.lineTo(x, this.margin + 4 * this.cellSize);
                ctx.moveTo(x, this.margin + 5 * this.cellSize);
                ctx.lineTo(x, this.margin + boardHeight);
            }
            ctx.stroke();
        }
        
        for (let i = 0; i < this.height; i++) {
            const y = this.margin + i * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(this.margin, y);
            ctx.lineTo(this.margin + boardWidth, y);
            ctx.stroke();
        }
        
        this.drawPalace(ctx, 0);
        this.drawPalace(ctx, 7);
        
        this.drawRiver(ctx);
        this.drawMarkers(ctx);
    }

    drawPalace(ctx, topY) {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        
        const startX = this.margin + 3 * this.cellSize;
        const startY = this.margin + topY * this.cellSize;
        const endX = this.margin + 5 * this.cellSize;
        const endY = this.margin + (topY + 2) * this.cellSize;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(endX, startY);
        ctx.lineTo(startX, endY);
        ctx.stroke();
    }

    drawRiver(ctx) {
        const y = this.margin + 4.5 * this.cellSize;
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(this.margin, y - 15, (this.width - 1) * this.cellSize, 30);
        
        ctx.font = 'bold 24px KaiTi, STKaiti, serif';
        ctx.fillStyle = '#8B4513';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText('楚  河', this.margin + 2 * this.cellSize, y);
        ctx.fillText('汉  界', this.margin + 6 * this.cellSize, y);
    }

    drawMarkers(ctx) {
        const markerPositions = [
            [1, 2], [7, 2], [1, 7], [7, 7],
            [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
            [0, 6], [2, 6], [4, 6], [6, 6], [8, 6]
        ];
        
        ctx.fillStyle = '#8B4513';
        markerPositions.forEach(([x, y]) => {
            this.drawMarker(ctx, x, y);
        });
    }

    drawMarker(ctx, x, y) {
        const cx = this.margin + x * this.cellSize;
        const cy = this.margin + y * this.cellSize;
        const size = 6;
        
        if (x > 0) {
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy - 8);
            ctx.lineTo(cx - 12, cy - size);
            ctx.lineTo(cx - 8, cy - 12);
            ctx.lineTo(cx - size, cy - 12);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy + 8);
            ctx.lineTo(cx - 12, cy + size);
            ctx.lineTo(cx - 8, cy + 12);
            ctx.lineTo(cx - size, cy + 12);
            ctx.stroke();
        }
        
        if (x < 8) {
            ctx.beginPath();
            ctx.moveTo(cx + 12, cy - 8);
            ctx.lineTo(cx + 12, cy - size);
            ctx.lineTo(cx + 8, cy - 12);
            ctx.lineTo(cx + size, cy - 12);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(cx + 12, cy + 8);
            ctx.lineTo(cx + 12, cy + size);
            ctx.lineTo(cx + 8, cy + 12);
            ctx.lineTo(cx + size, cy + 12);
            ctx.stroke();
        }
    }

    drawPieces(ctx) {
        this.pieces.forEach(piece => {
            this.drawPiece(ctx, piece);
        });
    }

    drawPiece(ctx, piece) {
        const cx = this.margin + piece.x * this.cellSize;
        const cy = this.margin + piece.y * this.cellSize;
        const radius = 25;
        
        ctx.save();
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const gradient = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, radius);
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.7, '#F5DEB3');
        gradient.addColorStop(1, '#DEB887');
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = piece.color === PieceColor.RED ? '#8B0000' : '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        ctx.font = 'bold 26px KaiTi, STKaiti, serif';
        ctx.fillStyle = piece.color === PieceColor.RED ? '#C41E3A' : '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(piece.getName(), cx, cy);
    }

    highlightPiece(ctx, piece) {
        const cx = this.margin + piece.x * this.cellSize;
        const cy = this.margin + piece.y * this.cellSize;
        const radius = 28;
        
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    highlightMove(ctx, x, y) {
        const cx = this.margin + x * this.cellSize;
        const cy = this.margin + y * this.cellSize;
        const radius = 8;
        
        ctx.save();
        ctx.fillStyle = 'rgba(76, 175, 80, 0.7)';
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    highlightCapture(ctx, x, y) {
        const cx = this.margin + x * this.cellSize;
        const cy = this.margin + y * this.cellSize;
        const radius = 28;
        
        ctx.save();
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FF6B6B';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    screenToBoard(screenX, screenY) {
        const x = Math.round((screenX - this.margin) / this.cellSize);
        const y = Math.round((screenY - this.margin) / this.cellSize);
        return { x, y };
    }

    isClickOnPiece(screenX, screenY) {
        const { x, y } = this.screenToBoard(screenX, screenY);
        const piece = this.getPiece(x, y);
        if (!piece) return null;
        
        const cx = this.margin + x * this.cellSize;
        const cy = this.margin + y * this.cellSize;
        const distance = Math.sqrt((screenX - cx) ** 2 + (screenY - cy) ** 2);
        
        return distance <= 28 ? piece : null;
    }
}
