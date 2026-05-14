class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.gameSpeed = 6;
        this.baseSpeed = 6;
        this.maxSpeed = 15;
        
        this.groundY = this.canvas.height - 100;
        
        this.player = null;
        this.obstacles = [];
        this.particles = [];
        this.backgroundLayers = [];
        
        this.obstacleTimer = 0;
        this.obstacleInterval = 120;
        
        this.keys = {};
        
        this.init();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.groundY = this.canvas.height - 100;
    }
    
    init() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn2').addEventListener('click', () => this.restart());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRules());
        document.getElementById('closeModal').addEventListener('click', () => this.hideRules());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') this.hideRules();
        });
        
        this.createBackground();
    }
    
    createBackground() {
        this.backgroundLayers = [
            { color: '#0d1117', speed: 0.1, offset: 0, stars: this.createStars(50) },
            { color: '#161b22', speed: 0.3, offset: 0, buildings: this.createBuildings(8, 0.3) },
            { color: '#21262d', speed: 0.6, offset: 0, buildings: this.createBuildings(12, 0.6) }
        ];
    }
    
    createStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.canvas.width * 2,
                y: Math.random() * this.canvas.height * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.3
            });
        }
        return stars;
    }
    
    createBuildings(count, scale) {
        const buildings = [];
        let x = 0;
        for (let i = 0; i < count; i++) {
            buildings.push({
                x: x,
                width: Math.random() * 80 + 60,
                height: (Math.random() * 200 + 100) * scale,
                windows: Math.floor(Math.random() * 8) + 4
            });
            x += buildings[i].width + Math.random() * 50 + 20;
        }
        return buildings;
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        if (!this.isRunning) return;
        
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
            this.player.jump();
        }
        if (e.code === 'KeyS' || e.code === 'ArrowDown') {
            this.player.roll();
        }
        if (e.code === 'KeyD' || e.code === 'ArrowRight') {
            this.player.climb();
        }
        if (e.code === 'Escape') {
            this.togglePause();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    start() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'flex';
        this.reset();
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop();
    }

    goHome() {
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('pauseBtn').textContent = '暂停';
        this.reset();
        this.render();
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
        if (!this.isPaused) {
            this.gameLoop();
        }
    }

    showRules() {
        if (this.isRunning && !this.isPaused) {
            this.togglePause();
        }
        document.getElementById('modalOverlay').style.display = 'flex';
    }

    hideRules() {
        document.getElementById('modalOverlay').style.display = 'none';
    }
    
    restart() {
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'flex';
        document.getElementById('pauseBtn').textContent = '暂停';
        this.reset();
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop();
    }
    
    reset() {
        this.score = 0;
        this.gameSpeed = this.baseSpeed;
        this.obstacles = [];
        this.particles = [];
        this.obstacleTimer = 0;
        this.player = new Player(this);
        this.updateScore();
    }
    
    gameOver() {
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('finalScore').textContent = `分数: ${this.score}`;
        document.getElementById('gameOverScreen').style.display = 'flex';
        
        for (let i = 0; i < 50; i++) {
            this.particles.push(new DeathParticle(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2
            ));
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = `分数: ${this.score}`;
    }
    
    spawnObstacle() {
        const types = ['ground', 'low', 'high', 'wall'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const obstacle = new Obstacle(this, type);
        this.obstacles.push(obstacle);
    }
    
    addParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    update() {
        if (this.isPaused) {
            return;
        }
        if (!this.isRunning) {
            this.updateParticles();
            return;
        }
        
        this.score++;
        this.updateScore();
        
        this.gameSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.score / 500);
        
        this.player.update();
        
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = Math.random() * 60;
            this.obstacleInterval = Math.max(60, 120 - this.score / 100);
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].update();
            
            if (this.checkCollision(this.player, this.obstacles[i])) {
                if (!this.player.isInvincible) {
                    this.gameOver();
                    return;
                }
            }
            
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
        
        this.updateParticles();
        this.updateBackground();
        
        if (this.player.isRunning && Math.random() < 0.3) {
            this.addParticles(
                this.player.x,
                this.player.y + this.player.height,
                1,
                '#f0883e'
            );
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateBackground() {
        this.backgroundLayers.forEach(layer => {
            layer.offset += this.gameSpeed * layer.speed;
        });
    }
    
    checkCollision(player, obstacle) {
        if (player.isRolling && obstacle.type === 'high') {
            return false;
        }
        if (player.isClimbing && obstacle.type === 'wall') {
            return false;
        }
        
        const px = player.x + player.collisionBox.x;
        const py = player.y + player.collisionBox.y;
        const pw = player.collisionBox.width;
        const ph = player.collisionBox.height;
        
        const ox = obstacle.x + obstacle.collisionBox.x;
        const oy = obstacle.y + obstacle.collisionBox.y;
        const ow = obstacle.collisionBox.width;
        const oh = obstacle.collisionBox.height;
        
        return px < ox + ow &&
               px + pw > ox &&
               py < oy + oh &&
               py + ph > oy;
    }
    
    render() {
        this.ctx.fillStyle = '#0d1117';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderBackground();
        this.renderGround();
        
        this.obstacles.forEach(obstacle => obstacle.render());
        
        if (this.player) {
            this.player.render();
        }
        
        this.particles.forEach(particle => particle.render(this.ctx));
        
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#f0883e';
            this.ctx.font = 'bold 48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#f0883e';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '20px monospace';
            this.ctx.fillStyle = '#8b949e';
            this.ctx.shadowBlur = 0;
            this.ctx.fillText('按 ESC 或点击"继续"按钮继续游戏', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
        
        this.renderVignette();
    }
    
    renderBackground() {
        this.backgroundLayers.forEach((layer, index) => {
            this.ctx.fillStyle = layer.color;
            
            if (layer.stars) {
                layer.stars.forEach(star => {
                    const x = (star.x - layer.offset) % (this.canvas.width * 2);
                    this.ctx.globalAlpha = star.alpha;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(x, star.y, star.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                this.ctx.globalAlpha = 1;
            }
            
            if (layer.buildings) {
                layer.buildings.forEach(building => {
                    const x = (building.x - layer.offset * 50) % (this.canvas.width + 500) - 100;
                    const y = this.groundY - building.height;
                    
                    this.ctx.fillStyle = layer.color;
                    this.ctx.fillRect(x, y, building.width, building.height);
                    
                    this.ctx.fillStyle = index === 1 ? '#f0883e33' : '#58a6ff22';
                    const windowSize = 8;
                    const windowGap = 15;
                    for (let wy = 10; wy < building.height - 10; wy += windowGap) {
                        for (let wx = 10; wx < building.width - 10; wx += windowGap) {
                            if (Math.random() > 0.3) {
                                this.ctx.fillRect(x + wx, y + wy, windowSize, windowSize);
                            }
                        }
                    }
                });
            }
        });
    }
    
    renderGround() {
        const gradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.canvas.height);
        gradient.addColorStop(0, '#30363d');
        gradient.addColorStop(1, '#0d1117');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        this.ctx.strokeStyle = '#f0883e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#484f58';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            const offset = (i + this.gameSpeed * 10) % 50;
            this.ctx.beginPath();
            this.ctx.moveTo(i - offset, this.groundY + 5);
            this.ctx.lineTo(i - offset + 20, this.groundY + 5);
            this.ctx.stroke();
        }
    }
    
    renderVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height / 3,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (this.isRunning || this.particles.length > 0) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 70;
        this.x = 150;
        this.y = game.groundY - this.height;
        
        this.velocityY = 0;
        this.gravity = 0.8;
        this.jumpForce = -18;
        
        this.isJumping = false;
        this.canDoubleJump = true;
        this.isRolling = false;
        this.rollTimer = 0;
        this.isClimbing = false;
        this.climbTimer = 0;
        this.isRunning = true;
        this.isInvincible = false;
        
        this.animFrame = 0;
        this.animTimer = 0;
        
        this.collisionBox = {
            x: 5,
            y: 5,
            width: 30,
            height: 60
        };
        
        this.trail = [];
    }
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
            this.canDoubleJump = true;
            this.game.addParticles(this.x + this.width / 2, this.y + this.height, 8, '#f0883e');
        } else if (this.canDoubleJump) {
            this.velocityY = this.jumpForce * 0.85;
            this.canDoubleJump = false;
            this.game.addParticles(this.x + this.width / 2, this.y + this.height / 2, 12, '#58a6ff');
        }
    }
    
    roll() {
        if (!this.isRolling && !this.isJumping) {
            this.isRolling = true;
            this.rollTimer = 40;
            this.height = 35;
            this.y = this.game.groundY - this.height;
            this.updateCollisionBox();
            this.game.addParticles(this.x + this.width / 2, this.y + this.height, 6, '#d29922');
        }
    }
    
    climb() {
        if (this.isJumping && !this.isClimbing) {
            this.isClimbing = true;
            this.climbTimer = 30;
            this.velocityY = -3;
            this.isInvincible = true;
            this.game.addParticles(this.x + this.width, this.y + this.height / 2, 8, '#a371f7');
        }
    }
    
    updateCollisionBox() {
        if (this.isRolling) {
            this.collisionBox = { x: 5, y: 5, width: 30, height: 25 };
        } else {
            this.collisionBox = { x: 5, y: 5, width: 30, height: 60 };
        }
    }
    
    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        const groundLevel = this.game.groundY - this.height;
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;
            this.isJumping = false;
            this.canDoubleJump = true;
        }
        
        if (this.isRolling) {
            this.rollTimer--;
            if (this.rollTimer <= 0) {
                this.isRolling = false;
                this.height = 70;
                this.y = this.game.groundY - this.height;
                this.updateCollisionBox();
            }
        }
        
        if (this.isClimbing) {
            this.climbTimer--;
            if (this.climbTimer <= 0) {
                this.isClimbing = false;
                this.isInvincible = false;
            }
        }
        
        this.animTimer++;
        if (this.animTimer >= 5) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
        
        this.trail.unshift({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) {
            this.trail.pop();
        }
        this.trail.forEach(t => t.alpha *= 0.85);
    }
    
    render() {
        const ctx = this.game.ctx;
        
        this.trail.forEach((t, i) => {
            ctx.globalAlpha = t.alpha * 0.3;
            ctx.fillStyle = this.isClimbing ? '#a371f7' : '#f0883e';
            ctx.fillRect(t.x + 10, t.y + 10, this.width - 20, this.height - 20);
        });
        ctx.globalAlpha = 1;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        if (this.isRolling) {
            ctx.rotate((40 - this.rollTimer) * 0.3);
        }
        
        ctx.shadowColor = this.isClimbing ? '#a371f7' : '#f0883e';
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = '#f0883e';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 4);
        ctx.fillRect(-this.width / 2, -this.height / 2, 4, this.height);
        
        if (!this.isRolling) {
            ctx.fillStyle = '#58a6ff';
            ctx.shadowColor = '#58a6ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(-8, -this.height / 2 + 15, 16, 6);
            
            ctx.shadowBlur = 0;
            const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 8;
            ctx.fillStyle = '#2d2d44';
            ctx.fillRect(-10, this.height / 2 - 15, 8, 15 + legOffset);
            ctx.fillRect(2, this.height / 2 - 15, 8, 15 - legOffset);
        }
        
        if (this.isClimbing) {
            ctx.fillStyle = '#a371f7';
            ctx.beginPath();
            ctx.moveTo(this.width / 2, -this.height / 2);
            ctx.lineTo(this.width / 2 + 15, 0);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class Obstacle {
    constructor(game, type) {
        this.game = game;
        this.type = type;
        this.x = game.canvas.width + 50;
        
        switch (type) {
            case 'ground':
                this.width = 30;
                this.height = 50;
                this.y = game.groundY - this.height;
                this.collisionBox = { x: 5, y: 5, width: 20, height: 40 };
                break;
            case 'low':
                this.width = 60;
                this.height = 30;
                this.y = game.groundY - this.height;
                this.collisionBox = { x: 5, y: 5, width: 50, height: 20 };
                break;
            case 'high':
                this.width = 35;
                this.height = 80;
                this.y = game.groundY - this.height - 20;
                this.collisionBox = { x: 5, y: 10, width: 25, height: 60 };
                break;
            case 'wall':
                this.width = 25;
                this.height = game.groundY - 50;
                this.y = 50;
                this.collisionBox = { x: 5, y: 0, width: 15, height: this.height };
                break;
        }
    }
    
    update() {
        this.x -= this.game.gameSpeed;
    }
    
    render() {
        const ctx = this.game.ctx;
        
        ctx.save();
        
        ctx.shadowColor = '#da3633';
        ctx.shadowBlur = 15;
        
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#2d2d44');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y);
        ctx.lineTo(this.x + this.width - 5, this.y);
        ctx.lineTo(this.x + this.width, this.y + 5);
        ctx.lineTo(this.x + this.width, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width - 5, this.y + this.height);
        ctx.lineTo(this.x + 5, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height - 5);
        ctx.lineTo(this.x, this.y + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#da3633';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#da3633';
        ctx.shadowBlur = 5;
        
        if (this.type === 'high') {
            ctx.fillRect(this.x + this.width / 2 - 2, this.y, 4, 15);
            ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height - 15, 4, 15);
        } else if (this.type === 'wall') {
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(this.x + 8, this.y + 20 + i * 40, 10, 3);
            }
        } else {
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 3);
        }
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 6 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.2;
        this.life -= this.decay;
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class DeathParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5;
        this.speedX = (Math.random() - 0.5) * 20;
        this.speedY = (Math.random() - 0.5) * 20;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
        this.life = 1;
        this.decay = 0.015;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.5;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = Math.random() > 0.5 ? '#f0883e' : '#da3633';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

const game = new Game();