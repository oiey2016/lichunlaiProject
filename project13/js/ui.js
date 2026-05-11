const UI = (function() {
    let canvas = null;
    let ctx = null;
    let scoreElement = null;
    let highScoreElement = null;
    let nextFruitElement = null;
    let gameOverElement = null;
    let finalScoreElement = null;
    let mouseX = null;
    
    function initUI(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        scoreElement = document.getElementById('score');
        highScoreElement = document.getElementById('high-score');
        nextFruitElement = document.getElementById('next-fruit');
        gameOverElement = document.getElementById('game-over');
        finalScoreElement = document.getElementById('final-score');
        
        canvas.width = 500;
        canvas.height = 600;
        
        setupEventListeners();
        updateScoreDisplay();
        updateNextFruitDisplay();
    }
    
    function setupEventListeners() {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
        
        document.getElementById('restart-btn').addEventListener('click', handleRestart);
        document.getElementById('game-over-restart').addEventListener('click', handleRestart);
    }
    
    function handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        
        const currentType = Game.FRUIT_TYPES[Game.getRandomFruitType()] || Game.FRUIT_TYPES[0];
        mouseX = Math.max(currentType.radius, Math.min(canvas.width - currentType.radius, mouseX));
    }
    
    function handleMouseLeave() {
        mouseX = null;
    }
    
    function handleClick(event) {
        if (Game.isGameOver()) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        Game.dropFruit(x, canvas);
        updateScoreDisplay();
        updateNextFruitDisplay();
    }
    
    function handleTouchMove(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        mouseX = touch.clientX - rect.left;
        
        const currentType = Game.FRUIT_TYPES[0];
        mouseX = Math.max(currentType.radius, Math.min(canvas.width - currentType.radius, mouseX));
    }
    
    function handleTouchEnd(event) {
        event.preventDefault();
        if (Game.isGameOver() || mouseX === null) return;
        
        Game.dropFruit(mouseX, canvas);
        updateScoreDisplay();
        updateNextFruitDisplay();
    }
    
    function handleRestart() {
        hideGameOver();
        Game.initializeGame();
        updateScoreDisplay();
        updateNextFruitDisplay();
    }
    
    function updateScoreDisplay() {
        if (scoreElement) {
            scoreElement.textContent = Game.getScore();
        }
        if (highScoreElement) {
            highScoreElement.textContent = Game.getHighScore();
        }
    }
    
    function updateNextFruitDisplay() {
        if (!nextFruitElement) return;
        
        const nextTypeIndex = Game.getNextFruitType();
        const nextType = Game.FRUIT_TYPES[nextTypeIndex];
        
        nextFruitElement.innerHTML = `
            <span>下一个</span>
            <div style="background: ${nextType.color}">${nextType.emoji}</div>
        `;
    }
    
    function showGameOver(score) {
        if (gameOverElement) {
            finalScoreElement.textContent = score;
            gameOverElement.classList.add('show');
        }
    }
    
    function hideGameOver() {
        if (gameOverElement) {
            gameOverElement.classList.remove('show');
        }
    }
    
    function getMouseX() {
        return mouseX;
    }
    
    function getCanvas() {
        return canvas;
    }
    
    function getContext() {
        return ctx;
    }
    
    return {
        initUI,
        updateScoreDisplay,
        updateNextFruitDisplay,
        showGameOver,
        hideGameOver,
        getMouseX,
        getCanvas,
        getContext
    };
})();
