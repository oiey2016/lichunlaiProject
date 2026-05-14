class AI extends Cell {
    constructor(x, y, mass) {
        const names = [
            '小明', '小红', '阿强', '美美', '大壮',
            '小甜甜', '旋风小子', '闪电侠', '巨无霸', '小可爱',
            '龙傲天', '叶良辰', '赵日天', '福尔康', '王境泽'
        ];
        const colors = [
            '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
            '#9B59B6', '#1ABC9C', '#E91E63', '#00BCD4',
            '#8BC34A', '#FF5722', '#795548', '#607D8B'
        ];
        const name = names[Math.floor(Math.random() * names.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        super(x, y, mass, name, color);
        this.decisionTimer = 0;
        this.decisionInterval = 60 + Math.random() * 60;
    }

    updateAI(foods, enemies, player, worldSize) {
        this.decisionTimer++;
        
        if (this.decisionTimer >= this.decisionInterval) {
            this.decisionTimer = 0;
            this.decisionInterval = 60 + Math.random() * 60;
            
            let nearestFood = null;
            let nearestFoodDist = Infinity;
            let nearestEnemy = null;
            let nearestEnemyDist = Infinity;
            let nearestSmaller = null;
            let nearestSmallerDist = Infinity;

            for (const food of foods) {
                const dist = this.pos.dist(food.pos);
                if (dist < nearestFoodDist) {
                    nearestFoodDist = dist;
                    nearestFood = food;
                }
            }

            const allCells = [...enemies, player];
            for (const cell of allCells) {
                if (cell === this) continue;
                const dist = this.pos.dist(cell.pos);
                
                if (cell.mass > this.mass * 1.1) {
                    if (dist < nearestEnemyDist) {
                        nearestEnemyDist = dist;
                        nearestEnemy = cell;
                    }
                } else if (this.mass > cell.mass * 1.1) {
                    if (dist < nearestSmallerDist) {
                        nearestSmallerDist = dist;
                        nearestSmaller = cell;
                    }
                }
            }

            if (nearestEnemy && nearestEnemyDist < 300) {
                const fleeDir = this.pos.sub(nearestEnemy.pos).normalize();
                this.target = this.pos.add(fleeDir.mul(500));
            } else if (nearestSmaller && nearestSmallerDist < 400 && Math.random() > 0.3) {
                this.target = nearestSmaller.pos.clone();
            } else if (nearestFood && Math.random() > 0.2) {
                this.target = nearestFood.pos.clone();
            } else {
                this.target = new Vector(
                    Math.random() * worldSize,
                    Math.random() * worldSize
                );
            }
        }

        this.constrainToWorld(worldSize);
        this.update();
    }

    constrainToWorld(worldSize) {
        const margin = this.radius + 50;
        if (this.target.x < margin) this.target.x = margin;
        if (this.target.x > worldSize - margin) this.target.x = worldSize - margin;
        if (this.target.y < margin) this.target.y = margin;
        if (this.target.y > worldSize - margin) this.target.y = worldSize - margin;
    }
}
