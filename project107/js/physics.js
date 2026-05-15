class Physics {
    static applyGravity(entity) {
        entity.velocityY += GRAVITY;
    }

    static updatePosition(entity) {
        entity.x += entity.velocityX;
        entity.y += entity.velocityY;
    }

    static checkGroundCollision(entity) {
        const groundLevel = GROUND_Y - entity.height;
        if (entity.y >= groundLevel) {
            entity.y = groundLevel;
            entity.velocityY = 0;
            entity.isGrounded = true;
            return true;
        }
        entity.isGrounded = false;
        return false;
    }

    static checkBoundaryCollision(entity) {
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocityX = 0;
        }
        if (entity.x > GAME_WIDTH - entity.width) {
            entity.x = GAME_WIDTH - entity.width;
            entity.velocityX = 0;
        }
    }

    static checkCollision(entityA, entityB) {
        return (
            entityA.x < entityB.x + entityB.width &&
            entityA.x + entityA.width > entityB.x &&
            entityA.y < entityB.y + entityB.height &&
            entityA.y + entityA.height > entityB.y
        );
    }

    static checkAttackHit(attacker, target, attackRange, attackHeight = 50) {
        const attackX = attacker.facingRight 
            ? attacker.x + attacker.width 
            : attacker.x - attackRange;
        
        const attackY = attacker.y + attacker.height - attackHeight;

        return (
            attackX < target.x + target.width &&
            attackX + attackRange > target.x &&
            attackY < target.y + target.height &&
            attackY + attackHeight > target.y
        );
    }

    static getDistance(entityA, entityB) {
        const dx = (entityA.x + entityA.width / 2) - (entityB.x + entityB.width / 2);
        const dy = (entityA.y + entityA.height / 2) - (entityB.y + entityB.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
}