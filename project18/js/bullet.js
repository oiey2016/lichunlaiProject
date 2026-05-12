class Bullet {
    constructor(x, y, angle, isPlayerBullet = true) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = GameConfig.bulletSpeed;
        this.radius = 6;
        this.isPlayerBullet = isPlayerBullet;
        this.damage = isPlayerBullet ? GameConfig.bulletDamage : GameConfig.enemyDamage;
        this.trail = [];
    }
    
    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        
        if (this.isPlayerBullet) {
            game.enemies.forEach(enemy => {
                if (circleCollision(this.x, this.y, this.radius, enemy.x, enemy.y, enemy.radius)) {
                    enemy.takeDamage(this.damage);
                    this.destroy();
                }
            });
        } else {
            if (circleCollision(this.x, this.y, this.radius, game.player.x, game.player.y, game.player.radius)) {
                game.player.takeDamage(this.damage);
                this.destroy();
            }
        }
        
        if (this.x < 0 || this.x > GameConfig.canvasWidth || 
            this.y < 0 || this.y > GameConfig.canvasHeight) {
            this.destroy();
        }
    }
    
    destroy() {
        const index = game.bullets.indexOf(this);
        if (index > -1) {
            game.bullets.splice(index, 1);
        }
    }
    
    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length * 0.5;
            const size = this.radius * ((i + 1) / this.trail.length);
            
            ctx.fillStyle = this.isPlayerBullet ? 
                `rgba(255, 217, 61, ${alpha})` : 
                `rgba(255, 107, 107, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowColor = this.isPlayerBullet ? Colors.bulletGlow : Colors.enemyGlow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.isPlayerBullet ? Colors.bullet : Colors.enemy;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = randomRange(3, 6);
        const angle = randomRange(0, Math.PI * 2);
        const speed = randomRange(2, 5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = randomRange(0.02, 0.04);
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
