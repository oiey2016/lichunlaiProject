const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Game {
    constructor() {
        this.gold = 200;
        this.population = 0;
        this.maxPopulation = 20;
        this.playerUnits = [];
        this.enemyUnits = [];
        this.projectiles = [];
        this.effects = [];
        this.playerCastle = { x: 50, y: 300, width: 80, height: 150, health: 1000, maxHealth: 1000 };
        this.enemyCastle = { x: 1070, y: 300, width: 80, height: 150, health: 1000, maxHealth: 1000 };
        this.isRunning = false;
        this.isPaused = false;
        this.wave = 1;
        this.kills = 0;
        this.lastTime = 0;
        this.goldTimer = 0;
        this.enemySpawnTimer = 0;
        
        this.unitConfigs = {
            miner: { cost: 50, health: 50, damage: 0, speed: 0, range: 0, attackSpeed: 0, goldPerSecond: 5 },
            soldier: { cost: 100, health: 100, damage: 20, speed: 1.5, range: 30, attackSpeed: 1000 },
            archer: { cost: 150, health: 60, damage: 15, speed: 1, range: 200, attackSpeed: 1500 },
            wizard: { cost: 250, health: 80, damage: 35, speed: 0.8, range: 180, attackSpeed: 2000, aoe: true }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateUI();
    }
    
    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('overlayRestartBtn').addEventListener('click', () => this.restart());
        
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const unitType = btn.dataset.unit;
                this.spawnUnit(unitType, 'player');
            });
        });
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isPaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
        if (!this.isPaused) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    restart() {
        this.gold = 200;
        this.population = 0;
        this.playerUnits = [];
        this.enemyUnits = [];
        this.projectiles = [];
        this.effects = [];
        this.playerCastle.health = 1000;
        this.enemyCastle.health = 1000;
        this.wave = 1;
        this.kills = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.goldTimer = 0;
        this.enemySpawnTimer = 0;
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
        document.getElementById('gameOverlay').classList.remove('active');
        
        this.updateUI();
        this.draw();
    }
    
    spawnUnit(type, team) {
        const config = this.unitConfigs[type];
        
        if (team === 'player') {
            if (this.gold < config.cost) {
                this.showEffect(200, 250, '金币不足!', '#ff4757');
                return;
            }
            if (this.population >= this.maxPopulation) {
                this.showEffect(200, 250, '人口已满!', '#ff4757');
                return;
            }
            this.gold -= config.cost;
            this.population++;
        }
        
        const x = team === 'player' ? 150 : 1000;
        const y = 380 + Math.random() * 50;
        
        let unit;
        switch (type) {
            case 'miner':
                unit = new Miner(x, y, team, config);
                break;
            case 'soldier':
                unit = new Soldier(x, y, team, config);
                break;
            case 'archer':
                unit = new Archer(x, y, team, config);
                break;
            case 'wizard':
                unit = new Wizard(x, y, team, config);
                break;
        }
        
        if (team === 'player') {
            this.playerUnits.push(unit);
        } else {
            this.enemyUnits.push(unit);
        }
        
        this.updateUI();
    }
    
    spawnEnemyWave() {
        const enemyCount = Math.min(2 + Math.floor(this.wave / 2), 6);
        const types = ['soldier', 'archer'];
        if (this.wave >= 3) types.push('wizard');
        
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                const type = types[Math.floor(Math.random() * types.length)];
                this.spawnUnit(type, 'enemy');
            }, i * 500);
        }
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(deltaTime) {
        this.goldTimer += deltaTime;
        if (this.goldTimer >= 1000) {
            this.goldTimer = 0;
            const minerCount = this.playerUnits.filter(u => u.type === 'miner').length;
            this.gold += minerCount * 5;
        }
        
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= 8000) {
            this.enemySpawnTimer = 0;
            this.spawnEnemyWave();
            this.wave++;
        }
        
        this.playerUnits.forEach(unit => unit.update(deltaTime, this.enemyUnits, this.enemyCastle, this));
        this.enemyUnits.forEach(unit => unit.update(deltaTime, this.playerUnits, this.playerCastle, this));
        
        this.playerUnits = this.playerUnits.filter(unit => unit.health > 0);
        this.enemyUnits = this.enemyUnits.filter(unit => {
            if (unit.health <= 0) {
                this.kills++;
                return false;
            }
            return true;
        });
        
        this.population = this.playerUnits.length;
        
        this.projectiles.forEach(proj => proj.update());
        this.projectiles = this.projectiles.filter(proj => proj.active);
        
        this.effects.forEach(effect => effect.life -= deltaTime);
        this.effects = this.effects.filter(effect => effect.life > 0);
        
        this.checkGameOver();
        this.updateUI();
    }
    
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.drawBackground();
        this.drawCastle(this.playerCastle, 'player');
        this.drawCastle(this.enemyCastle, 'enemy');
        
        this.playerUnits.forEach(unit => unit.draw(ctx));
        this.enemyUnits.forEach(unit => unit.draw(ctx));
        
        this.projectiles.forEach(proj => proj.draw(ctx));
        this.effects.forEach(effect => this.drawEffect(effect));
    }
    
    drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.7, '#98d8c8');
        gradient.addColorStop(1, '#7cb342');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(0, 430, canvas.width, 70);
        
        ctx.fillStyle = '#6d4c41';
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.fillRect(i, 450, 20, 3);
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(100, 60);
        this.drawCloud(400, 40);
        this.drawCloud(700, 80);
        this.drawCloud(1000, 50);
    }
    
    drawCloud(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 30, y - 10, 30, 0, Math.PI * 2);
        ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawCastle(castle, team) {
        const color = team === 'player' ? '#3498db' : '#e74c3c';
        const darkColor = team === 'player' ? '#2980b9' : '#c0392b';
        
        ctx.fillStyle = color;
        ctx.fillRect(castle.x, castle.y, castle.width, castle.height);
        
        ctx.fillStyle = darkColor;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(castle.x + i * 22, castle.y - 20, 18, 25);
        }
        
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(castle.x + 25, castle.y + 80, 30, 70);
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(castle.x + 10, castle.y + 30, 20, 25);
        ctx.fillRect(castle.x + 50, castle.y + 30, 20, 25);
        
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(castle.x + 35, castle.y - 50, 5, 35);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(castle.x + 40, castle.y - 50);
        ctx.lineTo(castle.x + 70, castle.y - 40);
        ctx.lineTo(castle.x + 40, castle.y - 30);
        ctx.fill();
        
        const healthPercent = castle.health / castle.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(castle.x, castle.y - 70, castle.width, 12);
        ctx.fillStyle = team === 'player' ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(castle.x + 2, castle.y - 68, (castle.width - 4) * healthPercent, 8);
    }
    
    showEffect(x, y, text, color) {
        this.effects.push({ x, y, text, color, life: 1000 });
    }
    
    drawEffect(effect) {
        const alpha = effect.life / 1000;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.x, effect.y - (1 - alpha) * 30);
        ctx.globalAlpha = 1;
    }
    
    checkGameOver() {
        if (this.playerCastle.health <= 0) {
            this.gameOver(false);
        } else if (this.enemyCastle.health <= 0) {
            this.gameOver(true);
        }
    }
    
    gameOver(victory) {
        this.isRunning = false;
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        
        overlay.classList.add('active');
        
        if (victory) {
            title.textContent = '🎉 胜利!';
            title.style.color = '#2ecc71';
            message.textContent = `恭喜你摧毁了敌方城堡! 击杀数: ${this.kills}, 波次: ${this.wave}`;
        } else {
            title.textContent = '💀 失败';
            title.style.color = '#e74c3c';
            message.textContent = `你的城堡被摧毁了! 击杀数: ${this.kills}, 波次: ${this.wave}`;
        }
    }
    
    updateUI() {
        document.getElementById('gold').textContent = Math.floor(this.gold);
        document.getElementById('population').textContent = this.population;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('kills').textContent = this.kills;
        
        const playerHealthPercent = (this.playerCastle.health / this.playerCastle.maxHealth) * 100;
        const enemyHealthPercent = (this.enemyCastle.health / this.enemyCastle.maxHealth) * 100;
        
        document.getElementById('playerHealth').style.width = playerHealthPercent + '%';
        document.getElementById('enemyHealth').style.width = enemyHealthPercent + '%';
        document.getElementById('playerHealthText').textContent = `${Math.max(0, Math.floor(this.playerCastle.health))}/${this.playerCastle.maxHealth}`;
        document.getElementById('enemyHealthText').textContent = `${Math.max(0, Math.floor(this.enemyCastle.health))}/${this.enemyCastle.maxHealth}`;
        
        document.querySelectorAll('.unit-btn').forEach(btn => {
            const unitType = btn.dataset.unit;
            const cost = this.unitConfigs[unitType].cost;
            btn.disabled = this.gold < cost || this.population >= this.maxPopulation || !this.isRunning;
        });
    }
}

class Unit {
    constructor(x, y, team, config) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.speed = config.speed;
        this.range = config.range;
        this.attackSpeed = config.attackSpeed;
        this.lastAttackTime = 0;
        this.target = null;
        this.type = 'unit';
        this.width = 30;
        this.height = 50;
        this.animFrame = 0;
        this.animTimer = 0;
    }
    
    update(deltaTime, enemies, enemyCastle, game) {
        this.animTimer += deltaTime;
        if (this.animTimer >= 150) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
        
        this.findTarget(enemies, enemyCastle);
        
        if (this.target) {
            const distance = Math.abs(this.x - this.target.x);
            
            if (distance <= this.range) {
                this.attack(game, deltaTime);
            } else {
                this.move();
            }
        } else {
            this.move();
        }
    }
    
    findTarget(enemies, enemyCastle) {
        let closest = null;
        let closestDist = Infinity;
        
        enemies.forEach(enemy => {
            const dist = Math.abs(this.x - enemy.x);
            if (dist < closestDist) {
                closestDist = dist;
                closest = enemy;
            }
        });
        
        if (!closest || closestDist > Math.abs(this.x - enemyCastle.x)) {
            this.target = enemyCastle;
        } else {
            this.target = closest;
        }
    }
    
    move() {
        if (this.team === 'player') {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }
    }
    
    attack(game, deltaTime) {
        this.lastAttackTime += deltaTime;
        if (this.lastAttackTime >= this.attackSpeed) {
            this.lastAttackTime = 0;
            if (this.target.health !== undefined) {
                this.target.health -= this.damage;
                game.showEffect(this.target.x || this.x, this.y - 20, `-${this.damage}`, '#ff4757');
            }
        }
    }
    
    draw(ctx) {
        const color = this.team === 'player' ? '#3498db' : '#e74c3c';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y - 40, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 28);
        ctx.lineTo(this.x, this.y - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 5);
        ctx.lineTo(this.x - 10 - legOffset, this.y + 15);
        ctx.moveTo(this.x, this.y - 5);
        ctx.lineTo(this.x + 10 + legOffset, this.y + 15);
        ctx.stroke();
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 15, this.y - 60, 30, 5);
        ctx.fillStyle = this.team === 'player' ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(this.x - 15, this.y - 60, 30 * healthPercent, 5);
    }
}

class Miner extends Unit {
    constructor(x, y, team, config) {
        super(x, y, team, config);
        this.type = 'miner';
        this.goldPerSecond = config.goldPerSecond;
        this.mining = true;
    }
    
    update(deltaTime, enemies, enemyCastle, game) {
        this.animTimer += deltaTime;
        if (this.animTimer >= 200) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }
    
    draw(ctx) {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y - 40, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 28);
        ctx.lineTo(this.x, this.y - 5);
        ctx.stroke();
        
        ctx.strokeStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y - 20);
        ctx.lineTo(this.x - 20, this.y - 10 + Math.sin(this.animFrame) * 5);
        ctx.stroke();
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('⛏️ +5', this.x - 20, this.y - 55);
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 15, this.y - 65, 30, 5);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(this.x - 15, this.y - 65, 30 * healthPercent, 5);
    }
}

class Soldier extends Unit {
    constructor(x, y, team, config) {
        super(x, y, team, config);
        this.type = 'soldier';
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x + (this.team === 'player' ? 5 : -5), this.y - 15);
        ctx.lineTo(this.x + (this.team === 'player' ? 25 : -25), this.y - 30);
        ctx.stroke();
        
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + (this.team === 'player' ? 25 : -25), this.y - 30);
        ctx.lineTo(this.x + (this.team === 'player' ? 30 : -30), this.y - 38);
        ctx.stroke();
    }
}

class Archer extends Unit {
    constructor(x, y, team, config) {
        super(x, y, team, config);
        this.type = 'archer';
    }
    
    attack(game, deltaTime) {
        this.lastAttackTime += deltaTime;
        if (this.lastAttackTime >= this.attackSpeed) {
            this.lastAttackTime = 0;
            const targetX = this.target.x || (this.team === 'player' ? 1100 : 50);
            game.projectiles.push(new Arrow(
                this.x,
                this.y - 20,
                targetX,
                this.target.y || this.y - 20,
                this.damage,
                this.team
            ));
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const dir = this.team === 'player' ? 1 : -1;
        ctx.arc(this.x + dir * 15, this.y - 20, 15, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + dir * 15, this.y - 35);
        ctx.lineTo(this.x + dir * 5, this.y - 20);
        ctx.lineTo(this.x + dir * 15, this.y - 5);
        ctx.stroke();
    }
}

class Wizard extends Unit {
    constructor(x, y, team, config) {
        super(x, y, team, config);
        this.type = 'wizard';
        this.aoe = config.aoe;
    }
    
    attack(game, deltaTime) {
        this.lastAttackTime += deltaTime;
        if (this.lastAttackTime >= this.attackSpeed) {
            this.lastAttackTime = 0;
            const targetX = this.target.x || (this.team === 'player' ? 1100 : 50);
            game.projectiles.push(new MagicBall(
                this.x,
                this.y - 25,
                targetX,
                this.target.y || this.y - 25,
                this.damage,
                this.team,
                this.aoe
            ));
        }
    }
    
    draw(ctx) {
        const color = this.team === 'player' ? '#9b59b6' : '#8e44ad';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y - 40, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y - 45);
        ctx.lineTo(this.x, this.y - 70);
        ctx.lineTo(this.x + 15, this.y - 45);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 28);
        ctx.lineTo(this.x, this.y - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 5);
        ctx.lineTo(this.x - 10 - legOffset, this.y + 15);
        ctx.moveTo(this.x, this.y - 5);
        ctx.lineTo(this.x + 10 + legOffset, this.y + 15);
        ctx.stroke();
        
        ctx.strokeStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(this.x + (this.team === 'player' ? 5 : -5), this.y - 25);
        ctx.lineTo(this.x + (this.team === 'player' ? 20 : -20), this.y - 10);
        ctx.stroke();
        
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.x + (this.team === 'player' ? 22 : -22), this.y - 12, 5, 0, Math.PI * 2);
        ctx.fill();
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 15, this.y - 80, 30, 5);
        ctx.fillStyle = this.team === 'player' ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(this.x - 15, this.y - 80, 30 * healthPercent, 5);
    }
}

class Projectile {
    constructor(x, y, targetX, targetY, damage, team) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.team = team;
        this.speed = 8;
        this.active = true;
        
        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }
}

class Arrow extends Projectile {
    constructor(x, y, targetX, targetY, damage, team) {
        super(x, y, targetX, targetY, damage, team);
    }
    
    draw(ctx) {
        const angle = Math.atan2(this.vy, this.vx);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-5, -4);
        ctx.lineTo(-5, 4);
        ctx.fill();
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-20, -5);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-20, 5);
        ctx.fill();
        
        ctx.restore();
    }
}

class MagicBall extends Projectile {
    constructor(x, y, targetX, targetY, damage, team, aoe) {
        super(x, y, targetX, targetY, damage, team);
        this.aoe = aoe;
        this.aoeRadius = 60;
    }
    
    update() {
        super.update();
        
        const enemies = this.team === 'player' ? game.enemyUnits : game.playerUnits;
        enemies.forEach(enemy => {
            const dist = Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2));
            if (dist < 20) {
                enemies.forEach(e => {
                    const aoeDist = Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2));
                    if (aoeDist < this.aoeRadius) {
                        e.health -= this.damage * (1 - aoeDist / this.aoeRadius * 0.5);
                    }
                });
                
                const enemyCastle = this.team === 'player' ? game.enemyCastle : game.playerCastle;
                const castleDist = Math.abs(enemyCastle.x + 40 - this.x);
                if (castleDist < this.aoeRadius) {
                    enemyCastle.health -= this.damage;
                }
                
                game.effects.push({ x: this.x, y: this.y, radius: 0, maxRadius: this.aoeRadius, isExplosion: true, life: 300 });
                this.active = false;
            }
        });
    }
    
    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 15);
        gradient.addColorStop(0, 'rgba(155, 89, 182, 1)');
        gradient.addColorStop(0.5, 'rgba(155, 89, 182, 0.5)');
        gradient.addColorStop(1, 'rgba(155, 89, 182, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

const game = new Game();
game.draw();

const originalUpdate = game.update.bind(game);
game.update = function(deltaTime) {
    originalUpdate(deltaTime);
    
    this.projectiles.forEach(proj => {
        if (proj instanceof Arrow && proj.active) {
            const enemies = proj.team === 'player' ? this.enemyUnits : this.playerUnits;
            enemies.forEach(enemy => {
                const dist = Math.sqrt(Math.pow(enemy.x - proj.x, 2) + Math.pow(enemy.y - proj.y, 2));
                if (dist < 25) {
                    enemy.health -= proj.damage;
                    this.showEffect(enemy.x, enemy.y - 20, `-${proj.damage}`, '#ff4757');
                    proj.active = false;
                }
            });
            
            const enemyCastle = proj.team === 'player' ? this.enemyCastle : this.playerCastle;
            if (proj.x > enemyCastle.x && proj.x < enemyCastle.x + enemyCastle.width &&
                proj.y > enemyCastle.y && proj.y < enemyCastle.y + enemyCastle.height) {
                enemyCastle.health -= proj.damage;
                proj.active = false;
            }
        }
    });
    
    this.effects = this.effects.filter(effect => {
        if (effect.isExplosion) {
            effect.radius += 3;
            return effect.radius < effect.maxRadius;
        }
        return effect.life > 0;
    });
};

const originalDraw = game.draw.bind(game);
game.draw = function() {
    originalDraw();
    
    this.effects.forEach(effect => {
        if (effect.isExplosion) {
            const alpha = 1 - effect.radius / effect.maxRadius;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    });
};