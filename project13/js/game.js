const Game = (function() {
    const FRUIT_TYPES = [
        { name: '葡萄', radius: 20, color: '#6a1b9a', emoji: '🍇', score: 1 },
        { name: '樱桃', radius: 25, color: '#e53935', emoji: '🍒', score: 2 },
        { name: '橘子', radius: 32, color: '#ff9800', emoji: '🍊', score: 4 },
        { name: '柠檬', radius: 38, color: '#fdd835', emoji: '🍋', score: 8 },
        { name: '猕猴桃', radius: 45, color: '#8bc34a', emoji: '🥝', score: 16 },
        { name: '西红柿', radius: 52, color: '#f44336', emoji: '🍅', score: 32 },
        { name: '桃子', radius: 60, color: '#ff80ab', emoji: '🍑', score: 64 },
        { name: '菠萝', radius: 68, color: '#ffb300', emoji: '🍍', score: 128 },
        { name: '椰子', radius: 76, color: '#8d6e63', emoji: '🥥', score: 256 },
        { name: '半西瓜', radius: 85, color: '#4caf50', emoji: '🍈', score: 512 },
        { name: '大西瓜', radius: 95, color: '#2e7d32', emoji: '🍉', score: 1024 }
    ];
    
    const GAME_LINE_Y = 100;
    const GAME_OVER_CHECK_DELAY = 2000;
    
    let fruits = [];
    let currentFruitType = 0;
    let nextFruitType = 0;
    let score = 0;
    let highScore = 0;
    let gameOver = false;
    let gameOverTimer = null;
    let canDrop = true;
    let mergeAnimations = [];
    
    function getRandomFruitType() {
        return Math.floor(Math.random() * 5);
    }
    
    function createFruit(typeIndex, x, y, isDropping = false) {
        const type = FRUIT_TYPES[typeIndex];
        return {
            type: typeIndex,
            name: type.name,
            radius: type.radius,
            color: type.color,
            emoji: type.emoji,
            score: type.score,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            mass: type.radius,
            isDropping: isDropping,
            settled: false
        };
    }
    
    function initializeGame() {
        fruits = [];
        score = 0;
        gameOver = false;
        canDrop = true;
        mergeAnimations = [];
        
        if (gameOverTimer) {
            clearTimeout(gameOverTimer);
            gameOverTimer = null;
        }
        
        currentFruitType = getRandomFruitType();
        nextFruitType = getRandomFruitType();
        
        loadHighScore();
    }
    
    function dropFruit(x, canvas) {
        if (!canDrop || gameOver) return false;
        
        const fruit = createFruit(currentFruitType, x, FRUIT_TYPES[currentFruitType].radius + 10, true);
        fruits.push(fruit);
        
        currentFruitType = nextFruitType;
        nextFruitType = getRandomFruitType();
        
        canDrop = false;
        
        setTimeout(() => {
            canDrop = true;
        }, 500);
        
        return true;
    }
    
    function updateGame(canvas) {
        if (gameOver) return;
        
        for (let i = 0; i < fruits.length; i++) {
            PhysicsEngine.updatePhysics(fruits[i], canvas, fruits);
        }
        
        for (let i = 0; i < fruits.length; i++) {
            for (let j = i + 1; j < fruits.length; j++) {
                if (PhysicsEngine.checkCollision(fruits[i], fruits[j])) {
                    if (fruits[i].type === fruits[j].type && fruits[i].type < FRUIT_TYPES.length - 1) {
                        mergeFruits(fruits[i], fruits[j]);
                        i = 0;
                        j = 0;
                        break;
                    }
                    PhysicsEngine.resolveCollision(fruits[i], fruits[j]);
                }
            }
        }
        
        for (let i = mergeAnimations.length - 1; i >= 0; i--) {
            mergeAnimations[i].frame++;
            if (mergeAnimations[i].frame > 20) {
                mergeAnimations.splice(i, 1);
            }
        }
        
        checkGameOver();
    }
    
    function mergeFruits(fruit1, fruit2) {
        const newType = fruit1.type + 1;
        const newX = (fruit1.x + fruit2.x) / 2;
        const newY = (fruit1.y + fruit2.y) / 2;
        
        const idx1 = fruits.indexOf(fruit1);
        const idx2 = fruits.indexOf(fruit2);
        
        if (idx1 > idx2) {
            fruits.splice(idx1, 1);
            fruits.splice(idx2, 1);
        } else {
            fruits.splice(idx2, 1);
            fruits.splice(idx1, 1);
        }
        
        const newFruit = createFruit(newType, newX, newY, false);
        newFruit.vx = (fruit1.vx + fruit2.vx) / 2;
        newFruit.vy = Math.min(fruit1.vy, fruit2.vy);
        fruits.push(newFruit);
        
        score += FRUIT_TYPES[newType].score;
        
        mergeAnimations.push({
            x: newX,
            y: newY,
            radius: FRUIT_TYPES[newType].radius,
            color: FRUIT_TYPES[newType].color,
            frame: 0
        });
    }
    
    function checkGameOver() {
        if (gameOver) return;
        
        const settledFruits = fruits.filter(f => !f.isDropping);
        for (const fruit of settledFruits) {
            if (fruit.y - fruit.radius < GAME_LINE_Y) {
                if (!gameOverTimer) {
                    gameOverTimer = setTimeout(() => {
                        gameOver = true;
                        saveHighScore();
                        if (typeof UI !== 'undefined') {
                            UI.showGameOver(score);
                        }
                    }, GAME_OVER_CHECK_DELAY);
                }
                return;
            }
        }
        
        if (gameOverTimer) {
            clearTimeout(gameOverTimer);
            gameOverTimer = null;
        }
    }
    
    function drawGame(ctx, canvas, mouseX) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#ff5252';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(0, GAME_LINE_Y);
        ctx.lineTo(canvas.width, GAME_LINE_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        for (const anim of mergeAnimations) {
            const alpha = 1 - (anim.frame / 20);
            const scale = 1 + (anim.frame / 10);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = anim.color;
            ctx.beginPath();
            ctx.arc(anim.x, anim.y, anim.radius * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        for (const fruit of fruits) {
            drawFruit(ctx, fruit);
        }
        
        if (canDrop && !gameOver && mouseX !== null) {
            const previewType = FRUIT_TYPES[currentFruitType];
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = previewType.color;
            ctx.beginPath();
            ctx.arc(mouseX, previewType.radius + 10, previewType.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.font = `${previewType.radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(previewType.emoji, mouseX, previewType.radius + 10);
            ctx.globalAlpha = 1;
        }
    }
    
    function drawFruit(ctx, fruit) {
        const gradient = ctx.createRadialGradient(
            fruit.x - fruit.radius * 0.3,
            fruit.y - fruit.radius * 0.3,
            0,
            fruit.x,
            fruit.y,
            fruit.radius
        );
        
        gradient.addColorStop(0, lightenColor(fruit.color, 40));
        gradient.addColorStop(0.7, fruit.color);
        gradient.addColorStop(1, darkenColor(fruit.color, 20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = darkenColor(fruit.color, 30);
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.font = `${fruit.radius * 0.9}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fruit.emoji, fruit.x, fruit.y);
    }
    
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    function saveHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('mergeFruitHighScore', highScore.toString());
        }
    }
    
    function loadHighScore() {
        const saved = localStorage.getItem('mergeFruitHighScore');
        if (saved) {
            highScore = parseInt(saved);
        }
    }
    
    function getScore() {
        return score;
    }
    
    function getHighScore() {
        return highScore;
    }
    
    function getNextFruitType() {
        return nextFruitType;
    }
    
    function getFruitTypes() {
        return FRUIT_TYPES;
    }
    
    function isGameOver() {
        return gameOver;
    }
    
    return {
        FRUIT_TYPES,
        GAME_LINE_Y,
        initializeGame,
        dropFruit,
        updateGame,
        drawGame,
        getScore,
        getHighScore,
        getNextFruitType,
        getFruitTypes,
        isGameOver,
        getRandomFruitType
    };
})();
