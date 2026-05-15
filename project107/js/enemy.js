class Enemy extends Entity {
    constructor(x, y, type = 'normal') {
        const config = ENEMY_TYPES[type];
        super(x, y, ENEMY_CONFIG.width, ENEMY_CONFIG.height);
        
        this.type = type;
        this.color = config.color;
        this.maxHealth = config.health;
        this.health = this.maxHealth;
        this.speed = config.speed;
        this.damage = config.damage;
        this.scoreValue = config.score;
        
        this.state = 'idle';
        this.stateTimer = 0;
        this.target = null;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(player) {
        if (this.isDead) return;

        this.target = player;
        
        this.updateHurtState();
        this.updateAttackState();
        this.updateCooldowns();
        this.updateAI();
        this.applyKnockback();

        Physics.applyGravity(this);
        Physics.updatePosition(this);
        Physics.checkGroundCollision(this);
        Physics.checkBoundaryCollision(this);

        this.updateAnimation();

        if (this.combo > 0) {
            this.combo = Math.max(0, this.combo - 0.02);
        }
    }

    updateAI() {
        if (this.isHurt || this.isAttacking) {
            this.velocityX = 0;
            return;
        }

        const dist = Physics.getDistance(this, this.target);
        const dx = this.target.x - this.x;

        this.facingRight = dx > 0;

        if (dist < ENEMY_CONFIG.attackRange) {
            this.attack();
        } else if (dist < 400) {
            this.chase();
        } else {
            this.idle();
        }
    }

    chase() {
        this.state = 'chase';
        this.velocityX = this.facingRight ? this.speed : -this.speed;
    }

    idle() {
        this.state = 'idle';
        this.velocityX = 0;
        
        this.stateTimer++;
        if (this.stateTimer > 60) {
            this.stateTimer = 0;
            this.facingRight = !this.facingRight;
        }
    }

    attack() {
        if (this.attackCooldownTimer > 0) return;

        this.isAttacking = true;
        this.attackTimer = 25;
        this.attackCooldownTimer = Math.floor(ENEMY_CONFIG.attackCooldown / 16);

        if (Physics.checkAttackHit(this, this.target, ENEMY_CONFIG.attackRange, 60)) {
            const knockbackDir = this.facingRight ? 5 : -5;
            this.target.takeDamage(this.damage, knockbackDir, -2);
        }
    }

    updateAnimation() {
        this.animTimer++;
        if (this.animTimer >= 10) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    draw(ctx) {
        if (this.isDead) {
            this.drawDead(ctx);
            return;
        }

        ctx.save();
        
        if (this.isHurt && this.hurtTimer % 4 < 2) {
            ctx.globalAlpha = 0.5;
        }

        if (!this.facingRight) {
            ctx.translate(this.x + this.width, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, 0);
        }

        this.drawBody(ctx);
        this.drawHead(ctx);
        this.drawArms(ctx);
        this.drawLegs(ctx);

        ctx.restore();
    }

    drawBody(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 5, this.y + 25, 40, 35);
    }

    drawHead(ctx) {
        ctx.fillStyle = COLORS.playerSkin;
        ctx.fillRect(this.x + 8, this.y, 34, 30);
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 18, this.y + 12, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 32, this.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.isAttacking) {
            ctx.fillRect(this.x + 18, this.y + 22, 14, 4);
        } else {
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(this.x + 20, this.y + 24, 10, 2);
        }
    }

    drawArms(ctx) {
        ctx.fillStyle = COLORS.playerSkin;
        
        if (this.isAttacking) {
            ctx.fillRect(this.x + 45, this.y + 28, 25, 10);
        } else {
            const armWave = Math.sin(this.animFrame * Math.PI / 2) * 3;
            ctx.fillRect(this.x, this.y + 28 + armWave, 10, 25);
            ctx.fillRect(this.x + 40, this.y + 28 - armWave, 10, 25);
        }
    }

    drawLegs(ctx) {
        ctx.fillStyle = '#2d3436';
        const legOffset = this.state === 'chase' ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
        ctx.fillRect(this.x + 10 - legOffset, this.y + 60, 12, 20);
        ctx.fillRect(this.x + 28 + legOffset, this.y + 60, 12, 20);
    }

    drawDead(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y + 50, this.width, 20);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '20px Arial';
        ctx.fillText('✕', this.x + this.width / 2 - 8, this.y + 65);
        ctx.restore();
    }
}