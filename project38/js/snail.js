import { CONFIG } from './config.js';

export class Snail {
    constructor() {
        this.width = CONFIG.SNAIL.WIDTH;
        this.height = CONFIG.SNAIL.HEIGHT;
        this.x = CONFIG.SNAIL.X;
        this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.height;
        this.vy = 0;
        this.isJumping = false;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.eyeBlink = 0;
        this.bodyWave = 0;
    }

    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.vy = CONFIG.JUMP_FORCE;
            this.isJumping = true;
            this.jumpCount++;
        }
    }

    update() {
        this.vy += CONFIG.GRAVITY;
        this.y += this.vy;

        const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.height;
        if (this.y >= groundY) {
            this.y = groundY;
            this.vy = 0;
            this.isJumping = false;
            this.jumpCount = 0;
        }

        this.eyeBlink = (this.eyeBlink + 1) % 180;
        this.bodyWave += 0.15;
    }

    draw(ctx) {
        const bodyY = this.y + this.height * 0.4;
        const bodyHeight = this.height * 0.6;
        const waveOffset = Math.sin(this.bodyWave) * 2;

        ctx.fillStyle = CONFIG.COLORS.SNAIL_BODY;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width * 0.6,
            bodyY + bodyHeight / 2 + waveOffset,
            this.width * 0.5,
            bodyHeight / 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = CONFIG.COLORS.SNAIL_SHELL;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width * 0.35,
            this.y + this.height * 0.35,
            this.width * 0.35,
            this.height * 0.35,
            -0.3, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const shellX = this.x + this.width * 0.35;
        const shellY = this.y + this.height * 0.35;
        for (let i = 0; i < 3; i++) {
            ctx.arc(shellX, shellY, 8 + i * 6, 0, Math.PI * 1.5);
        }
        ctx.stroke();

        const eyeY = this.y + this.height * 0.2;
        const eyeHeight = this.isJumping ? 18 : 15;
        
        ctx.strokeStyle = CONFIG.COLORS.SNAIL_BODY;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, bodyY);
        ctx.lineTo(this.x + this.width * 0.52, eyeY - eyeHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.7, bodyY);
        ctx.lineTo(this.x + this.width * 0.72, eyeY - eyeHeight + 5);
        ctx.stroke();

        const eyeOpen = this.eyeBlink < 170 || this.eyeBlink > 175;
        const eyeSize = eyeOpen ? 4 : 1;
        
        ctx.fillStyle = CONFIG.COLORS.SNAIL_EYE;
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.52, eyeY - eyeHeight, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.72, eyeY - eyeHeight + 5, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        if (eyeOpen) {
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.53, eyeY - eyeHeight - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.73, eyeY - eyeHeight + 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width * 0.45, eyeY + 5, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x + this.width * 0.78, eyeY + 8, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x + 10,
            y: this.y + 5,
            width: this.width - 20,
            height: this.height - 10
        };
    }

    reset() {
        this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.height;
        this.vy = 0;
        this.isJumping = false;
        this.jumpCount = 0;
    }
}