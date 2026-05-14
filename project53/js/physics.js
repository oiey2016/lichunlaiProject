class Physics {
    static pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return {
            distance: Math.sqrt(dx * dx + dy * dy),
            closestPoint: { x: xx, y: yy },
            param: param
        };
    }
    
    static circleLineCollision(circle, lineStart, lineEnd, radius) {
        const result = this.pointToLineDistance(circle, lineStart, lineEnd);
        return result.distance <= radius;
    }
    
    static resolveCollision(particle, lineStart, lineEnd, isGlass = false) {
        const result = this.pointToLineDistance(particle, lineStart, lineEnd);
        
        const collisionThreshold = isGlass ? particle.radius * 1.5 : particle.radius * 1.2;
        
        if (result.distance < collisionThreshold) {
            const normal = {
                x: particle.x - result.closestPoint.x,
                y: particle.y - result.closestPoint.y
            };
            
            const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            if (len > 0) {
                normal.x /= len;
                normal.y /= len;
            }
            
            const penetration = collisionThreshold - result.distance;
            particle.x += normal.x * penetration * 1.1;
            particle.y += normal.y * penetration * 1.1;
            
            const dotProduct = particle.vx * normal.x + particle.vy * normal.y;
            
            const bounceFactor = isGlass ? Config.physics.bounce * 0.5 : Config.physics.bounce;
            particle.vx -= 2 * dotProduct * normal.x * bounceFactor;
            particle.vy -= 2 * dotProduct * normal.y * bounceFactor;
            
            const frictionFactor = isGlass ? Config.physics.friction * 0.95 : Config.physics.friction;
            particle.vx *= frictionFactor;
            particle.vy *= frictionFactor;
        }
    }
    
    static updateParticle(particle) {
        particle.vy += Config.physics.gravity;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x - particle.radius < 0) {
            particle.x = particle.radius;
            particle.vx *= -Config.physics.bounce;
        }
        if (particle.x + particle.radius > Config.canvas.width) {
            particle.x = Config.canvas.width - particle.radius;
            particle.vx *= -Config.physics.bounce;
        }
        if (particle.y + particle.radius > Config.canvas.height) {
            particle.y = Config.canvas.height - particle.radius;
            particle.vy *= -Config.physics.bounce * 0.8;
            particle.vx *= Config.physics.friction;
        }
    }
    
    static constrainParticleInGlass(particle, glass) {
        const leftBound = glass.x + particle.radius + 5;
        const rightBound = glass.x + glass.width - particle.radius - 5;
        const bottomBound = glass.y + glass.height - particle.radius - 2;
        
        if (particle.x < leftBound) {
            particle.x = leftBound;
            if (particle.vx < 0) particle.vx *= -0.3;
        }
        if (particle.x > rightBound) {
            particle.x = rightBound;
            if (particle.vx > 0) particle.vx *= -0.3;
        }
        if (particle.y > bottomBound) {
            particle.y = bottomBound;
            if (particle.vy > 0) particle.vy *= -0.2;
            particle.vx *= 0.98;
        }
    }
}
