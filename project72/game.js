class BrickBreaker {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'idle';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        this.keys = {
            left: false,
            right: false
        };
        
        this.paddle = {
            width: 120,
            height: 15,
            x: 0,
            y: 0,
            speed: 8,
            dx: 0
        };
        
        this.ball = {
            x: 0,
            y: 0,
            radius: 10,
            speed: 5,
            dx: 5,
            dy: -5
        };
        
        this.bricks = [];
        this.brickConfig = {
            rows: 5,
            cols: 10,
            width: 70,
            height: 25,
            padding: 8,
            offsetTop: 60,
            offsetLeft: 35
        };
        
        this.brickColors = [
            { color: '#ff6b6b', points: 50, glow: 'rgba(255, 107, 107, 0.5)' },
            { color: '#feca57', points: 40, glow: 'rgba(254, 202, 87, 0.5)' },
            { color: '#48dbfb', points: 30, glow: 'rgba(72, 219, 251, 0.5)' },
            { color: '#1dd1a1', points: 20, glow: 'rgba(29, 209, 161, 0.5)' },
            { color: '#5f27cd', points: 10, glow: 'rgba(95, 39, 205, 0.5)' }
        ];
        
        this.particles = [];
        
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    init() {
        this.resetPaddle();
        this.resetBall();
        this.createBricks();
        this.updateUI();
    }
    
    resetPaddle() {
        this.paddle.x = (this.width - this.paddle.width) / 2;
        this.paddle.y = this.height - 40;
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height - 60;
        this.ball.speed = 5 + (this.level - 1) * 0.5;
        const angle = (Math.random() * 60 + 60) * Math.PI / 180;
        this.ball.dx = this.ball.speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = -this.ball.speed * Math.sin(angle);
    }
    
    createBricks() {
        this.bricks = [];
        const { rows, cols, width, height, padding, offsetTop, offsetLeft } = this.brickConfig;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: col * (width + padding) + offsetLeft,
                    y: row * (height + padding) + offsetTop,
                    width: width,
                    height: height,
                    color: this.brickColors[row].color,
                    points: this.brickColors[row].points,
                    glow: this.brickColors[row].glow,
                    visible: true
                });
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
            if (e.key === ' ' && this.gameState === 'idle') this.startGame();
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.paddle.x = mouseX - this.paddle.width / 2;
            
            if (this.paddle.x < 0) this.paddle.x = 0;
            if (this.paddle.x > this.width - this.paddle.width) {
                this.paddle.x = this.width - this.paddle.width;
            }
        });
        
        document.getElementById('overlayStartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }
    
    startGame() {
        if (this.gameState === 'idle' || this.gameState === 'gameOver' || this.gameState === 'win') {
            this.resetGame();
        }
        this.gameState = 'playing';
        this.hideOverlay();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('游戏暂停', '点击继续按钮恢复游戏', '继续游戏');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
        }
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'idle';
        this.particles = [];
        this.keys.left = false;
        this.keys.right = false;
        this.init();
        this.showOverlay('准备好了吗？', '按空格键或点击下方按钮开始挑战！', '开始游戏');
    }
    
    nextLevel() {
        this.level++;
        this.gameState = 'idle';
        this.createBricks();
        this.resetPaddle();
        this.resetBall();
        this.updateUI();
        this.showOverlay('🎉 恭喜过关！', `准备进入第 ${this.level} 关`, '继续挑战');
    }
    
    showOverlay(title, message, buttonText) {
        const overlay = document.getElementById('gameOverlay');
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('overlayStartBtn').textContent = buttonText;
        overlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.movePaddle();
        this.moveBall();
        this.updateParticles();
        this.checkCollisions();
        this.checkWinCondition();
    }
    
    movePaddle() {
        if (this.keys.left) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys.right) {
            this.paddle.x += this.paddle.speed;
        }
        
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x > this.width - this.paddle.width) {
            this.paddle.x = this.width - this.paddle.width;
        }
    }
    
    moveBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.width) {
            this.ball.dx = -this.ball.dx;
        }
        
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }
        
        if (this.ball.y + this.ball.radius > this.height) {
            this.loseLife();
        }
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameState = 'gameOver';
            this.showOverlay('💔 游戏结束', `最终得分: ${this.score}`, '重新开始');
        } else {
            this.resetBall();
            this.resetPaddle();
            this.gameState = 'idle';
            this.showOverlay('💫 小心！', `还剩 ${this.lives} 条生命`, '继续游戏');
        }
    }
    
    checkCollisions() {
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.7;
            
            this.ball.dx = this.ball.speed * Math.sin(angle);
            this.ball.dy = -Math.abs(this.ball.speed * Math.cos(angle));
            
            this.createParticles(this.ball.x, this.ball.y, '#667eea', 5);
        }
        
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            if (this.ball.x + this.ball.radius > brick.x &&
                this.ball.x - this.ball.radius < brick.x + brick.width &&
                this.ball.y + this.ball.radius > brick.y &&
                this.ball.y - this.ball.radius < brick.y + brick.height) {
                
                this.ball.dy = -this.ball.dy;
                brick.visible = false;
                this.score += brick.points;
                this.updateUI();
                
                this.createParticles(
                    brick.x + brick.width / 2,
                    brick.y + brick.height / 2,
                    brick.color,
                    10
                );
            }
        });
    }
    
    checkWinCondition() {
        const remainingBricks = this.bricks.filter(brick => brick.visible).length;
        if (remainingBricks === 0) {
            this.nextLevel();
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                radius: Math.random() * 4 + 2,
                color: color,
                life: 1
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.02;
            return p.life > 0;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.drawBricks();
        this.drawPaddle();
        this.drawBall();
        this.drawParticles();
    }
    
    drawBackground() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.width; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i < this.height; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.width, i);
            this.ctx.stroke();
        }
    }
    
    drawPaddle() {
        const gradient = this.ctx.createLinearGradient(
            this.paddle.x, this.paddle.y,
            this.paddle.x, this.paddle.y + this.paddle.height
        );
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        this.ctx.shadowColor = 'rgba(102, 126, 234, 0.6)';
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.paddle.x, this.paddle.y,
            this.paddle.width, this.paddle.height,
            8
        );
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.paddle.x + 5, this.paddle.y + 3,
            this.paddle.width - 10, 4,
            2
        );
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
    }
    
    drawBall() {
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 20;
        
        const gradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#f0f0f0');
        gradient.addColorStop(1, '#d0d0d0');
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
    
    drawBricks() {
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            this.ctx.shadowColor = brick.glow;
            this.ctx.shadowBlur = 10;
            
            const gradient = this.ctx.createLinearGradient(
                brick.x, brick.y,
                brick.x, brick.y + brick.height
            );
            gradient.addColorStop(0, brick.color);
            gradient.addColorStop(1, this.darkenColor(brick.color, 20));
            
            this.ctx.beginPath();
            this.ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 5);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            
            this.ctx.beginPath();
            this.ctx.roundRect(brick.x + 5, brick.y + 4, brick.width - 10, 6, 3);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fill();
        });
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BrickBreaker();
});