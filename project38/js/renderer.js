import { CONFIG } from './config.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.clouds = this.generateClouds();
        this.grass = this.generateGrass();
        this.backgroundOffset = 0;
    }

    generateClouds() {
        const clouds = [];
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: 30 + Math.random() * 80,
                scale: 0.5 + Math.random() * 0.8
            });
        }
        return clouds;
    }

    generateGrass() {
        const grass = [];
        for (let i = 0; i < 40; i++) {
            grass.push({
                x: i * 25 + Math.random() * 10,
                height: 10 + Math.random() * 15,
                sway: Math.random() * Math.PI * 2
            });
        }
        return grass;
    }

    drawBackground() {
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#B0E0E6');
        skyGradient.addColorStop(1, '#E0F7FA');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT);

        this.drawSun();
        this.drawClouds();
    }

    drawSun() {
        const sunX = 700;
        const sunY = 60;
        
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
        sunGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        sunGradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.5)');
        sunGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFF8DC';
        this.ctx.beginPath();
        this.ctx.arc(sunX - 8, sunY - 8, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y, cloud.scale);
        }
    }

    drawCloud(x, y, scale) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 60 * scale, y, 25 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 30 * scale, y + 10 * scale, 20 * scale, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGround() {
        const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
        
        const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, CONFIG.CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#90EE90');
        groundGradient.addColorStop(0.3, '#32CD32');
        groundGradient.addColorStop(1, '#228B22');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, groundY, CONFIG.CANVAS_WIDTH, CONFIG.GROUND_HEIGHT);

        this.drawGrass(groundY);

        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.2)';
        this.ctx.fillRect(0, groundY, CONFIG.CANVAS_WIDTH, 5);
    }

    drawGrass(groundY) {
        const time = Date.now() * 0.002;
        for (const g of this.grass) {
            const sway = Math.sin(time + g.sway) * 3;
            this.ctx.strokeStyle = '#228B22';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(g.x, groundY);
            this.ctx.quadraticCurveTo(g.x + sway, groundY - g.height / 2, g.x + sway * 2, groundY - g.height);
            this.ctx.stroke();
        }
    }

    updateClouds(speed) {
        for (const cloud of this.clouds) {
            cloud.x -= speed * 0.3;
            if (cloud.x < -100) {
                cloud.x = CONFIG.CANVAS_WIDTH + 100;
                cloud.y = 30 + Math.random() * 80;
                cloud.scale = 0.5 + Math.random() * 0.8;
            }
        }
    }

    render(snail, obstacleManager, speed) {
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.drawBackground();
        this.drawGround();
        obstacleManager.draw(this.ctx);
        snail.draw(this.ctx);
        
        this.updateClouds(speed);
    }
}