const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GameState = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

const Config = {
    playerSpeed: 6,
    bulletSpeed: 10,
    enemyBaseSpeed: 2,
    shootCooldown: 200,
    enemySpawnRate: 1500
};

class Player {
    constructor() {
        this.width = 50;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = Config.playerSpeed;
        this.lastShootTime = 0;
        this.isInvincible = false;
        this.invincibleTime = 0;
    }

    draw() {
        ctx.save();
        
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 15);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 107, 107, 0.6)';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width / 2 + 12, this.y + 35);
        ctx.lineTo(this.x + this.width / 2 - 12, this.y + 35);
        ctx.closePath();
        ctx.fillStyle = 'rgba(135, 206, 250, 0.8)';
        ctx.fill();
        ctx.strokeStyle = '#4169E1';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height - 25);
        ctx.lineTo(this.x - 15, this.y + this.height - 5);
        ctx.lineTo(this.x + 10, this.y + this.height - 15);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height - 25);
        ctx.lineTo(this.x + this.width + 15, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height - 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    move(keys) {
        if (keys.ArrowLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys.ArrowRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (keys.ArrowUp && this.y > 0) {
            this.y -= this.speed;
        }
        if (keys.ArrowDown && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }
    }

    canShoot() {
        const now = Date.now();
        if (now - this.lastShootTime >= Config.shootCooldown) {
            this.lastShootTime = now;
            return true;
        }
        return false;
    }

    hit() {
        if (!this.isInvincible) {
            this.isInvincible = true;
            this.invincibleTime = Date.now();
            return true;
        }
        return false;
    }

    update() {
        if (this.isInvincible && Date.now() - this.invincibleTime > 2000) {
            this.isInvincible = false;
        }
    }

    getBounds() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 20
        };
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = Config.bulletSpeed;
    }

    draw() {
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    update() {
        this.y -= this.speed;
    }

    isOffScreen() {
        return this.y < -this.height;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Enemy {
    constructor(type) {
        this.type = type;
        this.setTypeProperties();
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = Config.enemyBaseSpeed + Math.random() * 2;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05 + Math.random() * 0.05;
    }

    setTypeProperties() {
        switch(this.type) {
            case 'small':
                this.width = 35;
                this.height = 35;
                this.color = '#98FB98';
                this.strokeColor = '#228B22';
                this.points = 10;
                this.hp = 1;
                break;
            case 'medium':
                this.width = 50;
                this.height = 50;
                this.color = '#87CEEB';
                this.strokeColor = '#4169E1';
                this.points = 25;
                this.hp = 2;
                break;
            case 'large':
                this.width = 70;
                this.height = 70;
                this.color = '#DDA0DD';
                this.strokeColor = '#8B008B';
                this.points = 50;
                this.hp = 3;
                break;
        }
    }

    draw() {
        ctx.save();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.beginPath();
        ctx.moveTo(cx, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(cx, this.y + 15);
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 4, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    update(level) {
        this.y += this.speed * (1 + level * 0.15);
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 1.5;

        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
    }

    isOffScreen() {
        return this.y > canvas.height;
    }

    hit() {
        this.hp--;
        return this.hp <= 0;
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 8 + 4;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.95;
    }

    isDead() {
        return this.life <= 0;
    }
}

class Game {
    constructor() {
        this.state = GameState.IDLE;
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.keys = {};
        this.lastEnemySpawn = 0;
        
        this.setupEventListeners();
        this.drawBackground();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRules());
        document.getElementById('closeRulesBtn').addEventListener('click', () => this.hideRules());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }

    start() {
        this.reset();
        this.state = GameState.PLAYING;
        this.gameLoop();
    }

    reset() {
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.lastEnemySpawn = 0;
        this.updateUI();
    }

    restart() {
        document.getElementById('gameOverModal').style.display = 'none';
        this.start();
    }

    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.gameLoop();
        }
    }

    showRules() {
        document.getElementById('rulesModal').style.display = 'flex';
    }

    hideRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }

    shoot() {
        if (this.state === GameState.PLAYING && this.player.canShoot()) {
            const bulletX = this.player.x + this.player.width / 2;
            const bulletY = this.player.y;
            this.bullets.push(new Bullet(bulletX, bulletY));
        }
    }

    spawnEnemy() {
        const now = Date.now();
        const spawnRate = Math.max(500, Config.enemySpawnRate - this.level * 100);
        
        if (now - this.lastEnemySpawn > spawnRate) {
            const rand = Math.random();
            let type;
            if (rand < 0.6) {
                type = 'small';
            } else if (rand < 0.85) {
                type = 'medium';
            } else {
                type = 'large';
            }
            
            this.enemies.push(new Enemy(type));
            this.lastEnemySpawn = now;
        }
    }

    checkCollisions() {
        const playerBounds = this.player.getBounds();

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const bulletBounds = bullet.getBounds();

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const enemyBounds = enemy.getBounds();

                if (this.isColliding(bulletBounds, enemyBounds)) {
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    
                    if (enemy.hit()) {
                        this.score += enemy.points;
                        this.enemies.splice(j, 1);
                        this.checkLevelUp();
                    }
                    
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const enemyBounds = enemy.getBounds();

            if (this.isColliding(playerBounds, enemyBounds)) {
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                this.enemies.splice(i, 1);

                if (this.player.hit()) {
                    this.lives--;
                    this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#FF6B6B');
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
            }
        }

        this.updateUI();
    }

    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    checkLevelUp() {
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
        document.getElementById('level').textContent = this.level;
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').style.display = 'flex';
    }

    drawBackground() {
        ctx.save();
        ctx.strokeStyle = 'rgba(135, 206, 250, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        
        for (let i = 0; i < canvas.height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    update() {
        this.player.move(this.keys);
        this.player.update();

        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => !bullet.isOffScreen());

        this.spawnEnemy();
        this.enemies.forEach(enemy => enemy.update(this.level));
        this.enemies = this.enemies.filter(enemy => !enemy.isOffScreen());

        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => !particle.isDead());

        this.checkCollisions();
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B0E0E6');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawBackground();

        this.particles.forEach(particle => particle.draw());
        this.bullets.forEach(bullet => bullet.draw());
        this.enemies.forEach(enemy => enemy.draw());
        this.player.draw();

        if (this.state === GameState.PAUSED) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 48px Comic Sans MS';
            ctx.textAlign = 'center';
            ctx.fillText('⏸️ 游戏暂停', canvas.width / 2, canvas.height / 2);
            
            ctx.font = '24px Comic Sans MS';
            ctx.fillText('按 P 键继续', canvas.width / 2, canvas.height / 2 + 50);
        }

        if (this.state === GameState.IDLE) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 36px Comic Sans MS';
            ctx.textAlign = 'center';
            ctx.fillText('点击"开始游戏"按钮', canvas.width / 2, canvas.height / 2);
        }
    }

    gameLoop() {
        if (this.state === GameState.PLAYING) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        } else if (this.state === GameState.PAUSED || this.state === GameState.IDLE) {
            this.draw();
        }
    }
}

const game = new Game();