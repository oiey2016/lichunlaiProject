class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        this.radius = type === 'boss' ? 35 : 22;
        this.health = type === 'boss' ? GameConfig.enemyHealth * 3 : GameConfig.enemyHealth;
        this.maxHealth = this.health;
        this.speed = type === 'boss' ? GameConfig.enemySpeed * 0.7 : GameConfig.enemySpeed;
        this.damage = type === 'boss' ? GameConfig.enemyDamage * 2 : GameConfig.enemyDamage;
        
        this.angle = 0;
        this.attackCooldown = 0;
        this.hitFlash = 0;
    }
    
    update() {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        
        this.angle = Math.atan2(dy, dx);
        
        if (this.hitFlash > 0) this.hitFlash -= 0.1;
        
        if (circleCollision(this.x, this.y, this.radius, game.player.x, game.player.y, game.player.radius)) {
            if (this.attackCooldown <= 0) {
                game.player.takeDamage(this.damage);
                this.attackCooldown = 60;
            }
        }
        
        if (this.attackCooldown > 0) this.attackCooldown--;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.hitFlash = 1;
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        const index = game.enemies.indexOf(this);
        if (index > -1) {
            game.enemies.splice(index, 1);
        }
        
        const points = this.type === 'boss' ? 100 : 10;
        game.score += points;
        game.enemiesKilled++;
        
        game.createParticles(this.x, this.y, Colors.enemy, 10);
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.shadowColor = Colors.enemyGlow;
            ctx.shadowBlur = 15;
            ctx.fillStyle = Colors.enemy;
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(-5, -6, 5, 0, Math.PI * 2);
        ctx.arc(-5, 6, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = Colors.enemy;
        ctx.beginPath();
        ctx.arc(-3, -6, 2, 0, Math.PI * 2);
        ctx.arc(-3, 6, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        if (this.health < this.maxHealth) {
            const barWidth = this.radius * 2;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.radius - 12;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = Colors.health;
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }
}
