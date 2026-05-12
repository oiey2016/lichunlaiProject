import { CONFIG } from './config.js';

export class Renderer {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundOffset = 0;
        
        const centerX = canvasWidth / 2;
        this.lanePositions = [
            centerX - CONFIG.LANE_WIDTH,
            centerX,
            centerX + CONFIG.LANE_WIDTH
        ];
    }
    
    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvasWidth;
            const y = (i * 37) % (this.canvasHeight - 200);
            const size = 1 + (i % 3);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = '#2d3436';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvasHeight - 250);
        this.ctx.lineTo(100, this.canvasHeight - 350);
        this.ctx.lineTo(200, this.canvasHeight - 280);
        this.ctx.lineTo(350, this.canvasHeight - 380);
        this.ctx.lineTo(500, this.canvasHeight - 320);
        this.ctx.lineTo(650, this.canvasHeight - 360);
        this.ctx.lineTo(800, this.canvasHeight - 290);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - 330);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - 200);
        this.ctx.lineTo(0, this.canvasHeight - 200);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawGround(speed) {
        this.groundOffset = (this.groundOffset + speed) % 40;
        
        const groundY = this.canvasHeight - 100;
        this.ctx.fillStyle = CONFIG.COLORS.GROUND;
        this.ctx.fillRect(0, groundY, this.canvasWidth, 100);
        
        const totalWidth = CONFIG.LANE_WIDTH * 3 + 100;
        const startX = (this.canvasWidth - totalWidth) / 2;
        
        for (let i = 0; i < 3; i++) {
            const laneX = startX + 50 + i * CONFIG.LANE_WIDTH;
            this.ctx.fillStyle = CONFIG.COLORS.LANE;
            this.ctx.fillRect(laneX, groundY, CONFIG.LANE_WIDTH, 100);
            
            this.ctx.strokeStyle = CONFIG.COLORS.LANE_LINE;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([20, 20]);
            this.ctx.lineDashOffset = -this.groundOffset;
            this.ctx.beginPath();
            this.ctx.moveTo(laneX + CONFIG.LANE_WIDTH / 2, groundY);
            this.ctx.lineTo(laneX + CONFIG.LANE_WIDTH / 2, this.canvasHeight);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        this.ctx.fillStyle = CONFIG.COLORS.LANE_LINE;
        this.ctx.fillRect(startX + 40, groundY, 5, 100);
        this.ctx.fillRect(startX + totalWidth - 45, groundY, 5, 100);
        
        for (let i = 0; i < 10; i++) {
            const y = groundY + 10 + i * 10 + this.groundOffset;
            if (y < this.canvasHeight) {
                this.ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
                this.ctx.fillRect(startX + 50, y, totalWidth - 100, 2);
            }
        }
    }
    
    render(speed) {
        this.clear();
        this.drawBackground();
        this.drawGround(speed);
    }
}