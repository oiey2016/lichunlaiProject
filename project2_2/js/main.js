document.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame();
    const ui = new ChessUI(game);
    ui.render();
});