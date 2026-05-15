class Game {
    constructor() {
        this.fish = 50;
        this.happiness = 50;
        this.penguins = [];
        this.buildings = [];
        this.fishingSpots = 0;
        this.playgrounds = 0;
        this.iceHouses = 0;
        this.gameScene = document.getElementById('game-scene');
        this.iceFloe = this.gameScene.querySelector('.ice-floe');
        
        this.init();
    }

    init() {
        this.addPenguin();
        this.updateUI();
        this.startGameLoop();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('add-penguin').addEventListener('click', () => this.buyPenguin());
        document.getElementById('add-ice-house').addEventListener('click', () => this.buyIceHouse());
        document.getElementById('add-fishing-spot').addEventListener('click', () => this.buyFishingSpot());
        document.getElementById('add-playground').addEventListener('click', () => this.buyPlayground());
        document.getElementById('feed-penguins').addEventListener('click', () => this.feedPenguins());
        document.getElementById('restart-game').addEventListener('click', () => this.resetGame());
    }

    resetGame() {
        this.penguins.forEach(penguin => {
            penguin.hideBubble();
            if (penguin.element) {
                penguin.element.remove();
            }
        });
        this.penguins = [];

        this.buildings.forEach(building => building.remove());
        this.buildings = [];

        this.fish = 50;
        this.happiness = 50;
        this.fishingSpots = 0;
        this.playgrounds = 0;
        this.iceHouses = 0;

        this.addPenguin();
        this.updateUI();
        this.showMessage('🔄 游戏已重新开始！');
    }

    addPenguin() {
        const penguin = new Penguin(this);
        this.penguins.push(penguin);
        this.updateUI();
        this.showMessage('🎉 新企鹅加入了栖息地！');
    }

    buyPenguin() {
        if (this.fish >= 100) {
            this.fish -= 100;
            this.addPenguin();
        } else {
            this.showMessage('❌ 鱼不够！需要100条鱼', 'error');
        }
    }

    buyIceHouse() {
        if (this.fish >= 50) {
            this.fish -= 50;
            this.iceHouses++;
            this.addBuilding('🏠', -100);
            this.updateUI();
            this.showMessage('🏠 冰屋建造完成！企鹅休息更舒适了');
        } else {
            this.showMessage('❌ 鱼不够！需要50条鱼', 'error');
        }
    }

    buyFishingSpot() {
        if (this.fish >= 30) {
            this.fish -= 30;
            this.fishingSpots++;
            this.addBuilding('🎣', 0);
            this.updateUI();
            this.showMessage('🎣 钓鱼点建造完成！钓鱼效率提升');
        } else {
            this.showMessage('❌ 鱼不够！需要30条鱼', 'error');
        }
    }

    buyPlayground() {
        if (this.fish >= 40) {
            this.fish -= 40;
            this.playgrounds++;
            this.addBuilding('🎢', 100);
            this.updateUI();
            this.showMessage('🎢 游乐场建造完成！快乐值提升更快');
        } else {
            this.showMessage('❌ 鱼不够！需要40条鱼', 'error');
        }
    }

    addBuilding(emoji, offsetX) {
        const building = document.createElement('div');
        building.className = 'building';
        building.textContent = emoji;
        building.style.left = `calc(50% + ${offsetX}px)`;
        building.style.bottom = '60%';
        this.gameScene.appendChild(building);
        this.buildings.push(building);
    }

    feedPenguins() {
        if (this.fish >= 10) {
            this.fish -= 10;
            this.happiness = Math.min(100, this.happiness + 20);
            this.penguins.forEach(p => {
                p.showBubble('🍖 好吃！');
            });
            this.updateUI();
            this.showMessage('🍖 企鹅们吃得很开心！快乐值+20');
        } else {
            this.showMessage('❌ 鱼不够！需要10条鱼', 'error');
        }
    }

    startGameLoop() {
        setInterval(() => {
            this.penguins.forEach(penguin => penguin.update());
            this.decayHappiness();
            this.updateUI();
        }, 1000);
    }

    decayHappiness() {
        if (this.happiness > 0) {
            this.happiness = Math.max(0, this.happiness - 0.5);
        }
    }

    addFish(amount) {
        const bonus = 1 + (this.fishingSpots * 0.2);
        this.fish += Math.floor(amount * bonus);
    }

    addHappiness(amount) {
        const bonus = 1 + (this.playgrounds * 0.3);
        this.happiness = Math.min(100, this.happiness + amount * bonus);
    }

    updateUI() {
        document.getElementById('fish-count').textContent = Math.floor(this.fish);
        document.getElementById('happiness').textContent = Math.floor(this.happiness);
        document.getElementById('penguin-count').textContent = this.penguins.length;

        document.getElementById('add-penguin').disabled = this.fish < 100;
        document.getElementById('add-ice-house').disabled = this.fish < 50;
        document.getElementById('add-fishing-spot').disabled = this.fish < 30;
        document.getElementById('add-playground').disabled = this.fish < 40;
        document.getElementById('feed-penguins').disabled = this.fish < 10;
    }

    showMessage(text, type = 'success') {
        const messageBox = document.getElementById('message-box');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        messageBox.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

class Penguin {
    constructor(game) {
        this.game = game;
        this.element = document.createElement('div');
        this.element.className = 'penguin';
        this.element.textContent = '🐧';
        this.state = 'idle';
        this.stateTimer = 0;
        this.bubble = null;
        
        this.setRandomPosition();
        this.game.gameScene.appendChild(this.element);
        this.bindEvents();
        this.decideAction();
    }

    setRandomPosition() {
        const iceFloeRect = this.game.iceFloe.getBoundingClientRect();
        const sceneRect = this.game.gameScene.getBoundingClientRect();
        
        const minX = iceFloeRect.left - sceneRect.left + 30;
        const maxX = iceFloeRect.right - sceneRect.left - 80;
        const minY = iceFloeRect.top - sceneRect.top + 20;
        const maxY = iceFloeRect.bottom - sceneRect.top - 60;
        
        this.x = Math.random() * (maxX - minX) + minX;
        this.y = Math.random() * (maxY - minY) + minY;
        
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    bindEvents() {
        this.element.addEventListener('click', () => this.interact());
    }

    interact() {
        this.game.addHappiness(5);
        this.showBubble('❤️ 开心！');
        this.element.style.transform = 'scale(1.3)';
        setTimeout(() => {
            this.element.style.transform = 'scale(1)';
        }, 300);
    }

    decideAction() {
        const happiness = this.game.happiness;
        const rand = Math.random();
        
        if (happiness < 20) {
            if (rand < 0.6) this.startFishing();
            else this.startSleeping();
        } else if (happiness < 60) {
            if (rand < 0.4) this.startFishing();
            else if (rand < 0.7) this.startPlaying();
            else this.startSleeping();
        } else {
            if (rand < 0.3) this.startFishing();
            else if (rand < 0.8) this.startPlaying();
            else this.startSleeping();
        }
    }

    startFishing() {
        this.state = 'fishing';
        this.stateTimer = Math.floor(Math.random() * 5) + 5;
        this.element.classList.add('fishing');
        this.showBubble('🎣 钓鱼中...');
        
        this.moveToWater();
    }

    startPlaying() {
        this.state = 'playing';
        this.stateTimer = Math.floor(Math.random() * 4) + 3;
        this.element.classList.add('playing');
        this.showBubble('🎮 玩耍中！');
        
        this.startMovingAround();
    }

    startSleeping() {
        this.state = 'sleeping';
        this.stateTimer = Math.floor(Math.random() * 3) + 2;
        this.element.classList.add('sleeping');
        this.showBubble('💤 休息中...');
    }

    moveToWater() {
        const sceneRect = this.game.gameScene.getBoundingClientRect();
        const targetY = sceneRect.height * 0.55;
        this.element.style.top = `${targetY}px`;
    }

    startMovingAround() {
        const moveInterval = setInterval(() => {
            if (this.state !== 'playing') {
                clearInterval(moveInterval);
                return;
            }
            this.setRandomPosition();
        }, 1000);
    }

    update() {
        this.stateTimer--;
        
        if (this.stateTimer <= 0) {
            this.finishAction();
            return;
        }

        if (this.state === 'fishing' && this.stateTimer % 2 === 0) {
            const fishCaught = Math.floor(Math.random() * 3) + 1;
            this.game.addFish(fishCaught);
            this.showBubble(`🐟 +${fishCaught}`);
        }
        
        if (this.state === 'playing' && this.stateTimer % 2 === 0) {
            this.game.addHappiness(3);
        }
    }

    finishAction() {
        this.element.classList.remove('fishing', 'playing', 'sleeping');
        this.hideBubble();
        this.setRandomPosition();
        this.decideAction();
    }

    showBubble(text) {
        this.hideBubble();
        this.bubble = document.createElement('div');
        this.bubble.className = 'action-bubble';
        this.bubble.textContent = text;
        this.bubble.style.left = `${this.x + 30}px`;
        this.bubble.style.top = `${this.y - 30}px`;
        this.game.gameScene.appendChild(this.bubble);
    }

    hideBubble() {
        if (this.bubble) {
            this.bubble.remove();
            this.bubble = null;
        }
    }
}

const game = new Game();