class DotGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.svg = document.getElementById('lineSvg');
        
        this.gridSize = 6;
        this.cellSize = 500 / this.gridSize;
        this.dotRadius = this.cellSize * 0.35;
        
        this.colors = [
            { name: 'red', color: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.5)' },
            { name: 'blue', color: '#4ecdc4', glow: 'rgba(78, 205, 196, 0.5)' },
            { name: 'yellow', color: '#ffe66d', glow: 'rgba(255, 230, 109, 0.5)' },
            { name: 'green', color: '#95e1d3', glow: 'rgba(149, 225, 211, 0.5)' },
            { name: 'purple', color: '#dda0dd', glow: 'rgba(221, 160, 221, 0.5)' }
        ];
        
        this.grid = [];
        this.selectedDots = [];
        this.isDragging = false;
        this.score = 0;
        this.moves = 30;
        this.level = 1;
        this.goals = {};
        this.animating = false;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.generateGrid();
        this.generateGoals();
        this.render();
        this.updateUI();
    }
    
    generateGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = this.getRandomColorIndex();
            }
        }
    }
    
    getRandomColorIndex() {
        return Math.floor(Math.random() * this.colors.length);
    }
    
    generateGoals() {
        const numColors = Math.min(2 + Math.floor(this.level / 2), 4);
        const baseCount = 10 + this.level * 5;
        
        this.goals = {};
        const usedIndices = [];
        
        for (let i = 0; i < numColors; i++) {
            let colorIndex;
            do {
                colorIndex = Math.floor(Math.random() * this.colors.length);
            } while (usedIndices.includes(colorIndex));
            usedIndices.push(colorIndex);
            
            this.goals[this.colors[colorIndex].name] = {
                colorIndex,
                target: baseCount + Math.floor(Math.random() * 10),
                current: 0
            };
        }
        
        this.updateGoalsUI();
    }
    
    updateGoalsUI() {
        const goalsContainer = document.getElementById('goals');
        goalsContainer.innerHTML = '';
        
        for (const [colorName, goal] of Object.entries(this.goals)) {
            const goalItem = document.createElement('div');
            goalItem.className = `goal-item ${goal.current >= goal.target ? 'goal-completed' : ''}`;
            goalItem.innerHTML = `
                <div class="goal-dot" style="background: ${this.colors[goal.colorIndex].color}"></div>
                <span class="goal-count">${Math.max(0, goal.target - goal.current)}</span>
            `;
            goalsContainer.appendChild(goalItem);
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== null) {
                    this.drawDot(row, col);
                }
            }
        }
    }
    
    drawDot(row, col) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        const colorIndex = this.grid[row][col];
        const colorData = this.colors[colorIndex];
        
        const isSelected = this.selectedDots.some(d => d.row === row && d.col === col);
        const radius = isSelected ? this.dotRadius * 1.2 : this.dotRadius;
        
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
        gradient.addColorStop(0, colorData.color);
        gradient.addColorStop(0.5, colorData.color);
        gradient.addColorStop(1, colorData.glow);
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = colorData.glow;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = colorData.color;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
    }
    
    drawConnectionLine() {
        this.svg.innerHTML = '';
        
        if (this.selectedDots.length < 2) return;
        
        const colorIndex = this.selectedDots[0].colorIndex;
        const colorData = this.colors[colorIndex];
        
        let pathD = '';
        for (let i = 0; i < this.selectedDots.length; i++) {
            const dot = this.selectedDots[i];
            const x = dot.col * this.cellSize + this.cellSize / 2;
            const y = dot.row * this.cellSize + this.cellSize / 2;
            
            if (i === 0) {
                pathD += `M ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
            }
        }
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('stroke', colorData.color);
        path.setAttribute('stroke-width', '8');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('opacity', '0.8');
        
        this.svg.appendChild(path);
    }
    
    getGridPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            return { row, col };
        }
        return null;
    }
    
    isAdjacent(dot1, dot2) {
        const rowDiff = Math.abs(dot1.row - dot2.row);
        const colDiff = Math.abs(dot1.col - dot2.col);
        return (rowDiff <= 1 && colDiff <= 1) && (rowDiff + colDiff > 0);
    }
    
    isDotSelected(row, col) {
        return this.selectedDots.some(d => d.row === row && d.col === col);
    }
    
    startDrag(e) {
        if (this.animating) return;
        
        const pos = this.getGridPosition(e.clientX, e.clientY);
        if (!pos || this.grid[pos.row][pos.col] === null) return;
        
        this.isDragging = true;
        this.selectedDots = [{
            row: pos.row,
            col: pos.col,
            colorIndex: this.grid[pos.row][pos.col]
        }];
        
        this.render();
        this.drawConnectionLine();
    }
    
    continueDrag(e) {
        if (!this.isDragging || this.animating) return;
        
        const pos = this.getGridPosition(e.clientX, e.clientY);
        if (!pos || this.grid[pos.row][pos.col] === null) return;
        
        const firstDot = this.selectedDots[0];
        const currentColor = this.grid[pos.row][pos.col];
        
        if (currentColor !== firstDot.colorIndex) return;
        
        if (this.selectedDots.length > 1) {
            const secondLast = this.selectedDots[this.selectedDots.length - 2];
            if (secondLast.row === pos.row && secondLast.col === pos.col) {
                this.selectedDots.pop();
                this.render();
                this.drawConnectionLine();
                return;
            }
        }
        
        if (this.isDotSelected(pos.row, pos.col)) return;
        
        const lastDot = this.selectedDots[this.selectedDots.length - 1];
        if (this.isAdjacent(lastDot, pos)) {
            this.selectedDots.push({
                row: pos.row,
                col: pos.col,
                colorIndex: currentColor
            });
            this.render();
            this.drawConnectionLine();
        }
    }
    
    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        if (this.selectedDots.length >= 2) {
            this.removeDots();
        } else {
            this.selectedDots = [];
            this.svg.innerHTML = '';
            this.render();
        }
    }
    
    async removeDots() {
        this.animating = true;
        this.moves--;
        
        const points = this.selectedDots.length * this.selectedDots.length * 10;
        this.score += points;
        
        const colorName = this.colors[this.selectedDots[0].colorIndex].name;
        if (this.goals[colorName]) {
            this.goals[colorName].current += this.selectedDots.length;
        }
        
        await this.animateRemoval();
        
        for (const dot of this.selectedDots) {
            this.grid[dot.row][dot.col] = null;
        }
        
        this.selectedDots = [];
        this.svg.innerHTML = '';
        
        await this.dropDots();
        await this.fillEmptySpots();
        
        this.render();
        this.updateUI();
        this.updateGoalsUI();
        
        this.animating = false;
        
        this.checkGameState();
    }
    
    async animateRemoval() {
        const duration = 200;
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.render();
                
                for (const dot of this.selectedDots) {
                    const x = dot.col * this.cellSize + this.cellSize / 2;
                    const y = dot.row * this.cellSize + this.cellSize / 2;
                    const radius = this.dotRadius * (1 - progress * 0.5);
                    const opacity = 1 - progress;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.fill();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    async dropDots() {
        let dropped = true;
        
        while (dropped) {
            dropped = false;
            
            for (let col = 0; col < this.gridSize; col++) {
                for (let row = this.gridSize - 1; row > 0; row--) {
                    if (this.grid[row][col] === null && this.grid[row - 1][col] !== null) {
                        this.grid[row][col] = this.grid[row - 1][col];
                        this.grid[row - 1][col] = null;
                        dropped = true;
                    }
                }
            }
            
            if (dropped) {
                this.render();
                await this.sleep(50);
            }
        }
    }
    
    async fillEmptySpots() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    this.grid[row][col] = this.getRandomColorIndex();
                }
            }
        }
        
        this.render();
        await this.sleep(100);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('level').textContent = this.level;
    }
    
    checkGameState() {
        let allGoalsCompleted = true;
        for (const goal of Object.values(this.goals)) {
            if (goal.current < goal.target) {
                allGoalsCompleted = false;
                break;
            }
        }
        
        if (allGoalsCompleted) {
            this.showWinModal();
        } else if (this.moves <= 0) {
            this.showLoseModal();
        }
    }
    
    showWinModal() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('winModal').classList.remove('hidden');
    }
    
    showLoseModal() {
        document.getElementById('loseScore').textContent = this.score;
        document.getElementById('loseModal').classList.remove('hidden');
    }
    
    showRulesModal() {
        document.getElementById('rulesModal').classList.remove('hidden');
    }
    
    hideRulesModal() {
        document.getElementById('rulesModal').classList.add('hidden');
    }
    
    nextLevel() {
        document.getElementById('winModal').classList.add('hidden');
        this.level++;
        this.moves = 30 + Math.floor(this.level / 2) * 5;
        this.generateGrid();
        this.generateGoals();
        this.render();
        this.updateUI();
    }
    
    restart() {
        document.getElementById('winModal').classList.add('hidden');
        document.getElementById('loseModal').classList.add('hidden');
        this.score = 0;
        this.moves = 30;
        this.level = 1;
        this.selectedDots = [];
        this.svg.innerHTML = '';
        this.generateGrid();
        this.generateGoals();
        this.render();
        this.updateUI();
    }
    
    showHint() {
        if (this.animating) return;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const colorIndex = this.grid[row][col];
                if (colorIndex === null) continue;
                
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        
                        const newRow = row + dr;
                        const newCol = col + dc;
                        
                        if (newRow >= 0 && newRow < this.gridSize &&
                            newCol >= 0 && newCol < this.gridSize &&
                            this.grid[newRow][newCol] === colorIndex) {
                            
                            this.highlightHint(row, col, newRow, newCol);
                            return;
                        }
                    }
                }
            }
        }
    }
    
    async highlightHint(row1, col1, row2, col2) {
        const x1 = col1 * this.cellSize + this.cellSize / 2;
        const y1 = row1 * this.cellSize + this.cellSize / 2;
        const x2 = col2 * this.cellSize + this.cellSize / 2;
        const y2 = row2 * this.cellSize + this.cellSize / 2;
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, this.dotRadius * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x2, y2, this.dotRadius * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fill();
            
            await this.sleep(200);
            this.render();
            await this.sleep(200);
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.continueDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrag(e.touches[0]);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.continueDrag(e.touches[0]);
        });
        
        document.addEventListener('touchend', () => this.endDrag());
        
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('retryBtn').addEventListener('click', () => this.restart());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRulesModal());
        document.getElementById('closeRulesBtn').addEventListener('click', () => this.hideRulesModal());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DotGame();
});