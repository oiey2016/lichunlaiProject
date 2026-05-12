const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

class Config {
    static LANE_COUNT = 3;
    static LANE_WIDTH = 120;
    static PLAYER_WIDTH = 50;
    static PLAYER_HEIGHT = 70;
    static GRAVITY = 0.8;
    static JUMP_FORCE = -15;
    static BASE_SPEED = 5;
    static MAX_SPEED = 12;
    static SPEED_INCREMENT = 0.001;
    static GROUND_Y = 420;
}

class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.lane = 1;
        this.targetLane = 1;
        this.x = canvas.width / 2;
        this.y = Config.GROUND_Y - Config.PLAYER_HEIGHT;
        this.width = Config.PLAYER_WIDTH;
        this.height = Config.PLAYER_HEIGHT;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(gameSpeed) {
        const laneX = canvas.width / 2 - Config.LANE_WIDTH + this.targetLane * Config.LANE_WIDTH;
        this.x += (laneX - this.x) * 0.2;

        if (this.isJumping) {
            this.velocityY += Config.GRAVITY;
            this.y += this.velocityY;
            
            if (this.y >= Config.GROUND_Y - Config.PLAYER_HEIGHT) {
                this.y = Config.GROUND_Y - Config.PLAYER_HEIGHT;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }

        if (this.isSliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.height = Config.PLAYER_HEIGHT;
                this.y = Config.GROUND_Y - Config.PLAYER_HEIGHT;
            }
        }

        this.animTimer++;
        if (this.animTimer > 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    moveLeft() {
        if (this.targetLane > 0) {
            this.targetLane--;
        }
    }

    moveRight() {
        if (this.targetLane < Config.LANE_COUNT - 1) {
            this.targetLane++;
        }
    }

    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.velocityY = Config.JUMP_FORCE;
        }
    }

    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 40;
            this.height = Config.PLAYER_HEIGHT * 0.5;
            this.y = Config.GROUND_Y - this.height;
        }
    }

    draw() {
        ctx.save();
        
        const bodyColor = '#FF6B6B';
        const skinColor = '#FFE4C4';
        const hairColor = '#4A4A4A';
        
        if (this.isSliding) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI / 6);
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        }

        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.x + 10, this.y + 25, 30, 35);

        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 18, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 12, 12, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 19, this.y + 15, 3, 4);
        ctx.fillRect(this.x + 28, this.y + 15, 3, 4);

        const legOffset = Math.sin(this.animFrame * Math.PI / 2) * 5;
        ctx.fillStyle = '#4A90D9';
        ctx.fillRect(this.x + 12, this.y + 55, 10, 15 + legOffset);
        ctx.fillRect(this.x + 28, this.y + 55, 10, 15 - legOffset);

        ctx.fillStyle = '#FFE4C4';
        const armSwing = Math.sin(this.animFrame * Math.PI / 2) * 8;
        ctx.fillRect(this.x + 2, this.y + 30 - armSwing, 8, 20);
        ctx.fillRect(this.x + 40, this.y + 30 + armSwing, 8, 20);

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 10
        };
    }
}

class Obstacle {
    constructor(lane, type) {
        this.lane = lane;
        this.type = type;
        this.x = canvas.width / 2 - Config.LANE_WIDTH + lane * Config.LANE_WIDTH;
        this.y = -100;
        this.passed = false;

        if (type === 'barrier') {
            this.width = 60;
            this.height = 50;
            this.y = Config.GROUND_Y - this.height;
        } else if (type === 'low') {
            this.width = 80;
            this.height = 40;
            this.y = Config.GROUND_Y - this.height - 30;
        } else {
            this.width = 70;
            this.height = 80;
            this.y = Config.GROUND_Y - this.height;
        }
    }

    update(speed) {
        this.y += speed;
    }

    draw() {
        if (this.type === 'barrier') {
            ctx.fillStyle = '#E74C3C';
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
            
            ctx.fillStyle = '#C0392B';
            ctx.fillRect(this.x - this.width / 2 + 5, this.y + 5, this.width - 10, 10);
            ctx.fillRect(this.x - this.width / 2 + 5, this.y + 35, this.width - 10, 10);
            
            ctx.fillStyle = '#FFF';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(this.x - this.width / 2 + 10 + i * 15, this.y + 20, 8, 8);
            }
        } else if (this.type === 'low') {
            ctx.fillStyle = '#9B59B6';
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
            
            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2, this.y);
            ctx.lineTo(this.x - this.width / 2 - 20, Config.GROUND_Y);
            ctx.lineTo(this.x - this.width / 2, Config.GROUND_Y);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width / 2 + 20, Config.GROUND_Y);
            ctx.lineTo(this.x + this.width / 2, Config.GROUND_Y);
            ctx.fill();
        } else {
            ctx.fillStyle = '#3498DB';
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
            
            ctx.fillStyle = '#2980B9';
            ctx.fillRect(this.x - this.width / 2 - 10, this.y + 10, 15, 20);
            ctx.fillRect(this.x + this.width / 2 - 5, this.y + 10, 15, 20);
            ctx.fillRect(this.x - this.width / 2 - 10, this.y + 50, 15, 20);
            ctx.fillRect(this.x + this.width / 2 - 5, this.y + 50, 15, 20);
        }
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    canSlideUnder() {
        return this.type === 'low';
    }

    canJumpOver() {
        return this.type === 'barrier';
    }
}

class Coin {
    constructor(lane, y) {
        this.lane = lane;
        this.x = canvas.width / 2 - Config.LANE_WIDTH + lane * Config.LANE_WIDTH;
        this.y = y || -50;
        this.radius = 15;
        this.collected = false;
        this.animFrame = 0;
    }

    update(speed) {
        this.y += speed;
        this.animFrame = (this.animFrame + 0.2) % (Math.PI * 2);
    }

    draw() {
        if (this.collected) return;

        const scaleX = Math.cos(this.animFrame);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);

        ctx.restore();

        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}

class Background {
    constructor() {
        this.layers = [
            { speed: 0.2, color: '#87CEEB', y: 0 },
            { speed: 0.4, color: '#98D8C8', y: 200 },
            { speed: 0.6, color: '#7CB342', y: 300 }
        ];
        this.clouds = [];
        this.buildings = [];
        
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * canvas.width,
                y: 30 + Math.random() * 80,
                size: 30 + Math.random() * 40,
                speed: 0.3
            });
        }
        
        for (let i = 0; i < 8; i++) {
            this.buildings.push({
                x: i * 120,
                width: 60 + Math.random() * 40,
                height: 80 + Math.random() * 80,
                color: `hsl(${200 + Math.random() * 40}, 30%, ${40 + Math.random() * 20}%)`
            });
        }
    }

    update(gameSpeed) {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -100) {
                cloud.x = canvas.width + 50;
                cloud.y = 30 + Math.random() * 80;
            }
        });
    }

    draw() {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 250);
        skyGradient.addColorStop(0, '#1a1a2e');
        skyGradient.addColorStop(0.5, '#4a69bd');
        skyGradient.addColorStop(1, '#82ccdd');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, 250);

        ctx.fillStyle = '#FFF';
        this.clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        });

        this.buildings.forEach(building => {
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, 250 - building.height, building.width, building.height);
            
            ctx.fillStyle = '#FFD700';
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(
                            building.x + 8 + col * 18,
                            250 - building.height + 15 + row * 20,
                            8, 12
                        );
                    }
                }
            }
        });

        ctx.fillStyle = '#5D4E37';
        ctx.fillRect(0, Config.GROUND_Y, canvas.width, canvas.height - Config.GROUND_Y);

        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, Config.GROUND_Y, canvas.width, 5);

        const laneColors = ['#5D4E37', '#6B5B45', '#5D4E37'];
        for (let i = 0; i < Config.LANE_COUNT; i++) {
            const laneX = canvas.width / 2 - Config.LANE_WIDTH + i * Config.LANE_WIDTH;
            ctx.fillStyle = laneColors[i];
            ctx.fillRect(laneX - Config.LANE_WIDTH / 2, Config.GROUND_Y, Config.LANE_WIDTH, canvas.height - Config.GROUND_Y);
            
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(laneX - Config.LANE_WIDTH / 2, Config.GROUND_Y);
            ctx.lineTo(laneX - Config.LANE_WIDTH / 2, canvas.height);
            ctx.stroke();
        }
    }
}

class Game {
    constructor() {
        this.state = GameState.MENU;
        this.player = new Player();
        this.background = new Background();
        this.obstacles = [];
        this.coins = [];
        this.score = 0;
        this.coinCount = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.gameSpeed = Config.BASE_SPEED;
        this.spawnTimer = 0;
        this.coinSpawnTimer = 0;

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());

        document.addEventListener('keydown', (e) => {
            if (this.state !== GameState.PLAYING) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.player.moveLeft();
                    break;
                case 'ArrowRight':
                    this.player.moveRight();
                    break;
                case 'ArrowUp':
                    this.player.jump();
                    break;
                case 'ArrowDown':
                    this.player.slide();
                    break;
            }
        });

        let touchStartX = 0;
        let touchStartY = 0;

        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        canvas.addEventListener('touchend', (e) => {
            if (this.state !== GameState.PLAYING) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.player.moveRight();
                else if (deltaX < -30) this.player.moveLeft();
            } else {
                if (deltaY < -30) this.player.jump();
                else if (deltaY > 30) this.player.slide();
            }
        });
    }

    start() {
        this.state = GameState.PLAYING;
        document.getElementById('startScreen').classList.add('hidden');
        this.gameLoop();
    }

    restart() {
        this.player.reset();
        this.obstacles = [];
        this.coins = [];
        this.score = 0;
        this.coinCount = 0;
        this.gameSpeed = Config.BASE_SPEED;
        this.spawnTimer = 0;
        this.coinSpawnTimer = 0;
        this.state = GameState.PLAYING;
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.updateUI();
        this.gameLoop();
    }

    gameOver() {
        this.state = GameState.GAME_OVER;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }

        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('finalCoins').textContent = this.coinCount;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    spawnObstacle() {
        const types = ['barrier', 'low', 'tall'];
        const lane = Math.floor(Math.random() * Config.LANE_COUNT);
        const type = types[Math.floor(Math.random() * types.length)];
        this.obstacles.push(new Obstacle(lane, type));
    }

    spawnCoins() {
        const lane = Math.floor(Math.random() * Config.LANE_COUNT);
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            this.coins.push(new Coin(lane, -50 - i * 50));
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    update() {
        if (this.state !== GameState.PLAYING) return;

        this.gameSpeed = Math.min(this.gameSpeed + Config.SPEED_INCREMENT, Config.MAX_SPEED);
        this.score += this.gameSpeed * 0.1;

        this.player.update(this.gameSpeed);
        this.background.update(this.gameSpeed);

        this.spawnTimer++;
        if (this.spawnTimer > 80 - this.gameSpeed * 3) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }

        this.coinSpawnTimer++;
        if (this.coinSpawnTimer > 50) {
            this.spawnCoins();
            this.coinSpawnTimer = 0;
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update(this.gameSpeed);
            
            const playerBounds = this.player.getBounds();
            const obstacleBounds = obstacle.getBounds();

            if (this.checkCollision(playerBounds, obstacleBounds)) {
                if (this.player.isJumping && obstacle.canJumpOver()) {
                } else if (this.player.isSliding && obstacle.canSlideUnder()) {
                } else {
                    this.gameOver();
                    return false;
                }
            }

            return obstacle.y < canvas.height + 100;
        });

        this.coins = this.coins.filter(coin => {
            coin.update(this.gameSpeed);

            if (!coin.collected) {
                const playerBounds = this.player.getBounds();
                const coinBounds = coin.getBounds();

                if (this.checkCollision(playerBounds, coinBounds)) {
                    coin.collected = true;
                    this.coinCount++;
                    this.score += 50;
                    return false;
                }
            }

            return coin.y < canvas.height + 50;
        });

        this.updateUI();
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.background.draw();

        this.coins.forEach(coin => coin.draw());

        this.obstacles.forEach(obstacle => obstacle.draw());

        this.player.draw();
    }

    updateUI() {
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('coins').textContent = this.coinCount;
    }

    gameLoop() {
        if (this.state !== GameState.PLAYING) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }
}

const game = new Game();