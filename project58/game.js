const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body, Vector } = Matter;

class TowerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');
        this.topRestartBtn = document.getElementById('top-restart-btn');
        
        this.width = 500;
        this.height = 800;
        this.score = 0;
        this.bestScore = localStorage.getItem('towerBestScore') || 0;
        this.gameOver = false;
        this.blocks = [];
        this.currentBlock = null;
        this.baseY = this.height - 100;
        this.blockWidth = 80;
        this.blockHeight = 40;
        this.moveInterval = null;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        
        this.init();
    }
    
    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.engine = Engine.create({
            gravity: { x: 0, y: 1 }
        });
        
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: this.width,
                height: this.height,
                wireframes: false,
                background: 'transparent'
            }
        });
        
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);
        Render.run(this.render);
        
        this.createGround();
        this.createWalls();
        this.spawnNewBlock();
        this.setupEvents();
        this.updateScoreDisplay();
    }
    
    createGround() {
        this.ground = Bodies.rectangle(
            this.width / 2, 
            this.baseY + 20, 
            this.width, 
            40, 
            {
                isStatic: true,
                render: {
                    fillStyle: '#8B4513',
                    strokeStyle: '#654321',
                    lineWidth: 3
                }
            }
        );
        Composite.add(this.engine.world, this.ground);
        
        const grass = Bodies.rectangle(
            this.width / 2, 
            this.baseY, 
            this.width, 
            10, 
            {
                isStatic: true,
                render: {
                    fillStyle: '#228B22'
                }
            }
        );
        Composite.add(this.engine.world, grass);
    }
    
    createWalls() {
        const leftWall = Bodies.rectangle(-20, this.height / 2, 40, this.height, {
            isStatic: true,
            render: { visible: false }
        });
        
        const rightWall = Bodies.rectangle(this.width + 20, this.height / 2, 40, this.height, {
            isStatic: true,
            render: { visible: false }
        });
        
        Composite.add(this.engine.world, [leftWall, rightWall]);
    }
    
    spawnNewBlock() {
        if (this.gameOver) return;
        
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const x = this.width / 2;
        const y = 100;
        
        this.currentBlock = Bodies.rectangle(x, y, this.blockWidth, this.blockHeight, {
            isStatic: true,
            render: {
                fillStyle: color,
                strokeStyle: this.darkenColor(color, 30),
                lineWidth: 2
            }
        });
        
        Composite.add(this.engine.world, this.currentBlock);
        
        this.moveBlock();
    }
    
    clearMoveInterval() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
    }
    
    moveBlock() {
        if (this.gameOver || !this.currentBlock) return;
        
        this.clearMoveInterval();
        
        let direction = 1;
        const speed = 3;
        const minX = 80;
        const maxX = this.width - 80;
        
        this.moveInterval = setInterval(() => {
            if (!this.currentBlock || this.currentBlock.isStatic === false) {
                this.clearMoveInterval();
                return;
            }
            
            let newX = this.currentBlock.position.x + direction * speed;
            
            if (newX >= maxX || newX <= minX) {
                direction *= -1;
            }
            
            Body.setPosition(this.currentBlock, {
                x: newX,
                y: this.currentBlock.position.y
            });
        }, 16);
    }
    
    dropBlock() {
        if (this.gameOver || !this.currentBlock) return;
        
        Body.setStatic(this.currentBlock, false);
        this.blocks.push(this.currentBlock);
        this.currentBlock = null;
        
        this.score++;
        this.updateScoreDisplay();
        
        setTimeout(() => {
            this.checkGameOver();
            if (!this.gameOver) {
                this.spawnNewBlock();
            }
        }, 1000);
    }
    
    checkGameOver() {
        if (this.blocks.length < 3) return;
        
        for (let block of this.blocks) {
            if (block.position.y > this.baseY - 20) {
                const velocity = Vector.magnitude(block.velocity);
                const angularVelocity = Math.abs(block.angularVelocity);
                
                if (velocity > 5 || angularVelocity > 0.3) {
                    this.endGame();
                    return;
                }
            }
            
            if (block.position.y > this.height + 100) {
                this.endGame();
                return;
            }
        }
        
        const latestBlock = this.blocks[this.blocks.length - 1];
        if (latestBlock && latestBlock.position.y < 150) {
            this.moveCameraDown();
        }
    }
    
    moveCameraDown() {
        this.baseY -= 50;
        
        Body.setPosition(this.ground, {
            x: this.ground.position.x,
            y: this.ground.position.y + 50
        });
        
        for (let block of this.blocks) {
            Body.setPosition(block, {
                x: block.position.x,
                y: block.position.y + 50
            });
        }
    }
    
    endGame() {
        this.gameOver = true;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('towerBestScore', this.bestScore);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
        this.updateScoreDisplay();
    }
    
    restart() {
        this.clearMoveInterval();
        
        this.gameOver = false;
        this.score = 0;
        this.blocks = [];
        this.currentBlock = null;
        this.baseY = this.height - 100;
        
        this.gameOverElement.classList.add('hidden');
        
        Composite.clear(this.engine.world);
        Engine.clear(this.engine);
        
        this.createGround();
        this.createWalls();
        this.spawnNewBlock();
        this.updateScoreDisplay();
    }
    
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    setupEvents() {
        this.canvas.addEventListener('click', () => {
            this.dropBlock();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.dropBlock();
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.restart();
        });
        
        this.topRestartBtn.addEventListener('click', () => {
            this.restart();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.dropBlock();
            }
        });
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

window.addEventListener('load', () => {
    new TowerGame();
});