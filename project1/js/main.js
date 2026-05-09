document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('chess-board');
    const game = new Game();
    
    game.initialize(canvas);
    
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        game.handleClick(x, y);
    });
    
    document.getElementById('btn-start').addEventListener('click', function() {
        game.restart();
    });
    
    document.getElementById('btn-restart').addEventListener('click', function() {
        game.restart();
    });
    
    document.getElementById('btn-undo').addEventListener('click', function() {
        game.undo();
    });
    
    const helpModal = document.getElementById('help-modal');
    
    document.getElementById('btn-help').addEventListener('click', function() {
        helpModal.classList.add('show');
    });
    
    document.getElementById('btn-close-help').addEventListener('click', function() {
        helpModal.classList.remove('show');
    });
    
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            helpModal.classList.remove('show');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                helpModal.classList.remove('show');
                break;
            case 'r':
            case 'R':
                game.restart();
                break;
            case 'z':
            case 'Z':
                if (e.ctrlKey || e.metaKey) {
                    game.undo();
                }
                break;
        }
    });
});
