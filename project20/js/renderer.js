import { CONFIG } from './config.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.animationFrame = 0;
    }

    render(game) {
        this.animationFrame++;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!game.mazeData) return;
        
        this.drawMaze(game.mazeData.maze);
        this.drawExit(game.mazeData.exit);
        this.drawBeans(game.mazeData.beans);
        this.drawObstacles(game.mazeData.obstacles);
        this.drawPlayer(game.player);
    }

    drawMaze(maze) {
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                const cellX = x * CONFIG.CELL_SIZE;
                const cellY = y * CONFIG.CELL_SIZE;
                
                if (maze[y][x] === 1) {
                    this.ctx.fillStyle = CONFIG.COLORS.WALL;
                    this.ctx.fillRect(cellX, cellY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                    
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(cellX, cellY, CONFIG.CELL_SIZE, 2);
                    this.ctx.fillRect(cellX, cellY, 2, CONFIG.CELL_SIZE);
                    
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.fillRect(cellX, cellY + CONFIG.CELL_SIZE - 2, CONFIG.CELL_SIZE, 2);
                    this.ctx.fillRect(cellX + CONFIG.CELL_SIZE - 2, cellY, 2, CONFIG.CELL_SIZE);
                } else {
                    this.ctx.fillStyle = CONFIG.COLORS.PATH;
                    this.ctx.fillRect(cellX, cellY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                    
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                    this.ctx.fillRect(cellX + 2, cellY + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
                }
            }
        }
    }

    drawExit(exit) {
        const x = exit.x * CONFIG.CELL_SIZE;
        const y = exit.y * CONFIG.CELL_SIZE;
        const size = CONFIG.CELL_SIZE;
        
        const gradient = this.ctx.createRadialGradient(
            x + size / 2, y + size / 2, 0,
            x + size / 2, y + size / 2, size
        );
        gradient.addColorStop(0, 'rgba(0, 184, 148, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 184, 148, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
        
        this.ctx.fillStyle = CONFIG.COLORS.EXIT;
        this.ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('出口', x + size / 2, y + size / 2);
    }

    drawBeans(beans) {
        for (const bean of beans) {
            if (bean.collected) continue;
            
            const x = bean.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
            const y = bean.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
            const radius = 12 + Math.sin(this.animationFrame * 0.1) * 2;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
            gradient.addColorStop(0, bean.color);
            gradient.addColorStop(0.5, bean.color + '80');
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = bean.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(x - 3, y - 3, radius / 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawObstacles(obstacles) {
        for (const obstacle of obstacles) {
            const x = obstacle.x * CONFIG.CELL_SIZE;
            const y = obstacle.y * CONFIG.CELL_SIZE;
            const size = CONFIG.CELL_SIZE;
            
            const pulse = Math.sin(this.animationFrame * 0.15) * 0.1 + 0.9;
            
            this.ctx.fillStyle = CONFIG.COLORS.OBSTACLE;
            this.ctx.fillRect(
                x + (1 - pulse) * size / 2 + 4, 
                y + (1 - pulse) * size / 2 + 4, 
                (size - 8) * pulse, 
                (size - 8) * pulse
            );
            
            this.ctx.strokeStyle = '#c0392b';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 12, y + 12);
            this.ctx.lineTo(x + size - 12, y + size - 12);
            this.ctx.moveTo(x + size - 12, y + 12);
            this.ctx.lineTo(x + 12, y + size - 12);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        const x = player.pixelX + CONFIG.CELL_SIZE / 2;
        const y = player.pixelY + CONFIG.CELL_SIZE / 2;
        const radius = 15;
        
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, 'rgba(0, 210, 211, 0.4)');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = CONFIG.COLORS.PLAYER;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#00a8a8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        const eyeOffset = 5;
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffset, y - 2, 4, 0, Math.PI * 2);
        this.ctx.arc(x + eyeOffset, y - 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#2d3436';
        this.ctx.beginPath();
        this.ctx.arc(x - eyeOffset, y - 2, 2, 0, Math.PI * 2);
        this.ctx.arc(x + eyeOffset, y - 2, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x - 4, y - 4, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
}