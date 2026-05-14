class Glass {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.waterLevel = 0;
        this.maxWater = width * height * 0.7;
        this.particlesInGlass = [];
        this.fillPercentage = 0;
    }
    
    addParticle(particle) {
        if (!this.particlesInGlass.includes(particle)) {
            this.particlesInGlass.push(particle);
            this.waterLevel = this.particlesInGlass.length;
            this.updateFillPercentage();
        }
    }
    
    removeParticle(particle) {
        const index = this.particlesInGlass.indexOf(particle);
        if (index > -1) {
            this.particlesInGlass.splice(index, 1);
            this.waterLevel = this.particlesInGlass.length;
            this.updateFillPercentage();
        }
    }
    
    updateFillPercentage() {
        const targetParticles = this.maxWater / (Math.PI * Config.water.particleRadius * Config.water.particleRadius * 0.5);
        this.fillPercentage = Math.min(100, (this.particlesInGlass.length / targetParticles) * 100);
    }
    
    containsParticle(particle) {
        const margin = particle.radius;
        return particle.x > this.x + margin + 5 &&
               particle.x < this.x + this.width - margin - 5 &&
               particle.y > this.y &&
               particle.y < this.y + this.height + margin;
    }
    
    isParticleStable(particle) {
        return particle.y > this.y + this.height * 0.2 &&
               Math.abs(particle.vy) < 2;
    }
    
    getFillPercentage() {
        return this.fillPercentage;
    }
    
    isFull() {
        return this.getFillPercentage() >= Config.glass.fillPercentage;
    }
    
    getCollisionSegments() {
        const leftWall = {
            start: { x: this.x - 3, y: this.y - 10 },
            end: { x: this.x - 3, y: this.y + this.height + 5 }
        };
        
        const rightWall = {
            start: { x: this.x + this.width + 3, y: this.y - 10 },
            end: { x: this.x + this.width + 3, y: this.y + this.height + 5 }
        };
        
        const bottom = {
            start: { x: this.x - 5, y: this.y + this.height + 3 },
            end: { x: this.x + this.width + 5, y: this.y + this.height + 3 }
        };
        
        const bottomBackup = {
            start: { x: this.x - 5, y: this.y + this.height + 8 },
            end: { x: this.x + this.width + 5, y: this.y + this.height + 8 }
        };
        
        return [leftWall, rightWall, bottom, bottomBackup];
    }
    
    getWaterSurfaceY() {
        if (this.particlesInGlass.length === 0) return this.y + this.height;
        
        let minY = this.y + this.height;
        for (const p of this.particlesInGlass) {
            if (p.y < minY) minY = p.y;
        }
        return minY;
    }
}
