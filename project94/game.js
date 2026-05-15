const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = {
    isPlaying: false,
    score: 0,
    level: 1,
    knivesLeft: 8,
    knivesPerLevel: 8,
    diskAngle: 0,
    diskRotationSpeed: 0.02,
    diskX: 300,
    diskY: 160,
    diskRadius: 110,
    knives: [],
    flyingKnife: null,
    canThrow: true,
    shakeIntensity: 0
};

class Knife {
    constructor(x, y, angle, isEmbedded = false) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.isEmbedded = isEmbedded;
        this.width = 10;
        this.height = 80;
        this.speed = 25;
        this.handleHeight = 30;
        this.bladeHeight = 50;
    }

    fly() {
        this.y -= this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.3, '#e8e8e8');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#a0a0a0');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, -this.handleHeight);
        ctx.lineTo(-this.width / 2, -this.handleHeight);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 - 3, -this.handleHeight);
        ctx.lineTo(this.width / 2 + 3, -this.handleHeight);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(0, this.height / 2 - 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

function drawDisk() {
    ctx.save();
    ctx.translate(game.diskX, game.diskY);
    ctx.rotate(game.diskAngle);
    
    const woodGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, game.diskRadius);
    woodGradient.addColorStop(0, '#DEB887');
    woodGradient.addColorStop(0.3, '#D2691E');
    woodGradient.addColorStop(0.6, '#8B4513');
    woodGradient.addColorStop(1, '#654321');
    
    ctx.beginPath();
    ctx.arc(0, 0, game.diskRadius, 0, Math.PI * 2);
    ctx.fillStyle = woodGradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, game.diskRadius * (0.2 + i * 0.1), 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const angle = (i / 12) * Math.PI * 2;
        ctx.lineTo(Math.cos(angle) * game.diskRadius, Math.sin(angle) * game.diskRadius);
        ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.arc(0, 0, game.diskRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#4a2c0f';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    centerGradient.addColorStop(0, '#FFD700');
    centerGradient.addColorStop(0.5, '#FFA500');
    centerGradient.addColorStop(1, '#8B4513');
    
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    ctx.restore();
}

function drawEmbeddedKnives() {
    game.knives.forEach(knife => {
        ctx.save();
        ctx.translate(game.diskX, game.diskY);
        ctx.rotate(knife.angle + game.diskAngle);
        ctx.translate(0, -game.diskRadius + 10);
        
        const gradient = ctx.createLinearGradient(0, -40, 0, 40);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#a0a0a0');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-5, -40);
        ctx.lineTo(5, -40);
        ctx.lineTo(3, 0);
        ctx.lineTo(-3, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-6, 0, 12, 25);
        
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(0, 22, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function drawKnifeStack() {
    const startX = 50;
    const startY = canvas.height - 60;
    const spacing = 25;
    
    for (let i = 0; i < game.knivesLeft; i++) {
        ctx.save();
        ctx.translate(startX, startY - i * (spacing / 3));
        ctx.rotate(-Math.PI / 2);
        
        const gradient = ctx.createLinearGradient(0, -40, 0, 40);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#a0a0a0');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-5, -40);
        ctx.lineTo(5, -40);
        ctx.lineTo(3, 0);
        ctx.lineTo(-3, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-6, 0, 12, 25);
        
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(0, 22, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

function checkCollision(newAngle) {
    const collisionThreshold = 0.15;
    for (let knife of game.knives) {
        let diff = Math.abs(newAngle - knife.angle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < collisionThreshold) {
            return true;
        }
    }
    return false;
}

function throwKnife() {
    if (!game.isPlaying || !game.canThrow || game.knivesLeft <= 0) return;
    
    game.canThrow = false;
    game.knivesLeft--;
    updateUI();
    
    game.flyingKnife = new Knife(game.diskX, canvas.height - 100, 0, false);
}

function update() {
    if (!game.isPlaying) return;
    
    const speedMultiplier = 1 + (game.level - 1) * 0.15;
    game.diskAngle += game.diskRotationSpeed * speedMultiplier;
    
    if (game.level > 2) {
        const time = Date.now() / 1000;
        game.diskRotationSpeed = 0.02 + Math.sin(time * game.level) * 0.01;
    }
    
    if (game.flyingKnife) {
        game.flyingKnife.fly();
        
        const hitY = game.diskY + game.diskRadius - 15;
        if (game.flyingKnife.y <= hitY) {
            let hitAngle = -Math.PI / 2 - game.diskAngle;
            hitAngle = hitAngle % (Math.PI * 2);
            if (hitAngle < 0) hitAngle += Math.PI * 2;
            
            if (checkCollision(hitAngle)) {
                gameOver();
                return;
            }
            
            game.knives.push({
                angle: hitAngle
            });
            
            game.score += 10 + game.level * 5;
            game.flyingKnife = null;
            game.canThrow = true;
            
            game.shakeIntensity = 5;
            updateUI();
            
            if (game.knivesLeft <= 0 && game.knives.length > 0) {
                setTimeout(levelComplete, 500);
            }
        }
    }
    
    if (game.shakeIntensity > 0) {
        game.shakeIntensity *= 0.9;
        if (game.shakeIntensity < 0.5) game.shakeIntensity = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    if (game.shakeIntensity > 0) {
        ctx.translate(
            (Math.random() - 0.5) * game.shakeIntensity,
            (Math.random() - 0.5) * game.shakeIntensity
        );
    }
    
    drawDisk();
    drawEmbeddedKnives();
    
    if (game.flyingKnife) {
        game.flyingKnife.draw(ctx);
    }
    
    drawKnifeStack();
    
    ctx.restore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('level').textContent = game.level;
    document.getElementById('knives-left').textContent = game.knivesLeft;
    
    document.querySelector('.knives-board').classList.add('pulse');
    setTimeout(() => {
        document.querySelector('.knives-board').classList.remove('pulse');
    }, 500);
}

function startGame() {
    game.isPlaying = true;
    game.score = 0;
    game.level = 1;
    game.knivesLeft = game.knivesPerLevel;
    game.knives = [];
    game.flyingKnife = null;
    game.canThrow = true;
    game.diskAngle = 0;
    game.diskRotationSpeed = 0.02;
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    
    updateUI();
}

function gameOver() {
    game.isPlaying = false;
    game.flyingKnife = null;
    
    document.querySelector('.game-container').classList.add('shake');
    setTimeout(() => {
        document.querySelector('.game-container').classList.remove('shake');
    }, 300);
    
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('finalLevel').textContent = game.level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function levelComplete() {
    game.isPlaying = false;
    document.getElementById('nextLevel').textContent = game.level + 1;
    document.getElementById('levelCompleteScreen').classList.remove('hidden');
}

function nextLevel() {
    game.level++;
    game.knivesLeft = game.knivesPerLevel + Math.floor(game.level / 2);
    game.knives = [];
    game.flyingKnife = null;
    game.canThrow = true;
    game.isPlaying = true;
    
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    updateUI();
}

canvas.addEventListener('click', throwKnife);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        throwKnife();
    }
});

function goHome() {
    game.isPlaying = false;
    game.flyingKnife = null;
    game.knives = [];
    game.knivesLeft = game.knivesPerLevel;
    game.score = 0;
    game.level = 1;
    game.diskAngle = 0;
    game.diskRotationSpeed = 0.02;
    game.canThrow = true;
    
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    
    updateUI();
}

function resetGame() {
    const currentLevel = game.level;
    const currentScore = game.score - (game.knives.length * (10 + currentLevel * 5));
    
    game.isPlaying = true;
    game.flyingKnife = null;
    game.knives = [];
    game.knivesLeft = game.knivesPerLevel + Math.floor(currentLevel / 2);
    game.score = Math.max(0, currentScore);
    game.diskAngle = 0;
    game.canThrow = true;
    
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    
    updateUI();
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
document.getElementById('homeBtn').addEventListener('click', goHome);
document.getElementById('resetBtn').addEventListener('click', resetGame);

gameLoop();
