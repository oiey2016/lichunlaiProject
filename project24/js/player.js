import { CONFIG } from './config.js';

export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        this.normalHeight = CONFIG.PLAYER.HEIGHT;
        this.slideHeight = CONFIG.PLAYER.SLIDE_HEIGHT;
        
        this.currentLane = 1;
        this.targetLane = 1;
        
        const centerX = canvasWidth / 2;
        this.lanePositions = [
            centerX - CONFIG.LANE_WIDTH,
            centerX,
            centerX + CONFIG.LANE_WIDTH
        ];
        
        this.x = this.lanePositions[this.currentLane];
        this.y = canvasHeight - 150;
        this.groundY = this.y;
        
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.rotation = 0;
    }
    
    getLane() {
        return this.currentLane;
    }
    
    isSlidingState() {
        return this.isSliding;
    }
    
    isInAir() {
        return this.isJumping;
    }
    
    changeLane(direction) {
        const newLane = this.targetLane + direction;
        if (newLane >= 0 && newLane < CONFIG.LANE_COUNT) {
            this.targetLane = newLane;
        }
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.velocityY = CONFIG.PLAYER.JUMP_FORCE;
            this.isJumping = true;
        }
    }
    
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.height = this.slideHeight;
            this.y = this.groundY + (this.normalHeight - this.slideHeight);
            this.slideTimer = 60;
        }
    }
    
    update() {
        const targetX = this.lanePositions[this.targetLane];
        const dx = targetX - this.x;
        this.x += dx * 0.2;
        
        if (Math.abs(dx) < 1) {
            this.currentLane = this.targetLane;
        }
        
        if (this.isJumping) {
            this.velocityY += CONFIG.PLAYER.GRAVITY;
            this.y += this.velocityY;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }
        
        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.height = this.normalHeight;
                this.y = this.groundY;
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.height / 2);
        
        if (this.isJumping) {
            this.rotation = Math.sin(Date.now() * 0.01) * 0.1;
        } else if (this.isSliding) {
            this.rotation = 0;
        } else {
            this.rotation = 0;
        }
        
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = CONFIG.COLORS.PLAYER;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = CONFIG.COLORS.PLAYER_DETAIL;
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, 10, 10);
        ctx.fillRect(this.width / 2 - 15, -this.height / 2 + 5, 10, 10);
        
        if (!this.isSliding) {
            const legOffset = Math.sin(Date.now() * 0.02) * 10;
            ctx.fillStyle = CONFIG.COLORS.PLAYER_DETAIL;
            ctx.fillRect(-this.width / 2 + 5, this.height / 2 - 20 + legOffset, 15, 20);
            ctx.fillRect(this.width / 2 - 20, this.height / 2 - 20 - legOffset, 15, 20);
        }
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2 + 10,
            y: this.y,
            width: this.width - 20,
            height: this.height
        };
    }
    
    reset() {
        this.currentLane = 1;
        this.targetLane = 1;
        this.x = this.lanePositions[1];
        this.y = this.groundY;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.height = this.normalHeight;
        this.slideTimer = 0;
    }
}