class Player extends Entity {
    constructor(x, y) {
        super(x, y, PLAYER_CONFIG.width, PLAYER_CONFIG.height);
        this.maxHealth = PLAYER_CONFIG.maxHealth;
        this.health = this.maxHealth;
        this.speed = PLAYER_CONFIG.speed;
        this.jumpForce = PLAYER_CONFIG.jumpForce;
        this.attackType = null;
        this.specialCooldownTimer = 0;
        this.specialEnergy = 100;
        this.isSpecialAttacking = false;
        this.specialTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(input, enemies) {
        if (this.isDead) return;

        this.updateHurtState();
        this.updateAttackState();
        this.updateCooldowns();
        this.updateSpecialState();

        if (!this.isHurt && !this.isSpecialAttacking) {
            this.handleMovement(input);
            this.handleJumping(input);
            this.handleAttacks(input, enemies);
        }

        this.applyKnockback();

        if (!this.isSpecialAttacking) {
            Physics.applyGravity(this);
            Physics.updatePosition(this);
            Physics.checkGroundCollision(this);
            Physics.checkBoundaryCollision(this);
        }

        this.updateAnimation();
        this.regenerateEnergy();
    }

    updateSpecialState() {
        if (this.isSpecialAttacking) {
            this.specialTimer--;
            if (this.specialTimer <= 0) {
                this.isSpecialAttacking = false;
            }
        }
        if (this.specialCooldownTimer > 0) {
            this.specialCooldownTimer--;
        }
    }

    handleMovement(input) {
        if (this.isAttacking) return;

        this.velocityX = 0;

        if (input.isKeyDown(KEYS.LEFT)) {
            this.velocityX = -this.speed;
            this.facingRight = false;
        }
        if (input.isKeyDown(KEYS.RIGHT)) {
            this.velocityX = this.speed;
            this.facingRight = true;
        }
    }

    handleJumping(input) {
        if (input.isKeyPressed(KEYS.UP) && this.isGrounded && !this.isAttacking) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
        }
    }

    handleAttacks(input, enemies) {
        if (this.attackCooldownTimer > 0) return;

        if (input.isKeyPressed(KEYS.PUNCH)) {
            this.punch(enemies);
        } else if (input.isKeyPressed(KEYS.KICK)) {
            this.kick(enemies);
        } else if (input.isKeyPressed(KEYS.SPECIAL) && this.specialEnergy >= 100 && this.specialCooldownTimer <= 0) {
            this.specialAttack(enemies);
        }
    }

    punch(enemies) {
        this.isAttacking = true;
        this.attackType = 'punch';
        this.attackTimer = 15;
        this.attackCooldownTimer = Math.floor(PLAYER_CONFIG.attackCooldown / 16);

        enemies.forEach(enemy => {
            if (!enemy.isDead && Physics.checkAttackHit(this, enemy, 60)) {
                enemy.takeDamage(PLAYER_CONFIG.punchDamage, this.facingRight ? 8 : -8, -3);
                this.combo++;
                this.specialEnergy = Math.min(100, this.specialEnergy + 10);
                game.effects.createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
        });
    }

    kick(enemies) {
        this.isAttacking = true;
        this.attackType = 'kick';
        this.attackTimer = 20;
        this.attackCooldownTimer = Math.floor(PLAYER_CONFIG.attackCooldown / 16);

        enemies.forEach(enemy => {
            if (!enemy.isDead && Physics.checkAttackHit(this, enemy, 80)) {
                enemy.takeDamage(PLAYER_CONFIG.kickDamage, this.facingRight ? 15 : -15, -5);
                this.combo++;
                this.specialEnergy = Math.min(100, this.specialEnergy + 15);
                game.effects.createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
        });
    }

    specialAttack(enemies) {
        this.isSpecialAttacking = true;
        this.attackType = 'special';
        this.specialTimer = 40;
        this.specialEnergy = 0;
        this.specialCooldownTimer = Math.floor(PLAYER_CONFIG.specialCooldown / 16);

        enemies.forEach(enemy => {
            if (!enemy.isDead) {
                const dist = Physics.getDistance(this, enemy);
                if (dist < 200) {
                    const knockbackDir = enemy.x > this.x ? 20 : -20;
                    enemy.takeDamage(PLAYER_CONFIG.specialDamage, knockbackDir, -15);
                    this.combo += 2;
                    game.effects.createHitEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, true);
                }
            }
        });

        game.effects.createSpecialEffect(this.x + this.width / 2, this.y + this.height / 2);
    }

    regenerateEnergy() {
        if (this.specialEnergy < 100) {
            this.specialEnergy += 0.2;
        }
    }

    updateAnimation() {
        this.animTimer++;
        if (this.animTimer >= 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        
        if (this.isHurt && this.hurtTimer % 4 < 2) {
            ctx.globalAlpha = 0.5;
        }

        if (!this.facingRight) {
            ctx.translate(this.x + this.width, 0);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, 0);
        }

        this.drawBody(ctx);
        this.drawHead(ctx);
        this.drawArms(ctx);
        this.drawLegs(ctx);

        ctx.restore();
    }

    drawBody(ctx) {
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(this.x + 15, this.y + 40, 50, 50);
        
        ctx.fillStyle = '#00cc6a';
        ctx.fillRect(this.x + 20, this.y + 45, 40, 5);
        ctx.fillRect(this.x + 20, this.y + 55, 40, 5);
        ctx.fillRect(this.x + 20, this.y + 65, 40, 5);
    }

    drawHead(ctx) {
        ctx.fillStyle = COLORS.playerHair;
        ctx.fillRect(this.x + 20, this.y, 40, 20);
        
        ctx.fillStyle = COLORS.playerSkin;
        ctx.fillRect(this.x + 20, this.y + 15, 40, 30);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 28, this.y + 25, 8, 8);
        ctx.fillRect(this.x + 44, this.y + 25, 8, 8);
        
        if (this.isAttacking || this.isSpecialAttacking) {
            ctx.fillRect(this.x + 32, this.y + 38, 16, 4);
        } else {
            ctx.fillRect(this.x + 35, this.y + 38, 10, 2);
        }
    }

    drawArms(ctx) {
        ctx.fillStyle = COLORS.playerSkin;
        
        if (this.attackType === 'punch' && this.isAttacking) {
            ctx.fillRect(this.x + 65, this.y + 45, 35, 15);
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(this.x + 95, this.y + 43, 15, 20);
        } else {
            ctx.fillRect(this.x, this.y + 45, 15, 35);
            ctx.fillRect(this.x + 65, this.y + 45, 15, 35);
        }
    }

    drawLegs(ctx) {
        ctx.fillStyle = '#2d3436';
        
        const legOffset = this.isGrounded ? Math.sin(this.animFrame * Math.PI / 2) * 5 : 0;
        
        if (this.attackType === 'kick' && this.isAttacking) {
            ctx.fillRect(this.x + 20, this.y + 90, 20, 25);
            ctx.fillRect(this.x + 40, this.y + 90, 45, 15);
        } else {
            ctx.fillRect(this.x + 20 - legOffset, this.y + 90, 18, 30);
            ctx.fillRect(this.x + 42 + legOffset, this.y + 90, 18, 30);
        }
    }
}