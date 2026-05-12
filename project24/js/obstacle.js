import { CONFIG } from './config.js';

export class Obstacle {
    constructor(lane, lanePositions, canvasHeight, type = 'normal') {
        this.lane = lane;
        this.lanePositions = lanePositions;
        this.x = lanePositions[lane];
        this.y = -100;
        this.canvasHeight = canvasHeight;
        this.type = type;
        
        if (type === 'low') {
            this.width = CONFIG.OBSTACLE.WIDTH;
            this.height = CONFIG.OBSTACLE.LOW_HEIGHT;
            this.color = CONFIG.COLORS.OBSTACLE_LOW;
            this.y = canvasHeight - 150 + CONFIG.PLAYER.SLIDE_HEIGHT;
        } else {
            this.width = CONFIG.OBSTACLE.WIDTH;
            this.height = CONFIG.OBSTACLE.HEIGHT;
            this.color = CONFIG.COLORS.OBSTACLE;
        }
        
        this.passed = false;
    }
    
    update(speed) {
        this.y += speed;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.height / 2);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-this.width / 2 + 10 + i * 15, -this.height / 2 + 10, 10, this.height - 20);
        }
        
        if (this.type === 'low') {
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(-this.width / 2 + 15, -this.height / 2 + 15, 12, 12);
            ctx.fillRect(this.width / 2 - 27, -this.height / 2 + 15, 12, 12);
        }
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > this.canvasHeight + 100;
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getType() {
        return this.type;
    }
}

export class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.spawnTimer = 0;
        
        const centerX = canvasWidth / 2;
        this.lanePositions = [
            centerX - CONFIG.LANE_WIDTH,
            centerX,
            centerX + CONFIG.LANE_WIDTH
        ];
    }
    
    spawn() {
        const lane = Math.floor(Math.random() * 3);
        const type = Math.random() < 0.3 ? 'low' : 'normal';
        this.obstacles.push(new Obstacle(lane, this.lanePositions, this.canvasHeight, type));
    }
    
    update(speed) {
        this.spawnTimer++;
        if (this.spawnTimer >= CONFIG.GAME.SPAWN_INTERVAL) {
            this.spawn();
            this.spawnTimer = 0;
        }
        
        this.obstacles.forEach(obstacle => obstacle.update(speed));
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
    }
    
    draw(ctx) {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
    }
    
    checkCollision(player) {
        const playerBounds = player.getBounds();
        const playerLane = player.getLane();
        const playerSliding = player.isSlidingState();
        const playerJumping = player.isInAir();
        
        for (const obstacle of this.obstacles) {
            if (obstacle.lane !== playerLane) continue;
            
            const obstacleBounds = obstacle.getBounds();
            const obstacleType = obstacle.getType();
            
            const collisionY = playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
                              playerBounds.y + playerBounds.height > obstacleBounds.y;
            
            if (!collisionY) continue;
            
            if (obstacleType === 'low') {
                if (!playerSliding && !playerJumping) {
                    return true;
                }
            } else {
                if (!playerJumping) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
    }
}