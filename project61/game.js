const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
];

const MAX_WATER_PER_TUBE = 4;
let gameState = {
    tubes: [],
    selectedTube: null,
    moves: 0,
    level: 1,
    history: []
};

function initGame() {
    const numColors = Math.min(3 + Math.floor(gameState.level / 2), COLORS.length);
    const numTubes = numColors + 2;
    
    gameState.tubes = [];
    gameState.selectedTube = null;
    gameState.moves = 0;
    gameState.history = [];
    
    const colorCounts = {};
    for (let i = 0; i < numColors; i++) {
        colorCounts[COLORS[i]] = MAX_WATER_PER_TUBE;
    }
    
    for (let i = 0; i < numTubes; i++) {
        gameState.tubes.push([]);
    }
    
    for (let i = 0; i < numColors; i++) {
        const color = COLORS[i];
        for (let j = 0; j < MAX_WATER_PER_TUBE; j++) {
            let placed = false;
            while (!placed) {
                const tubeIndex = Math.floor(Math.random() * numColors);
                if (gameState.tubes[tubeIndex].length < MAX_WATER_PER_TUBE) {
                    gameState.tubes[tubeIndex].push(color);
                    placed = true;
                }
            }
        }
    }
    
    renderTubes();
    updateStats();
}

function renderTubes() {
    const container = document.getElementById('tubesContainer');
    container.innerHTML = '';
    
    gameState.tubes.forEach((tube, index) => {
        const tubeElement = document.createElement('div');
        tubeElement.className = 'tube';
        if (gameState.selectedTube === index) {
            tubeElement.classList.add('selected');
        }
        tubeElement.dataset.index = index;
        
        let bottomPosition = 0;
        tube.forEach((color, waterIndex) => {
            const waterElement = document.createElement('div');
            waterElement.className = 'water';
            waterElement.style.backgroundColor = color;
            waterElement.style.height = `${100 / MAX_WATER_PER_TUBE}%`;
            waterElement.style.bottom = `${bottomPosition}%`;
            tubeElement.appendChild(waterElement);
            bottomPosition += 100 / MAX_WATER_PER_TUBE;
        });
        
        tubeElement.addEventListener('click', () => handleTubeClick(index));
        container.appendChild(tubeElement);
    });
}

function handleTubeClick(index) {
    if (gameState.selectedTube === null) {
        if (gameState.tubes[index].length > 0) {
            gameState.selectedTube = index;
            renderTubes();
        }
    } else if (gameState.selectedTube === index) {
        gameState.selectedTube = null;
        renderTubes();
    } else {
        tryPourWater(gameState.selectedTube, index);
    }
}

function canPourWater(fromIndex, toIndex) {
    const fromTube = gameState.tubes[fromIndex];
    const toTube = gameState.tubes[toIndex];
    
    if (fromTube.length === 0) return false;
    if (toTube.length >= MAX_WATER_PER_TUBE) return false;
    
    if (toTube.length === 0) return true;
    
    return fromTube[fromTube.length - 1] === toTube[toTube.length - 1];
}

function tryPourWater(fromIndex, toIndex) {
    if (!canPourWater(fromIndex, toIndex)) {
        gameState.selectedTube = null;
        renderTubes();
        return;
    }
    
    gameState.history.push(JSON.parse(JSON.stringify(gameState.tubes)));
    
    const fromTube = gameState.tubes[fromIndex];
    const toTube = gameState.tubes[toIndex];
    const color = fromTube[fromTube.length - 1];
    
    while (
        fromTube.length > 0 &&
        fromTube[fromTube.length - 1] === color &&
        toTube.length < MAX_WATER_PER_TUBE
    ) {
        toTube.push(fromTube.pop());
    }
    
    gameState.moves++;
    gameState.selectedTube = null;
    
    renderTubes();
    updateStats();
    checkWin();
}

function checkWin() {
    for (const tube of gameState.tubes) {
        if (tube.length === 0) continue;
        if (tube.length !== MAX_WATER_PER_TUBE) return;
        const firstColor = tube[0];
        for (const color of tube) {
            if (color !== firstColor) return;
        }
    }
    
    showWinModal();
}

function showWinModal() {
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('winModal').classList.add('show');
}

function hideWinModal() {
    document.getElementById('winModal').classList.remove('show');
}

function updateStats() {
    document.querySelector('.moves').textContent = `步数: ${gameState.moves}`;
    document.querySelector('.level').textContent = `关卡: ${gameState.level}`;
}

function undo() {
    if (gameState.history.length === 0) return;
    
    gameState.tubes = gameState.history.pop();
    gameState.moves = Math.max(0, gameState.moves - 1);
    gameState.selectedTube = null;
    
    renderTubes();
    updateStats();
}

function resetLevel() {
    if (gameState.history.length > 0) {
        gameState.tubes = gameState.history[0];
        gameState.history = [];
        gameState.moves = 0;
        gameState.selectedTube = null;
        renderTubes();
        updateStats();
    }
}

function newGame() {
    gameState.level = 1;
    initGame();
}

function nextLevel() {
    hideWinModal();
    gameState.level++;
    initGame();
}

function findHint() {
    for (let i = 0; i < gameState.tubes.length; i++) {
        for (let j = 0; j < gameState.tubes.length; j++) {
            if (i !== j && canPourWater(i, j)) {
                return { from: i, to: j };
            }
        }
    }
    return null;
}

function showHint() {
    const hint = findHint();
    if (hint) {
        const tubes = document.querySelectorAll('.tube');
        tubes[hint.from].style.animation = 'pulse 0.5s ease-in-out 3';
        setTimeout(() => {
            tubes[hint.from].style.animation = '';
        }, 1500);
    }
}

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('resetBtn').addEventListener('click', resetLevel);
document.getElementById('newGameBtn').addEventListener('click', newGame);
document.getElementById('hintBtn').addEventListener('click', showHint);
document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
        50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(102, 126, 234, 0.3); }
    }
`;
document.head.appendChild(style);

initGame();
