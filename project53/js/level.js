class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = this.createLevels();
    }
    
    createLevels() {
        return [
            {
                glass: { x: 250, y: 550, width: 100, height: 150 },
                spawner: { x: 300, y: 50, width: 60 },
                hint: "画一条斜线引导水流进入杯子"
            },
            {
                glass: { x: 100, y: 550, width: 100, height: 150 },
                spawner: { x: 450, y: 50, width: 60 },
                hint: "画一条长曲线引导水流到左边的杯子"
            },
            {
                glass: { x: 250, y: 600, width: 100, height: 150 },
                spawner: { x: 300, y: 50, width: 60 },
                obstacles: [
                    { x: 200, y: 300, width: 200, height: 20 }
                ],
                hint: "绕过障碍物把水引入杯子"
            },
            {
                glass: { x: 400, y: 600, width: 100, height: 150 },
                spawner: { x: 100, y: 50, width: 60 },
                obstacles: [
                    { x: 150, y: 250, width: 150, height: 20 },
                    { x: 300, y: 400, width: 150, height: 20 }
                ],
                hint: "利用多个平台引导水流"
            },
            {
                glass: { x: 250, y: 550, width: 100, height: 150 },
                spawner: { x: 300, y: 100, width: 60 },
                obstacles: [
                    { x: 250, y: 250, width: 100, height: 20 },
                    { x: 180, y: 380, width: 80, height: 20 },
                    { x: 340, y: 380, width: 80, height: 20 }
                ],
                hint: "巧妙地引导水绕过所有障碍物"
            }
        ];
    }
    
    getCurrentLevel() {
        const levelData = this.levels[(this.currentLevel - 1) % this.levels.length];
        return {
            glass: new Glass(levelData.glass.x, levelData.glass.y, levelData.glass.width, levelData.glass.height),
            spawner: levelData.spawner,
            obstacles: levelData.obstacles || [],
            hint: levelData.hint
        };
    }
    
    nextLevel() {
        this.currentLevel++;
        return this.getCurrentLevel();
    }
    
    reset() {
        this.currentLevel = 1;
    }
    
    getLevelNumber() {
        return this.currentLevel;
    }
}
