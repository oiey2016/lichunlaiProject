class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = GameConfig.canvasWidth;
        this.canvas.height = GameConfig.canvasHeight;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        
        this.score = 0;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.enemiesPerWave = 5;
        this.isRunning = false;
        this.isGameOver = false;
        
        this.lastSpawnTime = 0;
        this.spawnInterval = GameConfig.enemySpawnRate;
        this.isPaused = false;
        
        this.setupUI();
        this.setupPauseControls();
    }
    
    setupUI() {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        
        startBtn.addEventListener('click', () => this.start());
        restartBtn.addEventListener('click', () => this.restart());
        resumeBtn.addEventListener('click', () => this.togglePause());
    }
    
    setupPauseControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning && !this.isGameOver) return;
            
            if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
                this.togglePause();
            }
        });
    }
    
    togglePause() {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        document.getElementById('pauseScreen').style.display = this.isPaused ? 'flex' : 'none';
    }
    
    start() {
        this.player = new Player(GameConfig.canvasWidth / 2, GameConfig.canvasHeight / 2);
        this.player.setupInput(this.canvas);
        
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.score = 0;
        this.wave = 1;
        this.enemiesKilled = 0;
        this.isRunning = true;
        this.isGameOver = false;
        this.isPaused = false;
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameUI').style.display = 'flex';
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        
        this.updateUI();
        this.gameLoop();
    }
    
    restart() {
        this.start();
    }
    
    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = this.score;
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('waveValue').textContent = this.wave;
        
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthBar').style.width = `${healthPercent}%`;
    }
    
    spawnEnemy() {
        const side = randomInt(0, 3);
        let x, y;
        
        switch (side) {
            case 0: x = randomRange(0, GameConfig.canvasWidth); y = -30; break;
            case 1: x = GameConfig.canvasWidth + 30; y = randomRange(0, GameConfig.canvasHeight); break;
            case 2: x = randomRange(0, GameConfig.canvasWidth); y = GameConfig.canvasHeight + 30; break;
            case 3: x = -30; y = randomRange(0, GameConfig.canvasHeight); break;
        }
        
        const isBoss = this.wave % 5 === 0 && this.enemies.length === 0;
        const enemy = new Enemy(x, y, isBoss ? 'boss' : 'normal');
        this.enemies.push(enemy);
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    checkWaveProgress() {
        if (this.enemiesKilled >= this.enemiesPerWave) {
            this.wave++;
            this.enemiesKilled = 0;
            this.enemiesPerWave += GameConfig.waveEnemyIncrease;
            this.spawnInterval = Math.max(800, this.spawnInterval - 100);
            this.updateUI();
            
            this.createParticles(
                GameConfig.canvasWidth / 2, 
                GameConfig.canvasHeight / 2, 
                Colors.score, 
                30
            );
        }
    }
    
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        this.player.update();
        
        this.enemies.forEach(enemy => enemy.update());
        
        this.bullets.forEach(bullet => bullet.update());
        
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        const now = Date.now();
        if (now - this.lastSpawnTime > this.spawnInterval) {
            if (this.enemies.length < this.enemiesPerWave - this.enemiesKilled + 2) {
                this.spawnEnemy();
            }
            this.lastSpawnTime = now;
        }
        
        this.checkWaveProgress();
        this.updateUI();
    }
    
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            GameConfig.canvasWidth / 2, 
            GameConfig.canvasHeight / 2, 
            0,
            GameConfig.canvasWidth / 2, 
            GameConfig.canvasHeight / 2, 
            GameConfig.canvasWidth / 2
        );
        gradient.addColorStop(0, '#2d3436');
        gradient.addColorStop(1, '#1e272e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GameConfig.canvasWidth, GameConfig.canvasHeight);
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        
        for (let x = 0; x <= GameConfig.canvasWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, GameConfig.canvasHeight);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= GameConfig.canvasHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(GameConfig.canvasWidth, y);
            this.ctx.stroke();
        }
    }
    
    draw() {
        this.drawBackground();
        
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        this.player.draw(this.ctx);
    }
    
    gameLoop() {
        if (!this.isRunning && !this.isGameOver) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

const game = new Game();
