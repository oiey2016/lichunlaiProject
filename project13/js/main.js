document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('game-canvas');
    
    Game.initializeGame();
    UI.initUI(canvas);
    
    function gameLoop() {
        const canvas = UI.getCanvas();
        const ctx = UI.getContext();
        
        Game.updateGame(canvas);
        Game.drawGame(ctx, canvas, UI.getMouseX());
        UI.updateScoreDisplay();
        UI.updateNextFruitDisplay();
        
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
});
