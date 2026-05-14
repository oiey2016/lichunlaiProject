class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        this.worldSize = 4000;
        this.minimapSize = 150;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.player = null;
        this.enemies = [];
        this.foods = [];
        this.camera = new Camera(this.canvas);
        
        this.gameRunning = false;
        this.lastTime = 0;
        
        this.setupEventListeners();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.minimapCanvas.width = this.minimapSize;
        this.minimapCanvas.height = this.minimapSize;
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartGameBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('homeBtn').addEventListener('click', () => this.goToHome());
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameRunning && this.player) {
                this.player.setTarget(e.clientX, e.clientY, this.camera);
            }
        });
    }

    startGame() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('leaderboard').classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');
        document.getElementById('gameButtons').classList.remove('hidden');
        
        this.initGame();
        this.gameRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restartGame() {
        this.initGame();
    }

    goToHome() {
        this.gameRunning = false;
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('leaderboard').classList.add('hidden');
        document.getElementById('minimap').classList.add('hidden');
        document.getElementById('gameButtons').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    }

    initGame() {
        this.player = new Player(this.worldSize / 2, this.worldSize / 2);
        this.enemies = [];
        this.foods = [];
        
        for (let i = 0; i < 500; i++) {
            this.spawnFood();
        }
        
        for (let i = 0; i < 15; i++) {
            this.spawnEnemy();
        }
    }

    spawnFood() {
        const x = Math.random() * this.worldSize;
        const y = Math.random() * this.worldSize;
        this.foods.push(new Food(x, y));
    }

    spawnEnemy() {
        let x, y;
        do {
            x = Math.random() * this.worldSize;
            y = Math.random() * this.worldSize;
        } while (Math.abs(x - this.player.pos.x) < 500 && Math.abs(y - this.player.pos.y) < 500);
        
        const mass = 5 + Math.random() * 50;
        this.enemies.push(new AI(x, y, mass));
    }

    gameLoop(currentTime = 0) {
        if (!this.gameRunning) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update();
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update() {
        for (const food of this.foods) {
            food.update();
        }
        
        this.player.update();
        this.constrainToWorld(this.player);
        
        for (const enemy of this.enemies) {
            enemy.updateAI(this.foods, this.enemies, this.player, this.worldSize);
        }
        
        this.checkCollisions();
        
        while (this.foods.length < 500) {
            this.spawnFood();
        }
        
        while (this.enemies.length < 15) {
            this.spawnEnemy();
        }
        
        this.camera.follow(this.player);
        this.camera.update();
        
        this.updateUI();
    }

    constrainToWorld(cell) {
        const margin = cell.radius;
        if (cell.pos.x < margin) cell.pos.x = margin;
        if (cell.pos.x > this.worldSize - margin) cell.pos.x = this.worldSize - margin;
        if (cell.pos.y < margin) cell.pos.y = margin;
        if (cell.pos.y > this.worldSize - margin) cell.pos.y = this.worldSize - margin;
    }

    checkCollisions() {
        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (this.player.canEat(food)) {
                this.player.addMass(food.mass);
                this.foods.splice(i, 1);
            }
        }
        
        for (const enemy of this.enemies) {
            for (let i = this.foods.length - 1; i >= 0; i--) {
                const food = this.foods[i];
                if (enemy.canEat(food)) {
                    enemy.addMass(food.mass);
                    this.foods.splice(i, 1);
                }
            }
        }
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.player.canEat(enemy)) {
                this.player.addMass(enemy.mass * 0.8);
                this.player.addKill();
                this.enemies.splice(i, 1);
            } else if (enemy.canEat(this.player)) {
                this.gameOver();
                return;
            }
        }
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (i === j) continue;
                const a = this.enemies[i];
                const b = this.enemies[j];
                if (a && b && a.canEat(b)) {
                    a.addMass(b.mass * 0.8);
                    this.enemies.splice(j, 1);
                    if (j < i) i--;
                }
            }
        }
    }

    updateUI() {
        document.getElementById('massDisplay').textContent = Math.floor(this.player.mass);
        document.getElementById('killsDisplay').textContent = this.player.kills;
        
        const allCells = [this.player, ...this.enemies];
        allCells.sort((a, b) => b.mass - a.mass);
        
        const playerRank = allCells.indexOf(this.player) + 1;
        document.getElementById('rankDisplay').textContent = '#' + playerRank;
        
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        const topCells = allCells.slice(0, 10);
        for (let i = 0; i < topCells.length; i++) {
            const cell = topCells[i];
            const li = document.createElement('li');
            if (cell === this.player) {
                li.classList.add('player');
            }
            li.innerHTML = `<span>${cell.name}</span><span class="mass">${Math.floor(cell.mass)}</span>`;
            leaderboardList.appendChild(li);
        }
    }

    gameOver() {
        this.gameRunning = false;
        
        const allCells = [this.player, ...this.enemies];
        allCells.sort((a, b) => b.mass - a.mass);
        const playerRank = allCells.indexOf(this.player) + 1;
        
        document.getElementById('finalMass').textContent = Math.floor(this.player.mass);
        document.getElementById('finalRank').textContent = '#' + playerRank;
        document.getElementById('finalKills').textContent = this.player.kills;
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('leaderboard').classList.add('hidden');
        document.getElementById('minimap').classList.add('hidden');
        document.getElementById('gameButtons').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderGrid();
        
        const renderList = [...this.foods, ...this.enemies, this.player];
        renderList.sort((a, b) => a.radius - b.radius);
        
        for (const obj of renderList) {
            obj.render(this.ctx, this.camera);
        }
        
        this.renderMinimap();
    }

    renderGrid() {
        const gridSize = 100;
        const start = this.camera.screenToWorld(new Vector(0, 0));
        const end = this.camera.screenToWorld(new Vector(this.canvas.width, this.canvas.height));
        
        const startX = Math.floor(start.x / gridSize) * gridSize;
        const startY = Math.floor(start.y / gridSize) * gridSize;
        
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = startX; x < end.x; x += gridSize) {
            const screenX = this.camera.worldToScreen(new Vector(x, 0)).x;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, 0);
            this.ctx.lineTo(screenX, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = startY; y < end.y; y += gridSize) {
            const screenY = this.camera.worldToScreen(new Vector(0, y)).y;
            this.ctx.beginPath();
            this.ctx.moveTo(0, screenY);
            this.ctx.lineTo(this.canvas.width, screenY);
            this.ctx.stroke();
        }
        
        const borderPos1 = this.camera.worldToScreen(new Vector(0, 0));
        const borderPos2 = this.camera.worldToScreen(new Vector(this.worldSize, this.worldSize));
        
        this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            borderPos1.x, borderPos1.y,
            borderPos2.x - borderPos1.x,
            borderPos2.y - borderPos1.y
        );
    }

    renderMinimap() {
        const scale = this.minimapSize / this.worldSize;
        
        this.minimapCtx.clearRect(0, 0, this.minimapSize, this.minimapSize);
        
        this.minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.minimapCtx.fillRect(0, 0, this.minimapSize, this.minimapSize);
        
        for (const food of this.foods) {
            food.renderMinimap(this.minimapCtx, scale);
        }
        
        for (const enemy of this.enemies) {
            enemy.renderMinimap(this.minimapCtx, scale);
        }
        
        this.player.renderMinimap(this.minimapCtx, scale);
        
        const viewX = (this.camera.pos.x - this.canvas.width / 2 / this.camera.scale) * scale;
        const viewY = (this.camera.pos.y - this.canvas.height / 2 / this.camera.scale) * scale;
        const viewW = (this.canvas.width / this.camera.scale) * scale;
        const viewH = (this.canvas.height / this.camera.scale) * scale;
        
        this.minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(viewX, viewY, viewW, viewH);
    }
}
