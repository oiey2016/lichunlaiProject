import { CONFIG } from './config.js';

export class Obstacle {
    constructor(x, type = 'normal') {
        this.x = x;
        this.type = type;
        this.width = this.getRandomWidth();
        this.height = this.getRandomHeight();
        this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.height;
        this.passed = false;
    }

    getRandomWidth() {
        return Math.random() * (CONFIG.OBSTACLE.MAX_WIDTH - CONFIG.OBSTACLE.MIN_WIDTH) + CONFIG.OBSTACLE.MIN_WIDTH;
    }

    getRandomHeight() {
        return Math.random() * (CONFIG.OBSTACLE.MAX_HEIGHT - CONFIG.OBSTACLE.MIN_HEIGHT) + CONFIG.OBSTACLE.MIN_HEIGHT;
    }

    update(speed) {
        this.x -= speed;
    }

    draw(ctx) {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, CONFIG.COLORS.OBSTACLE_TOP);
        gradient.addColorStop(1, CONFIG.COLORS.OBSTACLE);
        
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.3, this.y + this.height * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.3, this.y + this.height * 0.3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.7, this.y + this.height * 0.4, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 10,
            width: this.width - 10,
            height: this.height - 10
        };
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

export class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.lastObstacleX = CONFIG.CANVAS_WIDTH + 200;
        this.obstaclesPassed = 0;
        this.finishLine = null;
    }

    generateObstacle(level) {
        const gap = this.getRandomGap(level);
        const x = this.lastObstacleX + gap;
        const obstacle = new Obstacle(x);
        this.obstacles.push(obstacle);
        this.lastObstacleX = x;
    }

    getRandomGap(level) {
        const minGap = Math.max(150, CONFIG.OBSTACLE.MIN_GAP - level * 10);
        const maxGap = Math.max(200, CONFIG.OBSTACLE.MAX_GAP - level * 15);
        return Math.random() * (maxGap - minGap) + minGap;
    }

    update(speed, level, maxObstacles) {
        const totalNeeded = CONFIG.LEVEL.OBSTACLES_PER_LEVEL + level * 2;
        
        if (this.obstacles.length < 5 && this.obstaclesPassed < totalNeeded) {
            this.generateObstacle(level);
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].update(speed);
            
            if (this.obstacles[i].isOffScreen()) {
                if (!this.obstacles[i].passed) {
                    this.obstacles[i].passed = true;
                    this.obstaclesPassed++;
                }
                this.obstacles.splice(i, 1);
            }
        }

        if (this.obstaclesPassed >= totalNeeded && !this.finishLine) {
            this.finishLine = {
                x: this.lastObstacleX + 300,
                width: 60
            };
        }

        if (this.finishLine) {
            this.finishLine.x -= speed;
        }
    }

    draw(ctx) {
        for (const obstacle of this.obstacles) {
            obstacle.draw(ctx);
        }

        if (this.finishLine) {
            this.drawFinishLine(ctx);
        }
    }

    drawFinishLine(ctx) {
        const x = this.finishLine.x;
        const y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 150;
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, 8, 150);

        ctx.fillStyle = CONFIG.COLORS.FINISH_LINE;
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x + 60, y + 30);
        ctx.lineTo(x + 8, y + 60);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('终点', x + 34, y + 38);

        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FFF';
            ctx.fillRect(x + 8, y + i * 12, 52, 6);
        }
    }

    checkCollision(snailBounds) {
        for (const obstacle of this.obstacles) {
            const obsBounds = obstacle.getBounds();
            if (this.isColliding(snailBounds, obsBounds)) {
                return true;
            }
        }
        return false;
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkFinish(snailX) {
        if (this.finishLine && snailX >= this.finishLine.x + 30) {
            return true;
        }
        return false;
    }

    getPassedCount() {
        return this.obstaclesPassed;
    }

    reset() {
        this.obstacles = [];
        this.lastObstacleX = CONFIG.CANVAS_WIDTH + 200;
        this.obstaclesPassed = 0;
        this.finishLine = null;
    }
}