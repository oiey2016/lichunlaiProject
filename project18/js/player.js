class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.health = GameConfig.playerHealth;
        this.maxHealth = GameConfig.playerHealth;
        this.speed = GameConfig.playerSpeed;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.lastShootTime = 0;
        this.lastSwordTime = 0;
        this.shootCooldown = GameConfig.shootCooldown;
        this.swordCooldown = GameConfig.swordCooldown;
        
        this.isSwinging = false;
        this.swingAngle = 0;
        this.swingProgress = 0;
        
        this.invincible = false;
        this.invincibleTime = 0;
        
        this.keys = {};
        this.mouseX = x;
        this.mouseY = y;
    }
    
    setupInput(canvas) {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'j') this.shoot();
            if (e.key.toLowerCase() === 'k') this.swingSword();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.button === 0) this.shoot();
            if (e.button === 2) this.swingSword();
        });
        
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShootTime < this.shootCooldown) return;
        
        this.lastShootTime = now;
        
        const bullet = new Bullet(
            this.x + Math.cos(this.angle) * 30,
            this.y + Math.sin(this.angle) * 30,
            this.angle,
            true
        );
        
        game.bullets.push(bullet);
    }
    
    swingSword() {
        const now = Date.now();
        if (now - this.lastSwordTime < this.swordCooldown) return;
        
        this.lastSwordTime = now;
        this.isSwinging = true;
        this.swingProgress = 0;
    }
    
    takeDamage(damage) {
        if (this.invincible) return;
        
        this.health -= damage;
        this.invincible = true;
        this.invincibleTime = Date.now();
        
        if (this.health <= 0) {
            this.health = 0;
            game.gameOver();
        }
    }
    
    update() {
        let dx = 0, dy = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        this.velocityX = dx * this.speed;
        this.velocityY = dy * this.speed;
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        this.x = clamp(this.x, this.radius, GameConfig.canvasWidth - this.radius);
        this.y = clamp(this.y, this.radius, GameConfig.canvasHeight - this.radius);
        
        this.angle = Math.atan2(this.mouseY - this.y, this.mouseX - this.x);
        
        if (this.isSwinging) {
            this.swingProgress += 0.1;
            this.swingAngle = lerp(-Math.PI / 3, Math.PI / 3, this.swingProgress);
            
            if (this.swingProgress >= 1) {
                this.isSwinging = false;
                this.swingProgress = 0;
            }
            
            this.checkSwordHits();
        }
        
        if (this.invincible && Date.now() - this.invincibleTime > 1000) {
            this.invincible = false;
        }
    }
    
    checkSwordHits() {
        if (this.swingProgress < 0.3 || this.swingProgress > 0.7) return;
        
        game.enemies.forEach(enemy => {
            const dist = distance(this.x, this.y, enemy.x, enemy.y);
            if (dist < GameConfig.swordRange + enemy.radius) {
                const angleToEnemy = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                const angleDiff = Math.abs(normalizeAngle(angleToEnemy - this.angle));
                if (angleDiff < Math.PI / 2) {
                    enemy.takeDamage(GameConfig.swordDamage);
                }
            }
        });
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.shadowColor = Colors.playerGlow;
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = Colors.player;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(10, -8, 6, 0, Math.PI * 2);
        ctx.arc(10, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(12, -8, 3, 0, Math.PI * 2);
        ctx.arc(12, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.isSwinging) {
            ctx.save();
            ctx.rotate(this.swingAngle);
            
            ctx.shadowColor = Colors.swordGlow;
            ctx.shadowBlur = 15;
            
            ctx.strokeStyle = Colors.sword;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(GameConfig.swordRange, 0);
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.restore();
    }
}
