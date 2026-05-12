class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        this.gameState = 'start';
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameSpeed = 3;
        this.baseSpeed = 3;
        
        this.ball = null;
        this.obstacles = [];
        this.pathTiles = [];
        this.particles = [];
        
        this.cameraX = 0;
        this.lastObstacleX = 0;
        this.tileSize = 80;
        
        this.bindEvents();
    }
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.groundY = this.canvas.height * 0.7;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        const jumpAction = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return;
            e.preventDefault();
            
            if (this.gameState === 'playing') {
                this.ball.jump();
            }
        };
        
        this.canvas.addEventListener('click', jumpAction);
        this.canvas.addEventListener('touchstart', jumpAction);
        window.addEventListener('keydown', jumpAction);
        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.pause();
            }
        });
    }
    
    init() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.gameSpeed = this.baseSpeed;
        this.cameraX = 0;
        this.lastObstacleX = 0;
        this.obstacles = [];
        this.pathTiles = [];
        this.particles = [];
        
        this.ball = new Ball(150, this.groundY - 30, this);
        
        for (let i = 0; i < 20; i++) {
            this.addPathTile(i * this.tileSize);
        }
        
        this.updateUI();
    }
    
    start() {
        this.gameState = 'playing';
        this.init();
        this.hideAllScreens();
        this.gameLoop();
    }
    
    pause() {
        this.gameState = 'paused';
        document.getElementById('pause-screen').classList.add('active');
    }
    
    resume() {
        this.gameState = 'playing';
        this.hideAllScreens();
        this.gameLoop();
    }
    
    gameOver() {
        this.gameState = 'gameover';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('max-combo').textContent = this.maxCombo;
        document.getElementById('game-over-screen').classList.add('active');
        
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(
                this.ball.x,
                this.ball.y,
                this.ball.color
            ));
        }
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.cameraX += this.gameSpeed;
        
        this.ball.update();
        
        if (this.ball.y > this.canvas.height + 50) {
            this.gameOver();
            return;
        }
        
        const lastTile = this.pathTiles[this.pathTiles.length - 1];
        if (lastTile && lastTile.x - this.cameraX < this.canvas.width + 100) {
            this.addPathTile(lastTile.x + this.tileSize);
        }
        
        this.pathTiles = this.pathTiles.filter(tile => tile.x - this.cameraX > -200);
        
        if (this.lastObstacleX - this.cameraX < this.canvas.width) {
            this.addObstacle();
        }
        
        this.obstacles.forEach(obs => obs.update());
        this.obstacles = this.obstacles.filter(obs => obs.x - this.cameraX > -100);
        
        this.checkCollisions();
        
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);
        
        this.score += Math.floor(this.gameSpeed * 0.5);
        this.gameSpeed = Math.min(this.baseSpeed + this.score * 0.0001, 8);
        
        this.updateUI();
    }
    
    addPathTile(x) {
        this.pathTiles.push(new PathTile(x, this.groundY, this.tileSize));
    }
    
    addObstacle() {
        const minGap = 250;
        const maxGap = 500;
        const gap = minGap + Math.random() * (maxGap - minGap);
        const x = this.lastObstacleX + gap;
        
        const obstacleType = Math.random() > 0.5 ? 'spike' : 'block';
        this.obstacles.push(new Obstacle(x, this.groundY, obstacleType, this));
        this.lastObstacleX = x;
    }
    
    checkCollisions() {
        const ball = this.ball;
        
        for (const obs of this.obstacles) {
            if (obs.passed) continue;
            
            const dx = Math.abs(ball.x - (obs.x - this.cameraX));
            const dy = Math.abs(ball.y - obs.y);
            
            if (dx < ball.radius + obs.width / 2 && dy < ball.radius + obs.height / 2) {
                if (ball.isJumping && ball.vy > 0 && ball.y < obs.y) {
                    obs.passed = true;
                    this.combo++;
                    this.maxCombo = Math.max(this.maxCombo, this.combo);
                    this.score += 100 * this.combo;
                    
                    for (let i = 0; i < 15; i++) {
                        this.particles.push(new Particle(obs.x - this.cameraX, obs.y, '#64d8ff'));
                    }
                } else {
                    this.combo = 0;
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
    }
    
    render() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderBackground();
        
        this.pathTiles.forEach(tile => tile.render(ctx, this.cameraX));
        
        this.obstacles.forEach(obs => obs.render(ctx, this.cameraX));
        
        this.particles.forEach(p => p.render(ctx));
        
        this.ball.render(ctx);
    }
    
    renderBackground() {
        const ctx = this.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1b263b');
        gradient.addColorStop(1, '#0d1b2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = ((i * 73 + this.cameraX * 0.1) % this.canvas.width);
            const y = (i * 37) % (this.groundY - 50);
            const size = (i % 3) + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Ball {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.radius = 25;
        this.isJumping = false;
        this.jumpForce = -15;
        this.gravity = 0.6;
        this.groundY = y;
        this.color = '#64d8ff';
        this.trail = [];
    }
    
    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
            
            for (let i = 0; i < 8; i++) {
                this.game.particles.push(new Particle(this.x, this.y + this.radius, this.color));
            }
        }
    }
    
    update() {
        this.vy += this.gravity;
        this.y += this.vy;
        
        if (this.y >= this.groundY - this.radius) {
            this.y = this.groundY - this.radius;
            this.vy = 0;
            this.isJumping = false;
        }
        
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 10) {
            this.trail.shift();
        }
        
        this.trail.forEach(t => t.alpha *= 0.85);
    }
    
    render(ctx) {
        this.trail.forEach((t, i) => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius * (i / this.trail.length) * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 216, 255, ${t.alpha * 0.3})`;
            ctx.fill();
        });
        
        const gradient = ctx.createRadialGradient(
            this.x - 5, this.y - 5, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#a8e6ff');
        gradient.addColorStop(0.5, '#64d8ff');
        gradient.addColorStop(1, '#3dbbe0');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.shadowColor = '#64d8ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 8, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

class PathTile {
    constructor(x, groundY, size) {
        this.x = x;
        this.y = groundY;
        this.width = size;
        this.height = 20;
    }
    
    render(ctx, cameraX) {
        const screenX = this.x - cameraX;
        
        const gradient = ctx.createLinearGradient(screenX, this.y, screenX, this.y + this.height);
        gradient.addColorStop(0, '#415a77');
        gradient.addColorStop(1, '#1b263b');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#778da9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, this.y);
        ctx.lineTo(screenX + this.width, this.y);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(100, 216, 255, 0.3)';
        ctx.fillRect(screenX + 5, this.y + 2, this.width - 10, 3);
    }
}

class Obstacle {
    constructor(x, groundY, type, game) {
        this.game = game;
        this.x = x;
        this.type = type;
        this.passed = false;
        
        if (type === 'spike') {
            this.width = 40;
            this.height = 50;
            this.y = groundY - this.height;
        } else {
            this.width = 50;
            this.height = 40;
            this.y = groundY - this.height;
        }
    }
    
    update() {
        const screenX = this.x - this.game.cameraX;
        if (screenX < this.game.ball.x && !this.passed) {
            if (!this.game.ball.isJumping || this.game.ball.y > this.y) {
            }
        }
    }
    
    render(ctx, cameraX) {
        const screenX = this.x - cameraX;
        
        if (this.type === 'spike') {
            const gradient = ctx.createLinearGradient(screenX, this.y + this.height, screenX, this.y);
            gradient.addColorStop(0, '#e94560');
            gradient.addColorStop(1, '#ff6b6b');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(screenX, this.y + this.height);
            ctx.lineTo(screenX + this.width / 2, this.y);
            ctx.lineTo(screenX + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowColor = '#e94560';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            const gradient = ctx.createLinearGradient(screenX, this.y, screenX, this.y + this.height);
            gradient.addColorStop(0, '#f39c12');
            gradient.addColorStop(1, '#d68910');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX, this.y, this.width, this.height);
            
            ctx.shadowColor = '#f39c12';
            ctx.shadowBlur = 15;
            ctx.fillRect(screenX, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
            
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX, this.y, this.width, this.height);
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.size = 3 + Math.random() * 4;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life -= this.decay;
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}
