const App = (() => {
    let game;
    let boardSize = 19;
    const CELL_SIZE = 28;
    const STONE_SIZE = 24;
    const PADDING = 20;
    
    const elements = {};
    
    function getStarPoints(size) {
        if (size === 9) {
            return [
                { x: 2, y: 2 }, { x: 6, y: 2 },
                { x: 4, y: 4 },
                { x: 2, y: 6 }, { x: 6, y: 6 }
            ];
        } else if (size === 13) {
            return [
                { x: 3, y: 3 }, { x: 9, y: 3 },
                { x: 6, y: 6 },
                { x: 3, y: 9 }, { x: 9, y: 9 }
            ];
        } else {
            return [
                { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
                { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
                { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 }
            ];
        }
    }
    
    function init() {
        cacheElements();
        createGame(boardSize);
        bindEvents();
    }
    
    function cacheElements() {
        elements.board = document.getElementById('board');
        elements.boardGrid = document.getElementById('boardGrid');
        elements.blackPlayer = document.getElementById('blackPlayer');
        elements.whitePlayer = document.getElementById('whitePlayer');
        elements.blackCaptures = document.getElementById('blackCaptures');
        elements.whiteCaptures = document.getElementById('whiteCaptures');
        elements.currentTurn = document.getElementById('currentTurn');
        elements.moveList = document.getElementById('moveList');
        elements.passBtn = document.getElementById('passBtn');
        elements.undoBtn = document.getElementById('undoBtn');
        elements.resignBtn = document.getElementById('resignBtn');
        elements.resetBtn = document.getElementById('resetBtn');
        elements.sizeButtons = document.querySelectorAll('.size-btn');
        elements.modal = document.getElementById('gameModal');
        elements.modalTitle = document.getElementById('modalTitle');
        elements.modalMessage = document.getElementById('modalMessage');
        elements.modalConfirm = document.getElementById('modalConfirm');
    }
    
    function createGame(size) {
        boardSize = size;
        game = new GoGame.GoBoard(size);
        setupBoard();
        updateUI();
    }
    
    function setupBoard() {
        const boardPixelSize = (boardSize - 1) * CELL_SIZE + PADDING * 2;
        elements.board.style.width = `${boardPixelSize}px`;
        elements.board.style.height = `${boardPixelSize}px`;
        
        elements.boardGrid.innerHTML = '';
        
        for (let i = 0; i < boardSize; i++) {
            const hLine = document.createElement('div');
            hLine.className = 'grid-line';
            hLine.style.left = `${PADDING}px`;
            hLine.style.top = `${PADDING + i * CELL_SIZE}px`;
            hLine.style.width = `${(boardSize - 1) * CELL_SIZE}px`;
            hLine.style.height = '1px';
            elements.boardGrid.appendChild(hLine);
            
            const vLine = document.createElement('div');
            vLine.className = 'grid-line';
            vLine.style.left = `${PADDING + i * CELL_SIZE}px`;
            vLine.style.top = `${PADDING}px`;
            vLine.style.width = '1px';
            vLine.style.height = `${(boardSize - 1) * CELL_SIZE}px`;
            elements.boardGrid.appendChild(vLine);
        }
        
        const starPoints = getStarPoints(boardSize);
        for (const point of starPoints) {
            const star = document.createElement('div');
            star.className = 'star-point';
            star.style.left = `${PADDING + point.x * CELL_SIZE}px`;
            star.style.top = `${PADDING + point.y * CELL_SIZE}px`;
            elements.boardGrid.appendChild(star);
        }
    }
    
    function renderBoard() {
        const stones = elements.board.querySelectorAll('.stone:not(.stone-preview)');
        stones.forEach(s => s.remove());
        
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const color = game.board[y][x];
                if (color !== GoGame.EMPTY) {
                    const stone = createStoneElement(color, x, y);
                    
                    if (game.lastMove && !game.lastMove.type && 
                        game.lastMove.x === x && game.lastMove.y === y) {
                        stone.classList.add('last-move');
                    }
                    
                    elements.board.appendChild(stone);
                }
            }
        }
    }
    
    function createStoneElement(color, x, y) {
        const stone = document.createElement('div');
        stone.className = `stone ${color === GoGame.BLACK ? 'black' : 'white'}`;
        stone.style.width = `${STONE_SIZE}px`;
        stone.style.height = `${STONE_SIZE}px`;
        stone.style.left = `${PADDING + x * CELL_SIZE}px`;
        stone.style.top = `${PADDING + y * CELL_SIZE}px`;
        stone.dataset.x = x;
        stone.dataset.y = y;
        return stone;
    }
    
    function updateUI() {
        renderBoard();
        updatePlayerInfo();
        updateMoveList();
        updateButtons();
    }
    
    function updatePlayerInfo() {
        if (game.currentPlayer === GoGame.BLACK) {
            elements.blackPlayer.classList.add('current');
            elements.whitePlayer.classList.remove('current');
            elements.currentTurn.textContent = '当前: 黑方落子';
        } else {
            elements.whitePlayer.classList.add('current');
            elements.blackPlayer.classList.remove('current');
            elements.currentTurn.textContent = '当前: 白方落子';
        }
        
        elements.blackCaptures.textContent = `提子: ${game.captures[GoGame.BLACK]}`;
        elements.whiteCaptures.textContent = `提子: ${game.captures[GoGame.WHITE]}`;
    }
    
    function updateMoveList() {
        elements.moveList.innerHTML = '';
        
        for (let i = 0; i < game.history.length; i++) {
            const move = game.history[i];
            const item = document.createElement('div');
            item.className = 'move-item';
            
            const number = document.createElement('span');
            number.className = 'move-number';
            number.textContent = `${i + 1}.`;
            
            const player = document.createElement('span');
            player.className = 'move-player';
            player.textContent = move.player === GoGame.BLACK ? '黑' : '白';
            
            const position = document.createElement('span');
            position.className = 'move-position';
            
            if (move.type === 'pass') {
                position.textContent = '虚手';
            } else {
                position.textContent = game.getPositionName(move.x, move.y);
            }
            
            item.appendChild(number);
            item.appendChild(player);
            item.appendChild(position);
            elements.moveList.appendChild(item);
        }
        
        elements.moveList.scrollTop = elements.moveList.scrollHeight;
    }
    
    function updateButtons() {
        elements.undoBtn.disabled = game.getHistoryLength() === 0 || game.gameOver;
        elements.passBtn.disabled = game.gameOver;
        elements.resignBtn.disabled = game.gameOver;
    }
    
    function bindEvents() {
        elements.board.addEventListener('click', handleBoardClick);
        elements.board.addEventListener('mousemove', handleMouseMove);
        elements.board.addEventListener('mouseleave', handleMouseLeave);
        
        elements.passBtn.addEventListener('click', handlePass);
        elements.undoBtn.addEventListener('click', handleUndo);
        elements.resignBtn.addEventListener('click', handleResign);
        elements.resetBtn.addEventListener('click', handleReset);
        
        elements.sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => handleSizeChange(parseInt(btn.dataset.size)));
        });
        
        elements.modalConfirm.addEventListener('click', () => {
            hideModal();
            handleReset();
        });
    }
    
    function handleBoardClick(e) {
        const pos = getBoardPosition(e);
        if (!pos) return;
        
        const result = game.placeStone(pos.x, pos.y);
        if (result.valid) {
            updateUI();
            if (game.gameOver) {
                showGameOver();
            }
        }
    }
    
    function handleMouseMove(e) {
        const pos = getBoardPosition(e);
        removePreview();
        
        if (pos && !game.gameOver) {
            const validation = game.isValidMove(pos.x, pos.y);
            if (validation.valid) {
                showPreview(pos.x, pos.y);
            }
        }
    }
    
    function handleMouseLeave() {
        removePreview();
    }
    
    function getBoardPosition(e) {
        const rect = elements.board.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left - PADDING) / CELL_SIZE);
        const y = Math.round((e.clientY - rect.top - PADDING) / CELL_SIZE);
        
        if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
            return { x, y };
        }
        return null;
    }
    
    function showPreview(x, y) {
        const stone = createStoneElement(game.currentPlayer, x, y);
        stone.classList.add('stone-preview');
        elements.board.appendChild(stone);
    }
    
    function removePreview() {
        const preview = elements.board.querySelector('.stone-preview');
        if (preview) preview.remove();
    }
    
    function handlePass() {
        const result = game.pass();
        if (result.valid) {
            updateUI();
            if (result.gameOver) {
                showGameOver();
            }
        }
    }
    
    function handleUndo() {
        const result = game.undo();
        if (result.valid) {
            updateUI();
        }
    }
    
    function handleResign() {
        const result = game.resign();
        if (result.valid) {
            showGameOver();
        }
    }
    
    function handleReset() {
        createGame(boardSize);
    }
    
    function handleSizeChange(size) {
        elements.sizeButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.size) === size);
        });
        createGame(size);
    }
    
    function showGameOver() {
        const score = game.score;
        
        if (score.type === 'resign') {
            const winnerName = score.winner === GoGame.BLACK ? '黑方' : '白方';
            elements.modalTitle.textContent = '游戏结束';
            elements.modalMessage.textContent = `${winnerName}中盘胜（对方认输）`;
        } else {
            const winnerName = score.winner === GoGame.BLACK ? '黑方' : '白方';
            const diff = Math.abs(score.black - score.white);
            
            elements.modalTitle.textContent = '游戏结束 - 点目结算';
            elements.modalMessage.innerHTML = `
                ${winnerName}胜 ${diff} 目<br><br>
                黑方: ${score.black} 目 (地盘${score.blackTerritory} + 棋子${score.blackStones})<br>
                白方: ${score.white} 目 (地盘${score.whiteTerritory} + 棋子${score.whiteStones} + 贴目${score.komi})
            `;
        }
        
        showModal();
    }
    
    function showModal() {
        elements.modal.classList.remove('hidden');
    }
    
    function hideModal() {
        elements.modal.classList.add('hidden');
    }
    
    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', App.init);
