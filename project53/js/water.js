class WaterParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 2;
        this.radius = Config.water.particleRadius;
        this.inGlass = false;
    }
}

class WaterSystem {
    constructor() {
        this.particles = [];
        this.spawner = null;
        this.isSpawning = false;
    }
    
    setSpawner(x, y, width) {
        this.spawner = { x, y, width };
    }
    
    startSpawning() {
        this.isSpawning = true;
    }
    
    stopSpawning() {
        this.isSpawning = false;
    }
    
    spawnParticles() {
        if (!this.isSpawning || !this.spawner) return;
        if (this.particles.length >= Config.water.maxParticles) return;
        
        for (let i = 0; i < Config.water.particlesPerDrop; i++) {
            const x = this.spawner.x + (Math.random() - 0.5) * this.spawner.width;
            const y = this.spawner.y;
            this.particles.push(new WaterParticle(x, y));
        }
    }
    
    update(lineSegments, glassSegments, glass) {
        this.spawnParticles();
        
        for (const particle of this.particles) {
            for (let i = 0; i < 3; i++) {
                Physics.updateParticle(particle);
                
                for (const segment of lineSegments) {
                    Physics.resolveCollision(particle, segment.start, segment.end, false);
                }
                
                for (const segment of glassSegments) {
                    Physics.resolveCollision(particle, segment.start, segment.end, true);
                }
                
                if (particle.inGlass) {
                    Physics.constrainParticleInGlass(particle, glass);
                }
            }
        }
        
        this.applyParticleRepulsion();
    }
    
    applyParticleRepulsion() {
        const repulsionStrength = 0.3;
        const minDistance = Config.water.particleRadius * 2;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < minDistance && dist > 0) {
                    const force = (minDistance - dist) / minDistance * repulsionStrength;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    
                    p1.x -= nx * force;
                    p1.y -= ny * force;
                    p2.x += nx * force;
                    p2.y += ny * force;
                }
            }
        }
    }
    
    updateGlassStatus(glass) {
        for (const particle of this.particles) {
            const wasInGlass = particle.inGlass;
            particle.inGlass = glass.containsParticle(particle);
            
            if (particle.inGlass && !wasInGlass) {
                glass.addParticle(particle);
            } else if (!particle.inGlass && wasInGlass) {
                glass.removeParticle(particle);
            }
        }
    }
    
    clear() {
        this.particles = [];
    }
}
