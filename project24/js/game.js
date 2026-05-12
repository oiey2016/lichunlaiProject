const CONFIG = {
    CANVAS_WIDTH: 900,
    CANVAS_HEIGHT: 600,
    
    LANE_COUNT: 3,
    LANE_WIDTH: 120,
    
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 80,
        SLIDE_HEIGHT: 40,
        JUMP_FORCE: -18,
        GRAVITY: 0.8,
        LANE_CHANGE_SPEED: 15
    },
    
    GAME: {
        INITIAL_SPEED: 8,
        MAX_SPEED: 20,
        SPEED_INCREMENT: 0.002,
        SCORE_PER_FRAME: 1,
        SPAWN_INTERVAL: 90
    },
    
    OBSTACLE: {
        WIDTH: 60,
        HEIGHT: 70,
        LOW_HEIGHT: 35
    },
    
    COLORS: {
        BACKGROUND: '#1a1a2e',
        GROUND: '#4a3728',
        LANE: '#5d4e37',
        LANE_LINE: '#8b7355',
        PLAYER: '#ff6b6b',
        PLAYER_DETAIL: '#ee5a5a',
        OBSTACLE: '#4ecdc4',
        OBSTACLE_LOW: '#ffe66d',
        COIN: '#ffd700'
    }
};

class InputHandler {
    constructor() {
        this.keys = {};
        this.keyJustPressed = {};
        
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keyJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    isKeyPressed(code) {
        return this.keys[code];
    }
    
    isKeyJustPressed(code) {
        const pressed = this.keyJustPressed[code];
        this.keyJustPressed[code] = false;
        return pressed;
    }
    
    getLaneChange() {
        if (this.isKeyJustPressed('ArrowLeft') || this.isKeyJustPressed('KeyA')) {
            return -1;
        }
        if (this.isKeyJustPressed('ArrowRight') || this.isKeyJustPressed('KeyD')) {
            return 1;
        }
        return 0;
    }
    
    wantsJump() {
        return this.isKeyJustPressed('ArrowUp') || 
               this.isKeyJustPressed('KeyW') || 
               this.isKeyJustPressed('Space');
    }
    
    wantsSlide() {
        return this.isKeyJustPressed('ArrowDown') || 
               this.isKeyJustPressed('KeyS');
    }
    
    reset() {
        this.keyJustPressed = {};
    }
}

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        this.normalHeight = CONFIG.PLAYER.HEIGHT;
        this.slideHeight = CONFIG.PLAYER.SLIDE_HEIGHT;
        
        this.currentLane = 1;
        this.targetLane = 1;
        
        const centerX = canvasWidth / 2;
        this.lanePositions = [
            centerX - CONFIG.LANE_WIDTH,
            centerX,
            centerX + CONFIG.LANE_WIDTH
        ];
        
        this.x = this.lanePositions[this.currentLane];
        this.y = canvasHeight - 150;
        this.groundY = this.y;
        
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.rotation = 0;
    }
    
    getLane() {
        return this.currentLane;
    }
    
    isSlidingState() {
        return this.isSliding;
    }
    
    isInAir() {
        return this.isJumping;
    }
    
    changeLane(direction) {
        const newLane = this.targetLane + direction;
        if (newLane >= 0 && newLane < CONFIG.LANE_COUNT) {
            this.targetLane = newLane;
        }
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.velocityY = CONFIG.PLAYER.JUMP_FORCE;
            this.isJumping = true;
        }
    }
    
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.height = this.slideHeight;
            this.y = this.groundY + (this.normalHeight - this.slideHeight);
            this.slideTimer = 60;
        }
    }
    
    update() {
        const targetX = this.lanePositions[this.targetLane];
        const dx = targetX - this.x;
        this.x += dx * 0.2;
        
        if (Math.abs(dx) < 1) {
            this.currentLane = this.targetLane;
        }
        
        if (this.isJumping) {
            this.velocityY += CONFIG.PLAYER.GRAVITY;
            this.y += this.velocityY;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }
        
        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.height = this.normalHeight;
                this.y = this.groundY;
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.height / 2);
        
        if (this.isJumping) {
            this.rotation = Math.sin(Date.now() * 0.01) * 0.1;
        } else if (this.isSliding) {
            this.rotation = 0;
        } else {
            this.rotation = 0;
        }
        
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = CONFIG.COLORS.PLAYER;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = CONFIG.COLORS.PLAYER_DETAIL;
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, 10, 10);
        ctx.fillRect(this.width / 2 - 15, -this.height / 2 + 5, 10, 10);
        
        if (!this.isSliding) {
            const legOffset = Math.sin(Date.now() * 0.02) * 10;
            ctx.fillStyle = CONFIG.COLORS.PLAYER_DETAIL;
            ctx.fillRect(-this.width / 2 + 5, this.height / 2 - 20 + legOffset, 15, 20);
            ctx.fillRect(this.width / 2 - 20, this.height / 2 - 20 - legOffset, 15, 20);
        }
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2 + 10,
            y: this.y,
            width: this.width - 20,
            height: this.height
        };
    }
    
    reset() {
        this.currentLane = 1;
        this.targetLane = 1;
        this.x = this.lanePositions[1];
        this.y = this.groundY;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.height = this.normalHeight;
        this.slideTimer = 0;
    }
}

class Obstacle {
    constructor(lane, lanePositions, canvasHeight, type = 'normal') {
        this.lane = lane;
        this.lanePositions = lanePositions;
        this.x = lanePositions[lane];
        this.y = -100;
        this.canvasHeight = canvasHeight;
        this.type = type;
        
        if (type === 'low') {
            this.width = CONFIG.OBSTACLE.WIDTH;
            this.height = CONFIG.OBSTACLE.LOW_HEIGHT;
            this.color = CONFIG.COLORS.OBSTACLE_LOW;
            this.y = canvasHeight - 150 + CONFIG.PLAYER.SLIDE_HEIGHT;
        } else {
            this.width = CONFIG.OBSTACLE.WIDTH;
            this.height = CONFIG.OBSTACLE.HEIGHT;
            this.color = CONFIG.COLORS.OBSTACLE;
        }
        
        this.passed = false;
    }
    
    update(speed) {
        this.y += speed;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.height / 2);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-this.width / 2 + 10 + i * 15, -this.height / 2 + 10, 10, this.height - 20);
        }
        
        if (this.type === 'low') {
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(-this.width / 2 + 15, -this.height / 2 + 15, 12, 12);
            ctx.fillRect(this.width / 2 - 27, -this.height / 2 + 15, 12, 12);
        }
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > this.canvasHeight + 100;
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getType() {
        return this.type;
    }
}

class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.spawnTimer = 0;
        
        const centerX = canvasWidth / 2;
        this.lanePositions = [
            centerX - CONFIG.LANE_WIDTH,
            centerX,
            centerX + CONFIG.LANE_WIDTH
        ];
    }
    
    spawn() {
        const lane = Math.floor(Math.random() * 3);
        const type = Math.random() < 0.3 ? 'low' : 'normal';
        this.obstacles.push(new Obstacle(lane, this.lanePositions, this.canvasHeight, type));
    }
    
    update(speed) {
        this.spawnTimer++;
        if (this.spawnTimer >= CONFIG.GAME.SPAWN_INTERVAL) {
            this.spawn();
            this.spawnTimer = 0;
        }
        
        this.obstacles.forEach(obstacle => obstacle.update(speed));
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
    }
    
    draw(ctx) {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
    }
    
    checkCollision(player) {
        const playerBounds = player.getBounds();
        const playerLane = player.getLane();
        const playerSliding = player.isSlidingState();
        const playerJumping = player.isInAir();
        
        for (const obstacle of this.obstacles) {
            if (obstacle.lane !== playerLane) continue;
            
            const obstacleBounds = obstacle.getBounds();
            const obstacleType = obstacle.getType();
            
            const collisionY = playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
                              playerBounds.y + playerBounds.height > obstacleBounds.y;
            
            if (!collisionY) continue;
            
            if (obstacleType === 'low') {
                if (!playerSliding && !playerJumping) {
                    return true;
                }
            } else {
                if (!playerJumping) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
    }
}

class Renderer {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundOffset = 0;
        
        const centerX = canvasWidth / 2;
        this.lanePositions = [
            centerX - CONFIG.LANE_WIDTH,
            centerX,
            centerX + CONFIG.LANE_WIDTH
        ];
    }
    
    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvasWidth;
            const y = (i * 37) % (this.canvasHeight - 200);
            const size = 1 + (i % 3);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = '#2d3436';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvasHeight - 250);
        this.ctx.lineTo(100, this.canvasHeight - 350);
        this.ctx.lineTo(200, this.canvasHeight - 280);
        this.ctx.lineTo(350, this.canvasHeight - 380);
        this.ctx.lineTo(500, this.canvasHeight - 320);
        this.ctx.lineTo(650, this.canvasHeight - 360);
        this.ctx.lineTo(800, this.canvasHeight - 290);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - 330);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - 200);
        this.ctx.lineTo(0, this.canvasHeight - 200);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawGround(speed) {
        this.groundOffset = (this.groundOffset + speed) % 40;
        
        const groundY = this.canvasHeight - 100;
        this.ctx.fillStyle = CONFIG.COLORS.GROUND;
        this.ctx.fillRect(0, groundY, this.canvasWidth, 100);
        
        const totalWidth = CONFIG.LANE_WIDTH * 3 + 100;
        const startX = (this.canvasWidth - totalWidth) / 2;
        
        for (let i = 0; i < 3; i++) {
            const laneX = startX + 50 + i * CONFIG.LANE_WIDTH;
            this.ctx.fillStyle = CONFIG.COLORS.LANE;
            this.ctx.fillRect(laneX, groundY, CONFIG.LANE_WIDTH, 100);
            
            this.ctx.strokeStyle = CONFIG.COLORS.LANE_LINE;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([20, 20]);
            this.ctx.lineDashOffset = -this.groundOffset;
            this.ctx.beginPath();
            this.ctx.moveTo(laneX + CONFIG.LANE_WIDTH / 2, groundY);
            this.ctx.lineTo(laneX + CONFIG.LANE_WIDTH / 2, this.canvasHeight);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        this.ctx.fillStyle = CONFIG.COLORS.LANE_LINE;
        this.ctx.fillRect(startX + 40, groundY, 5, 100);
        this.ctx.fillRect(startX + totalWidth - 45, groundY, 5, 100);
        
        for (let i = 0; i < 10; i++) {
            const y = groundY + 10 + i * 10 + this.groundOffset;
            if (y < this.canvasHeight) {
                this.ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
                this.ctx.fillRect(startX + 50, y, totalWidth - 100, 2);
            }
        }
    }
    
    render(speed) {
        this.clear();
        this.drawBackground();
        this.drawGround(speed);
    }
}

class Game {
    constructor() {
        console.log('Game initializing...');
        
        try {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.canvas.width = CONFIG.CANVAS_WIDTH;
            this.canvas.height = CONFIG.CANVAS_HEIGHT;
            
            this.input = new InputHandler();
            this.player = new Player(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            this.obstacleManager = new ObstacleManager(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            this.renderer = new Renderer(this.ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('templeRunHighScore')) || 0;
            this.speed = CONFIG.GAME.INITIAL_SPEED;
            this.isRunning = false;
            this.animationId = null;
            
            this.initUI();
            this.updateHighScoreDisplay();
            
            console.log('Game initialized successfully!');
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }
    
    initUI() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const homeBtn = document.getElementById('home-btn');
        
        if (startBtn) {
            console.log('Start button found, adding click listener');
            startBtn.addEventListener('click', () => {
                console.log('Start button clicked!');
                this.start();
            });
        } else {
            console.error('Start button not found!');
        }
        
        if (restartBtn) {
            console.log('Restart button found, adding click listener');
            restartBtn.addEventListener('click', () => {
                console.log('Restart button clicked!');
                this.restart();
            });
        } else {
            console.error('Restart button not found!');
        }
        
        if (homeBtn) {
            console.log('Home button found, adding click listener');
            homeBtn.addEventListener('click', () => {
                console.log('Home button clicked!');
                this.goToHome();
            });
        } else {
            console.error('Home button not found!');
        }
        
        const gameOverHomeBtn = document.getElementById('game-over-home-btn');
        if (gameOverHomeBtn) {
            console.log('Game over home button found, adding click listener');
            gameOverHomeBtn.addEventListener('click', () => {
                console.log('Game over home button clicked!');
                this.goToHome();
            });
        } else {
            console.error('Game over home button not found!');
        }
    }
    
    start() {
        console.log('Starting game...');
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('home-btn').classList.remove('hidden');
        this.isRunning = true;
        this.gameLoop();
    }
    
    goToHome() {
        console.log('Going back to home...');
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.reset();
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('home-btn').classList.add('hidden');
    }
    
    restart() {
        console.log('Restarting game...');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('home-btn').classList.remove('hidden');
        this.reset();
        this.isRunning = true;
        this.gameLoop();
    }
    
    reset() {
        this.score = 0;
        this.speed = CONFIG.GAME.INITIAL_SPEED;
        this.player.reset();
        this.obstacleManager.reset();
        this.input.reset();
        this.updateScoreDisplay();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        const laneChange = this.input.getLaneChange();
        if (laneChange !== 0) {
            this.player.changeLane(laneChange);
        }
        
        if (this.input.wantsJump()) {
            this.player.jump();
        }
        
        if (this.input.wantsSlide()) {
            this.player.slide();
        }
        
        this.player.update();
        this.obstacleManager.update(this.speed);
        
        if (this.speed < CONFIG.GAME.MAX_SPEED) {
            this.speed += CONFIG.GAME.SPEED_INCREMENT;
        }
        
        this.score += CONFIG.GAME.SCORE_PER_FRAME;
        this.updateScoreDisplay();
        
        if (this.obstacleManager.checkCollision(this.player)) {
            this.gameOver();
        }
    }
    
    render() {
        this.renderer.render(this.speed);
        this.obstacleManager.draw(this.ctx);
        this.player.draw(this.ctx);
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        document.getElementById('highscore').textContent = this.highScore;
    }
    
    gameOver() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('templeRunHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
        
        document.getElementById('final-score').textContent = this.score;
        const newRecordElement = document.querySelector('.new-record');
        if (isNewRecord) {
            newRecordElement.classList.remove('hidden');
        } else {
            newRecordElement.classList.add('hidden');
        }
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
}

console.log('Loading game...');
window.addEventListener('load', () => {
    console.log('Window loaded, creating game instance');
    new Game();
});