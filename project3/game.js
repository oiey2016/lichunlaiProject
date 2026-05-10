const GoGame = (() => {
    const EMPTY = 0;
    const BLACK = 1;
    const WHITE = 2;
    
    const LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    
    class GoBoard {
        constructor(size = 19) {
            this.size = size;
            this.board = this.createEmptyBoard();
            this.currentPlayer = BLACK;
            this.history = [];
            this.captures = { [BLACK]: 0, [WHITE]: 0 };
            this.lastMove = null;
            this.koPoint = null;
            this.consecutivePasses = 0;
            this.gameOver = false;
            this.territory = null;
            this.score = null;
        }
        
        createEmptyBoard() {
            return Array(this.size).fill(null).map(() => Array(this.size).fill(EMPTY));
        }
        
        cloneBoard() {
            return this.board.map(row => [...row]);
        }
        
        boardHash(board) {
            return board.map(row => row.join('')).join('|');
        }
        
        getNeighbors(x, y) {
            const neighbors = [];
            if (x > 0) neighbors.push({ x: x - 1, y });
            if (x < this.size - 1) neighbors.push({ x: x + 1, y });
            if (y > 0) neighbors.push({ x, y: y - 1 });
            if (y < this.size - 1) neighbors.push({ x, y: y + 1 });
            return neighbors;
        }
        
        getGroup(x, y, board = this.board) {
            const color = board[y][x];
            if (color === EMPTY) return { stones: [], liberties: 0 };
            
            const visited = new Set();
            const stones = [];
            const liberties = new Set();
            const stack = [{ x, y }];
            
            while (stack.length > 0) {
                const { x: cx, y: cy } = stack.pop();
                const key = `${cx},${cy}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (board[cy][cx] === color) {
                    stones.push({ x: cx, y: cy });
                    
                    for (const neighbor of this.getNeighbors(cx, cy)) {
                        const nKey = `${neighbor.x},${neighbor.y}`;
                        if (!visited.has(nKey)) {
                            if (board[neighbor.y][neighbor.x] === EMPTY) {
                                liberties.add(nKey);
                            } else if (board[neighbor.y][neighbor.x] === color) {
                                stack.push(neighbor);
                            }
                        }
                    }
                }
            }
            
            return { stones, liberties: liberties.size };
        }
        
        removeGroup(group) {
            for (const stone of group.stones) {
                this.board[stone.y][stone.x] = EMPTY;
            }
            return group.stones.length;
        }
        
        captureStones(x, y, enemyColor) {
            let captured = 0;
            
            for (const neighbor of this.getNeighbors(x, y)) {
                if (this.board[neighbor.y][neighbor.x] === enemyColor) {
                    const group = this.getGroup(neighbor.x, neighbor.y);
                    if (group.liberties === 0) {
                        captured += this.removeGroup(group);
                    }
                }
            }
            
            return captured;
        }
        
        isSuicide(x, y, color) {
            const testBoard = this.cloneBoard();
            testBoard[y][x] = color;
            
            const enemyColor = color === BLACK ? WHITE : BLACK;
            let hasCapture = false;
            
            for (const neighbor of this.getNeighbors(x, y)) {
                if (testBoard[neighbor.y][neighbor.x] === enemyColor) {
                    const group = this.getGroup(neighbor.x, neighbor.y, testBoard);
                    if (group.liberties === 0) {
                        hasCapture = true;
                        break;
                    }
                }
            }
            
            if (hasCapture) return false;
            
            const group = this.getGroup(x, y, testBoard);
            return group.liberties === 0;
        }
        
        isKoPoint(x, y) {
            if (!this.koPoint) return false;
            return this.koPoint.x === x && this.koPoint.y === y;
        }
        
        wouldBeKo(x, y, color) {
            const testBoard = this.cloneBoard();
            testBoard[y][x] = color;
            
            const enemyColor = color === BLACK ? WHITE : BLACK;
            let capturedStones = [];
            
            for (const neighbor of this.getNeighbors(x, y)) {
                if (testBoard[neighbor.y][neighbor.x] === enemyColor) {
                    const group = this.getGroup(neighbor.x, neighbor.y, testBoard);
                    if (group.liberties === 0) {
                        capturedStones.push(...group.stones);
                        for (const stone of group.stones) {
                            testBoard[stone.y][stone.x] = EMPTY;
                        }
                    }
                }
            }
            
            if (capturedStones.length === 1) {
                const group = this.getGroup(x, y, testBoard);
                if (group.stones.length === 1 && group.liberties === 1) {
                    return capturedStones[0];
                }
            }
            
            return null;
        }
        
        isValidMove(x, y) {
            if (this.gameOver) return { valid: false, reason: '游戏已结束' };
            if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
                return { valid: false, reason: '位置超出棋盘' };
            }
            if (this.board[y][x] !== EMPTY) {
                return { valid: false, reason: '该位置已有棋子' };
            }
            if (this.isKoPoint(x, y)) {
                return { valid: false, reason: '劫争禁手' };
            }
            if (this.isSuicide(x, y, this.currentPlayer)) {
                return { valid: false, reason: '自杀禁手' };
            }
            
            return { valid: true };
        }
        
        placeStone(x, y) {
            const validation = this.isValidMove(x, y);
            if (!validation.valid) return validation;
            
            this.history.push({
                type: 'move',
                x,
                y,
                player: this.currentPlayer,
                board: this.cloneBoard(),
                captures: { ...this.captures },
                koPoint: this.koPoint ? { ...this.koPoint } : null,
                lastMove: this.lastMove ? { ...this.lastMove } : null,
                consecutivePasses: this.consecutivePasses
            });
            
            this.board[y][x] = this.currentPlayer;
            
            const enemyColor = this.currentPlayer === BLACK ? WHITE : BLACK;
            const captured = this.captureStones(x, y, enemyColor);
            this.captures[this.currentPlayer] += captured;
            
            const koStone = this.wouldBeKo(x, y, this.currentPlayer);
            this.koPoint = koStone ? { x: koStone.x, y: koStone.y } : null;
            
            this.lastMove = { x, y };
            this.consecutivePasses = 0;
            this.currentPlayer = enemyColor;
            
            return { valid: true, captured };
        }
        
        pass() {
            if (this.gameOver) return { valid: false, reason: '游戏已结束' };
            
            this.history.push({
                type: 'pass',
                player: this.currentPlayer,
                board: this.cloneBoard(),
                captures: { ...this.captures },
                koPoint: this.koPoint ? { ...this.koPoint } : null,
                lastMove: this.lastMove ? { ...this.lastMove } : null,
                consecutivePasses: this.consecutivePasses
            });
            
            this.consecutivePasses++;
            this.koPoint = null;
            this.lastMove = { type: 'pass' };
            this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;
            
            if (this.consecutivePasses >= 2) {
                this.endGame();
                return { valid: true, gameOver: true };
            }
            
            return { valid: true };
        }
        
        resign() {
            if (this.gameOver) return { valid: false, reason: '游戏已结束' };
            
            this.gameOver = true;
            const winner = this.currentPlayer === BLACK ? WHITE : BLACK;
            this.score = { winner, type: 'resign', loser: this.currentPlayer };
            
            return { valid: true, winner };
        }
        
        undo() {
            if (this.history.length === 0) return { valid: false, reason: '没有可悔的棋' };
            
            const lastState = this.history.pop();
            
            this.board = lastState.board;
            this.captures = { ...lastState.captures };
            this.koPoint = lastState.koPoint;
            this.lastMove = lastState.lastMove;
            this.consecutivePasses = lastState.consecutivePasses;
            this.currentPlayer = lastState.player;
            this.gameOver = false;
            this.score = null;
            
            return { valid: true, move: lastState };
        }
        
        calculateTerritory() {
            const territory = {
                [BLACK]: 0,
                [WHITE]: 0,
                neutral: 0
            };
            
            const visited = new Set();
            
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    if (this.board[y][x] === EMPTY && !visited.has(`${x},${y}`)) {
                        const region = this.getEmptyRegion(x, y, visited);
                        
                        let bordersBlack = false;
                        let bordersWhite = false;
                        
                        for (const stone of region) {
                            for (const neighbor of this.getNeighbors(stone.x, stone.y)) {
                                const color = this.board[neighbor.y][neighbor.x];
                                if (color === BLACK) bordersBlack = true;
                                if (color === WHITE) bordersWhite = true;
                            }
                        }
                        
                        if (bordersBlack && !bordersWhite) {
                            territory[BLACK] += region.length;
                        } else if (bordersWhite && !bordersBlack) {
                            territory[WHITE] += region.length;
                        } else {
                            territory.neutral += region.length;
                        }
                    }
                }
            }
            
            this.territory = territory;
            return territory;
        }
        
        getEmptyRegion(x, y, visited) {
            const region = [];
            const stack = [{ x, y }];
            
            while (stack.length > 0) {
                const { x: cx, y: cy } = stack.pop();
                const key = `${cx},${cy}`;
                
                if (visited.has(key)) continue;
                if (this.board[cy][cx] !== EMPTY) continue;
                
                visited.add(key);
                region.push({ x: cx, y: cy });
                
                for (const neighbor of this.getNeighbors(cx, cy)) {
                    const nKey = `${neighbor.x},${neighbor.y}`;
                    if (!visited.has(nKey) && this.board[neighbor.y][neighbor.x] === EMPTY) {
                        stack.push(neighbor);
                    }
                }
            }
            
            return region;
        }
        
        countStones() {
            const counts = { [BLACK]: 0, [WHITE]: 0 };
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    if (this.board[y][x] === BLACK) counts[BLACK]++;
                    if (this.board[y][x] === WHITE) counts[WHITE]++;
                }
            }
            return counts;
        }
        
        endGame() {
            this.gameOver = true;
            
            const territory = this.calculateTerritory();
            const stones = this.countStones();
            
            const komi = 6.5;
            const blackScore = territory[BLACK] + stones[BLACK];
            const whiteScore = territory[WHITE] + stones[WHITE] + komi;
            
            this.score = {
                type: 'territory',
                black: blackScore,
                white: whiteScore,
                blackTerritory: territory[BLACK],
                whiteTerritory: territory[WHITE],
                blackStones: stones[BLACK],
                whiteStones: stones[WHITE],
                komi,
                winner: blackScore > whiteScore ? BLACK : WHITE
            };
            
            return this.score;
        }
        
        getPositionName(x, y) {
            return LETTERS[x] + (this.size - y);
        }
        
        getHistoryLength() {
            return this.history.length;
        }
    }
    
    return {
        EMPTY,
        BLACK,
        WHITE,
        GoBoard
    };
})();
