class LevelManager {
    constructor() {
        this.currentLevel = 0;
        this.enemies = [];
        this.spawnTimer = 0;
        this.enemiesToSpawn = [];
        this.totalEnemiesInLevel = 0;
        this.enemiesKilled = 0;
        this.isLevelComplete = false;
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.enemies = [];
        this.enemiesKilled = 0;
        this.isLevelComplete = false;
        
        const levelConfig = LEVELS[levelIndex];
        this.enemiesToSpawn = [];
        
        levelConfig.enemies.forEach(enemyGroup => {
            for (let i = 0; i < enemyGroup.count; i++) {
                this.enemiesToSpawn.push(enemyGroup.type);
            }
        });
        
        this.totalEnemiesInLevel = this.enemiesToSpawn.length;
        this.spawnTimer = 0;
    }

    update() {
        if (this.enemiesToSpawn.length > 0) {
            this.spawnTimer++;
            const spawnDelay = Math.floor(LEVELS[this.currentLevel].spawnDelay / 16);
            
            if (this.spawnTimer >= spawnDelay) {
                this.spawnEnemy();
                this.spawnTimer = 0;
            }
        }

        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isDead) {
                this.enemiesKilled++;
                game.addScore(enemy.scoreValue);
                game.effects.createFloatingText(
                    enemy.x + enemy.width / 2,
                    enemy.y,
                    `+${enemy.scoreValue}`,
                    '#ffd700'
                );
                return false;
            }
            return true;
        });

        if (this.enemiesToSpawn.length === 0 && this.enemies.length === 0 && !this.isLevelComplete) {
            this.isLevelComplete = true;
        }
    }

    spawnEnemy() {
        if (this.enemiesToSpawn.length === 0) return;

        const type = this.enemiesToSpawn.shift();
        const spawnLeft = Math.random() > 0.5;
        const x = spawnLeft ? -50 : GAME_WIDTH + 50;
        const y = GROUND_Y - ENEMY_CONFIG.height;

        const enemy = new Enemy(x, y, type);
        enemy.facingRight = !spawnLeft;
        this.enemies.push(enemy);
    }

    hasNextLevel() {
        return this.currentLevel < LEVELS.length - 1;
    }

    getLevelName() {
        return LEVELS[this.currentLevel].name;
    }

    getBackground() {
        return LEVELS[this.currentLevel].background;
    }

    getGroundColor() {
        return LEVELS[this.currentLevel].groundColor;
    }

    drawBackground(ctx) {
        const levelConfig = LEVELS[this.currentLevel];
        
        ctx.fillStyle = levelConfig.background;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.drawDecorations(ctx);

        ctx.fillStyle = levelConfig.groundColor;
        ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
        
        ctx.fillStyle = this.darkenColor(levelConfig.groundColor, 20);
        for (let i = 0; i < GAME_WIDTH; i += 40) {
            ctx.fillRect(i, GROUND_Y, 20, 5);
        }
    }

    drawDecorations(ctx) {
        const levelName = this.getLevelName();
        
        if (levelName === '操场') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(100, 80, 40, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(1000, 100, 50, 0, Math.PI * 2);
            ctx.fill();
        } else if (levelName === '教室') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(50, GROUND_Y - 80, 100, 80);
            ctx.fillRect(250, GROUND_Y - 80, 100, 80);
            ctx.fillRect(850, GROUND_Y - 80, 100, 80);
            ctx.fillRect(1050, GROUND_Y - 80, 100, 80);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(500, 50, 200, 120);
            ctx.fillStyle = '#fff';
            ctx.fillRect(510, 60, 180, 100);
        } else if (levelName === '公园') {
            ctx.fillStyle = '#228B22';
            for (let i = 0; i < 5; i++) {
                const x = 100 + i * 250;
                ctx.beginPath();
                ctx.arc(x, GROUND_Y - 60, 50, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x - 10, GROUND_Y - 40, 20, 40);
                ctx.fillStyle = '#228B22';
            }
        }
    }

    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }
}