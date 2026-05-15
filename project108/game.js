const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class GameState {
    constructor() {
        this.money = 0;
        this.level = 1;
        this.target = 650;
        this.time = 60;
        this.isPlaying = false;
        this.items = {
            dynamite: 0,
            lucky: 0,
            strength: 0,
            diamond: 0
        };
    }

    reset() {
        this.money = 0;
        this.level = 1;
        this.target = 650;
        this.time = 60;
        this.items = { dynamite: 0, lucky: 0, strength: 0, diamond: 0 };
    }

    nextLevel() {
        this.level++;
        this.target = 650 + (this.level - 1) * 300;
        this.time = 60;
    }
}

class Hook {
    constructor() {
        this.anchorX = 400;
        this.anchorY = 80;
        this.angle = 0;
        this.angleSpeed = 0.03;
        this.direction = 1;
        this.length = 50;
        this.maxLength = 450;
        this.state = 'swinging';
        this.speed = 5;
        this.catchedItem = null;
    }

    reset() {
        this.angle = 0;
        this.length = 50;
        this.state = 'swinging';
        this.catchedItem = null;
    }

    getEndX() {
        return this.anchorX + Math.sin(this.angle) * this.length;
    }

    getEndY() {
        return this.anchorY + Math.cos(this.angle) * this.length;
    }

    update() {
        if (this.state === 'swinging') {
            this.angle += this.angleSpeed * this.direction;
            if (this.angle > Math.PI / 2.5 || this.angle < -Math.PI / 2.5) {
                this.direction *= -1;
            }
        } else if (this.state === 'shooting') {
            this.length += this.speed;
            if (this.length >= this.maxLength) {
                this.state = 'pulling';
            }
        } else if (this.state === 'pulling') {
            let pullSpeed = this.speed;
            if (this.catchedItem) {
                pullSpeed = this.speed / (this.catchedItem.weight * 0.5);
                if (game.state.items.strength > 0) {
                    pullSpeed *= 2;
                }
            }
            this.length -= pullSpeed;
            if (this.length <= 50) {
                if (this.catchedItem) {
                    let value = this.catchedItem.value;
                    if (this.catchedItem.type === 'diamond' && game.state.items.diamond > 0) {
                        value *= 2;
                    }
                    if (game.state.items.lucky > 0 && this.catchedItem.type !== 'rock') {
                        value *= 1.5;
                    }
                    game.state.money += Math.floor(value);
                    game.ui.update();
                }
                this.reset();
            }
        }
    }

    shoot() {
        if (this.state === 'swinging') {
            this.state = 'shooting';
        }
    }

    useDynamite() {
        if (this.state === 'pulling' && this.catchedItem && game.state.items.dynamite > 0) {
            game.state.items.dynamite--;
            this.catchedItem = null;
            game.ui.updateItems();
        }
    }

    draw() {
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.anchorX, this.anchorY);
        ctx.lineTo(this.getEndX(), this.getEndY());
        ctx.stroke();

        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.arc(this.getEndX(), this.getEndY(), 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        const hookAngle = this.angle;
        ctx.beginPath();
        ctx.arc(this.getEndX() + Math.sin(hookAngle) * 8, 
                this.getEndY() + Math.cos(hookAngle) * 8, 
                8, hookAngle + Math.PI / 4, hookAngle + Math.PI * 1.2);
        ctx.stroke();
    }
}

class Item {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.caught = false;
        
        switch(type) {
            case 'gold_small':
                this.radius = 20;
                this.value = 50;
                this.weight = 1;
                this.color = '#FFD700';
                break;
            case 'gold_medium':
                this.radius = 30;
                this.value = 100;
                this.weight = 2;
                this.color = '#FFD700';
                break;
            case 'gold_large':
                this.radius = 45;
                this.value = 250;
                this.weight = 4;
                this.color = '#FFD700';
                break;
            case 'diamond':
                this.radius = 15;
                this.value = 600;
                this.weight = 0.8;
                this.color = '#00FFFF';
                break;
            case 'rock_small':
                this.radius = 18;
                this.value = 10;
                this.weight = 3;
                this.color = '#696969';
                break;
            case 'rock_large':
                this.radius = 35;
                this.value = 20;
                this.weight = 6;
                this.color = '#696969';
                break;
            case 'mystery':
                this.radius = 25;
                this.value = Math.random() * 500 + 50;
                this.weight = 1.5;
                this.color = '#FF69B4';
                break;
        }
    }

    checkCollision(hook) {
        const dx = hook.getEndX() - this.x;
        const dy = hook.getEndY() - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + 10;
    }

    draw() {
        if (this.caught) return;

        if (this.type === 'diamond') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.radius);
            ctx.lineTo(this.x + this.radius, this.y);
            ctx.lineTo(this.x, this.y + this.radius);
            ctx.lineTo(this.x - this.radius, this.y);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(this.x - 3, this.y - 5, 4, 6, -0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'mystery') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.radius);
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? this.radius : this.radius * 0.5;
                ctx.lineTo(this.x + Math.cos(angle) * r, this.y + Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            const gradient = ctx.createRadialGradient(
                this.x - this.radius * 0.3, 
                this.y - this.radius * 0.3, 
                0,
                this.x, 
                this.y, 
                this.radius
            );
            gradient.addColorStop(0, this.type.includes('gold') ? '#FFF8DC' : '#A9A9A9');
            gradient.addColorStop(0.7, this.color);
            gradient.addColorStop(1, this.type.includes('gold') ? '#B8860B' : '#404040');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(this.x - this.radius * 0.3, this.y - this.radius * 0.3, 
                       this.radius * 0.3, this.radius * 0.2, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.type.includes('gold') || this.type === 'mystery') {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'transparent';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

class ItemManager {
    constructor() {
        this.items = [];
    }

    generateItems(level) {
        this.items = [];
        const itemCount = 8 + level * 2;
        
        const types = [
            { type: 'gold_small', chance: 0.25 },
            { type: 'gold_medium', chance: 0.2 },
            { type: 'gold_large', chance: 0.1 },
            { type: 'diamond', chance: 0.08 + level * 0.01 },
            { type: 'rock_small', chance: 0.15 },
            { type: 'rock_large', chance: 0.12 },
            { type: 'mystery', chance: 0.1 }
        ];

        for (let i = 0; i < itemCount; i++) {
            let selectedType = 'gold_small';
            const rand = Math.random();
            let cumulative = 0;
            
            for (const t of types) {
                cumulative += t.chance;
                if (rand < cumulative) {
                    selectedType = t.type;
                    break;
                }
            }

            let x, y, valid;
            let attempts = 0;
            do {
                x = Math.random() * 700 + 50;
                y = Math.random() * 300 + 200;
                valid = true;
                
                for (const item of this.items) {
                    const dx = x - item.x;
                    const dy = y - item.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 70) {
                        valid = false;
                        break;
                    }
                }
                attempts++;
            } while (!valid && attempts < 50);

            this.items.push(new Item(selectedType, x, y));
        }
    }

    checkCollisions(hook) {
        if (hook.state !== 'shooting') return;
        
        for (const item of this.items) {
            if (!item.caught && item.checkCollision(hook)) {
                hook.state = 'pulling';
                hook.catchedItem = item;
                item.caught = true;
                break;
            }
        }
    }

    draw() {
        for (const item of this.items) {
            item.draw();
        }
    }

    drawCatchedItem(hook) {
        if (hook.catchedItem && hook.state === 'pulling') {
            const item = hook.catchedItem;
            const x = hook.getEndX();
            const y = hook.getEndY();
            
            if (item.type === 'diamond') {
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.moveTo(x, y - item.radius);
                ctx.lineTo(x + item.radius, y + 5);
                ctx.lineTo(x, y + item.radius);
                ctx.lineTo(x - item.radius, y + 5);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc(x, y + 10, item.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

class Renderer {
    drawBackground() {
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 150);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, 800, 150);

        const groundGradient = ctx.createLinearGradient(0, 150, 0, 600);
        groundGradient.addColorStop(0, '#8B4513');
        groundGradient.addColorStop(0.3, '#A0522D');
        groundGradient.addColorStop(0.7, '#654321');
        groundGradient.addColorStop(1, '#3d2817');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, 150, 800, 450);

        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 180 + i * 28);
            ctx.bezierCurveTo(200, 170 + i * 28, 600, 190 + i * 28, 800, 175 + i * 28);
            ctx.stroke();
        }

        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 145, 800, 10);
        
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.moveTo(i * 20 + 5, 150);
            ctx.lineTo(i * 20 + 10, 135);
            ctx.lineTo(i * 20 + 15, 150);
            ctx.fill();
        }
    }

    drawMiner() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(380, 40, 40, 50);
        
        ctx.fillStyle = '#FFDAB9';
        ctx.beginPath();
        ctx.arc(400, 30, 22, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(400, 15, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(375, 5, 50, 15);
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(393, 28, 3, 0, Math.PI * 2);
        ctx.arc(407, 28, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(400, 38, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
    }
}

class UI {
    constructor() {
        this.moneyEl = document.getElementById('money');
        this.targetEl = document.getElementById('target');
        this.timeEl = document.getElementById('time');
        this.levelEl = document.getElementById('level');
        this.shopMoneyEl = document.getElementById('shopMoney');
        this.startScreen = document.getElementById('startScreen');
        this.shopScreen = document.getElementById('shopScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
    }

    update() {
        this.moneyEl.textContent = game.state.money;
        this.targetEl.textContent = game.state.target;
        this.timeEl.textContent = game.state.time;
        this.levelEl.textContent = game.state.level;
    }

    updateItems() {
        document.querySelector('#dynamite .item-count').textContent = game.state.items.dynamite;
        document.querySelector('#lucky .item-count').textContent = game.state.items.lucky;
        document.querySelector('#strength .item-count').textContent = game.state.items.strength;
        document.querySelector('#diamond .item-count').textContent = game.state.items.diamond;
    }

    showStart() {
        this.startScreen.classList.remove('hidden');
        this.shopScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    showShop() {
        this.startScreen.classList.add('hidden');
        this.shopScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.shopMoneyEl.textContent = game.state.money;
    }

    showGameOver(won) {
        this.startScreen.classList.add('hidden');
        this.shopScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const finalScore = document.getElementById('finalScore');
        
        if (won) {
            title.textContent = '🎉 恭喜过关！ 🎉';
            title.className = 'success';
            message.textContent = '太棒了！准备好进入商店了吗？';
        } else {
            title.textContent = '💸 游戏结束 💸';
            title.className = '';
            message.textContent = '很遗憾，没有达到目标金额...';
        }
        finalScore.textContent = game.state.money;
    }

    hideAll() {
        this.startScreen.classList.add('hidden');
        this.shopScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
}

class Game {
    constructor() {
        this.state = new GameState();
        this.hook = new Hook();
        this.itemManager = new ItemManager();
        this.renderer = new Renderer();
        this.ui = new UI();
        this.lastTime = 0;
        this.timerInterval = null;
    }

    init() {
        this.setupEventListeners();
        this.ui.showStart();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.startNextLevel());

        canvas.addEventListener('click', () => {
            if (this.state.isPlaying) {
                this.hook.shoot();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.state.isPlaying) {
                e.preventDefault();
                this.hook.shoot();
            }
            if (e.code === 'KeyD' && this.state.isPlaying) {
                this.hook.useDynamite();
            }
        });

        document.getElementById('dynamite').addEventListener('click', () => this.hook.useDynamite());

        document.querySelectorAll('.shop-item').forEach(item => {
            const btn = item.querySelector('button');
            btn.addEventListener('click', () => {
                const itemType = item.dataset.item;
                const price = parseInt(item.querySelector('.price').textContent);
                this.buyItem(itemType, price);
            });
        });
    }

    buyItem(type, price) {
        if (this.state.money >= price) {
            this.state.money -= price;
            this.state.items[type]++;
            this.ui.update();
            this.ui.updateItems();
            this.ui.shopMoneyEl.textContent = this.state.money;
        }
    }

    startGame() {
        this.state.reset();
        this.itemManager.generateItems(this.state.level);
        this.hook.reset();
        this.ui.hideAll();
        this.ui.update();
        this.ui.updateItems();
        this.state.isPlaying = true;
        this.startTimer();
        this.gameLoop();
    }

    restartGame() {
        this.startGame();
    }

    startNextLevel() {
        this.state.nextLevel();
        this.itemManager.generateItems(this.state.level);
        this.hook.reset();
        this.ui.hideAll();
        this.ui.update();
        this.state.isPlaying = true;
        this.startTimer();
        this.gameLoop();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.state.isPlaying) {
                this.state.time--;
                this.ui.update();
                if (this.state.time <= 0) {
                    this.endLevel();
                }
            }
        }, 1000);
    }

    endLevel() {
        this.state.isPlaying = false;
        clearInterval(this.timerInterval);
        
        if (this.state.money >= this.state.target) {
            this.ui.showShop();
        } else {
            this.ui.showGameOver(false);
        }
    }

    gameLoop() {
        if (!this.state.isPlaying) return;

        this.hook.update();
        this.itemManager.checkCollisions(this.hook);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.renderer.drawBackground();
        this.renderer.drawMiner();
        this.itemManager.draw();
        this.hook.draw();
        this.itemManager.drawCatchedItem(this.hook);
    }
}

const game = new Game();
game.init();