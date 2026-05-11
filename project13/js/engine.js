const PhysicsEngine = (function() {
    const GRAVITY = 0.6;
    const FRICTION = 0.98;
    const BOUNCE = 0.3;
    const MAX_SPEED = 15;

    function updatePhysics(fruit, canvas, fruits) {
        fruit.vy += GRAVITY;
        fruit.vx *= FRICTION;
        
        fruit.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, fruit.vx));
        fruit.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, fruit.vy));
        
        fruit.x += fruit.vx;
        fruit.y += fruit.vy;
        
        checkWallCollision(fruit, canvas);
    }
    
    function checkWallCollision(fruit, canvas) {
        if (fruit.x - fruit.radius < 0) {
            fruit.x = fruit.radius;
            fruit.vx = -fruit.vx * BOUNCE;
        }
        if (fruit.x + fruit.radius > canvas.width) {
            fruit.x = canvas.width - fruit.radius;
            fruit.vx = -fruit.vx * BOUNCE;
        }
        if (fruit.y + fruit.radius > canvas.height) {
            fruit.y = canvas.height - fruit.radius;
            fruit.vy = -fruit.vy * BOUNCE;
            fruit.vx *= 0.9;
            if (Math.abs(fruit.vy) < 0.5) {
                fruit.vy = 0;
            }
        }
    }
    
    function checkCollision(fruit1, fruit2) {
        const dx = fruit2.x - fruit1.x;
        const dy = fruit2.y - fruit1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < fruit1.radius + fruit2.radius;
    }
    
    function resolveCollision(fruit1, fruit2) {
        const dx = fruit2.x - fruit1.x;
        const dy = fruit2.y - fruit1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const overlap = fruit1.radius + fruit2.radius - distance;
        
        const nx = dx / distance;
        const ny = dy / distance;
        
        const totalMass = fruit1.mass + fruit2.mass;
        fruit1.x -= nx * overlap * (fruit2.mass / totalMass);
        fruit1.y -= ny * overlap * (fruit2.mass / totalMass);
        fruit2.x += nx * overlap * (fruit1.mass / totalMass);
        fruit2.y += ny * overlap * (fruit1.mass / totalMass);
        
        const dvx = fruit2.vx - fruit1.vx;
        const dvy = fruit2.vy - fruit1.vy;
        const dvn = dvx * nx + dvy * ny;
        
        if (dvn > 0) return;
        
        const restitution = 0.4;
        const impulse = -(1 + restitution) * dvn / totalMass;
        
        fruit1.vx -= impulse * nx * fruit2.mass;
        fruit1.vy -= impulse * ny * fruit2.mass;
        fruit2.vx += impulse * nx * fruit1.mass;
        fruit2.vy += impulse * ny * fruit1.mass;
        
        const friction = 0.3;
        const tx = -ny;
        const ty = nx;
        const dvt = dvx * tx + dvy * ty;
        const frictionImpulse = -dvt / totalMass;
        
        fruit1.vx -= frictionImpulse * tx * fruit2.mass * friction;
        fruit1.vy -= frictionImpulse * ty * fruit2.mass * friction;
        fruit2.vx += frictionImpulse * tx * fruit1.mass * friction;
        fruit2.vy += frictionImpulse * ty * fruit1.mass * friction;
    }
    
    return {
        updatePhysics,
        checkCollision,
        resolveCollision,
        GRAVITY,
        FRICTION,
        BOUNCE
    };
})();
