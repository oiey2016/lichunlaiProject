class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.facingRight = true;
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.isAttacking = false;
        this.isHurt = false;
        this.hurtTimer = 0;
        this.attackTimer = 0;
        this.attackCooldownTimer = 0;
        this.combo = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
    }

    takeDamage(damage, knockbackX = 0, knockbackY = 0) {
        if (this.isDead) return;
        
        this.health -= damage;
        this.isHurt = true;
        this.hurtTimer = 20;
        this.knockbackX = knockbackX;
        this.knockbackY = knockbackY;
        
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.onDeath();
        }
    }

    onDeath() {
    }

    updateHurtState() {
        if (this.isHurt) {
            this.hurtTimer--;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }
    }

    updateAttackState() {
        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }
    }

    updateCooldowns() {
        if (this.attackCooldownTimer > 0) {
            this.attackCooldownTimer--;
        }
    }

    applyKnockback() {
        if (this.knockbackX !== 0) {
            this.x += this.knockbackX;
            this.knockbackX *= 0.8;
            if (Math.abs(this.knockbackX) < 1) {
                this.knockbackX = 0;
            }
        }
        if (this.knockbackY !== 0) {
            this.y += this.knockbackY;
            this.knockbackY *= 0.8;
            if (Math.abs(this.knockbackY) < 1) {
                this.knockbackY = 0;
            }
        }
    }

    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }
}