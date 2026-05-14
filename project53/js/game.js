class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.lineManager = new LineManager();
        this.waterSystem = new WaterSystem();
        this.levelManager = new LevelManager();
        
        this.currentLevel = null;
        this.gameState = 'playing';
        this.hasWon = false;
        
        this.init();
    }
    
    init() {
        this.loadLevel();
        this.setupEventListeners();
        this.startWaterSpawn();
        this.gameLoop();
    }
    
    loadLevel() {
        this.currentLevel = this.levelManager.getCurrentLevel();
        this.waterSystem.setSpawner(
            this.currentLevel.spawner.x,
            this.currentLevel.spawner.y,
            this.currentLevel.spawner.width
        );
        this.lineManager.clear();
        this.waterSystem.clear();
        this.hasWon = false;
        this.gameState = 'playing';
        
        document.getElementById('level-number').textContent = this.levelManager.getLevelNumber();
        document.getElementById('game-message').classList.add('hidden');
    }
    
    startWaterSpawn() {
        setTimeout(() => {
            this.waterSystem.startSpawning();
        }, Config.game.waterSpawnDelay);
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());
        
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        document.getElementById('close-rules-btn').addEventListener('click', () => this.hideRules());
    }
    
    showRules() {
        document.getElementById('rules-modal').classList.remove('hidden');
    }
    
    hideRules() {
        document.getElementById('rules-modal').classList.add('hidden');
    }
    
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    getTouchPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const touch = e.touches[0];
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }
    
    handleMouseDown(e) {
        if (this.gameState !== 'playing') return;
        const pos = this.getMousePosition(e);
        this.lineManager.startDrawing(pos.x, pos.y);
    }
    
    handleMouseMove(e) {
        if (this.gameState !== 'playing') return;
        const pos = this.getMousePosition(e);
        this.lineManager.continueDrawing(pos.x, pos.y);
    }
    
    handleMouseUp() {
        this.lineManager.endDrawing();
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (this.gameState !== 'playing') return;
        const pos = this.getTouchPosition(e);
        this.lineManager.startDrawing(pos.x, pos.y);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.gameState !== 'playing') return;
        const pos = this.getTouchPosition(e);
        this.lineManager.continueDrawing(pos.x, pos.y);
    }
    
    restart() {
        this.loadLevel();
        this.startWaterSpawn();
    }
    
    nextLevel() {
        this.levelManager.nextLevel();
        this.loadLevel();
        this.startWaterSpawn();
    }
    
    checkWinCondition() {
        if (this.hasWon) return;
        
        if (this.currentLevel.glass.isFull()) {
            this.hasWon = true;
            this.gameState = 'won';
            
            setTimeout(() => {
                this.showWinMessage();
            }, Config.game.winDelay);
        }
    }
    
    showWinMessage() {
        document.getElementById('game-message').classList.remove('hidden');
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        const lineSegments = this.lineManager.getAllSegments();
        const glassSegments = this.currentLevel.glass.getCollisionSegments();
        
        const obstacleSegments = [];
        for (const obstacle of this.currentLevel.obstacles) {
            obstacleSegments.push(
                { start: { x: obstacle.x, y: obstacle.y }, end: { x: obstacle.x + obstacle.width, y: obstacle.y } },
                { start: { x: obstacle.x, y: obstacle.y + obstacle.height }, end: { x: obstacle.x + obstacle.width, y: obstacle.y + obstacle.height } },
                { start: { x: obstacle.x, y: obstacle.y }, end: { x: obstacle.x, y: obstacle.y + obstacle.height } },
                { start: { x: obstacle.x + obstacle.width, y: obstacle.y }, end: { x: obstacle.x + obstacle.width, y: obstacle.y + obstacle.height } }
            );
        }
        
        const allSegments = [...lineSegments, ...glassSegments, ...obstacleSegments];
        
        this.waterSystem.update(lineSegments, allSegments, this.currentLevel.glass);
        this.waterSystem.updateGlassStatus(this.currentLevel.glass);
        
        const fillPercentage = Math.round(this.currentLevel.glass.getFillPercentage());
        document.getElementById('water-percentage').textContent = fillPercentage + '%';
        
        this.checkWinCondition();
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawObstacles(this.currentLevel.obstacles);
        this.renderer.drawSpawner(this.currentLevel.spawner);
        this.renderer.drawGlass(this.currentLevel.glass);
        this.renderer.drawLines(this.lineManager);
        this.renderer.drawWater(this.waterSystem);
        this.renderer.drawUI(this.lineManager);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new Game();
});
