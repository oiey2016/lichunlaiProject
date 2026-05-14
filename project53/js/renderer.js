class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = Config.canvas.width;
        this.canvas.height = Config.canvas.height;
    }
    
    clear() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#E0F6FF');
        gradient.addColorStop(1, '#FFF8DC');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawClouds();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        const clouds = [
            { x: 50, y: 80, size: 40 },
            { x: 150, y: 50, size: 50 },
            { x: 450, y: 70, size: 45 },
            { x: 520, y: 100, size: 35 }
        ];
        
        for (const cloud of clouds) {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.7, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawSpawner(spawner) {
        if (!spawner) return;
        
        this.ctx.fillStyle = '#555';
        this.ctx.beginPath();
        this.ctx.roundRect(spawner.x - spawner.width / 2, spawner.y - 20, spawner.width, 30, 5);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.roundRect(spawner.x - spawner.width / 2 + 10, spawner.y - 10, spawner.width - 20, 15, 3);
        this.ctx.fill();
        
        const gradient = this.ctx.createLinearGradient(spawner.x, spawner.y, spawner.x, spawner.y + 30);
        gradient.addColorStop(0, 'rgba(100, 180, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(spawner.x, spawner.y + 15, spawner.width / 3, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGlass(glass) {
        this.ctx.save();
        
        const borderGradient = this.ctx.createLinearGradient(glass.x, glass.y, glass.x + glass.width, glass.y);
        borderGradient.addColorStop(0, 'rgba(79, 195, 247, 0.8)');
        borderGradient.addColorStop(0.5, 'rgba(79, 195, 247, 1)');
        borderGradient.addColorStop(1, 'rgba(79, 195, 247, 0.8)');
        
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = Config.glass.borderWidth;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(glass.x - 5, glass.y);
        this.ctx.lineTo(glass.x, glass.y + glass.height);
        this.ctx.quadraticCurveTo(glass.x + glass.width / 2, glass.y + glass.height + 10, glass.x + glass.width, glass.y + glass.height);
        this.ctx.lineTo(glass.x + glass.width + 5, glass.y);
        this.ctx.stroke();
        
        const fillPercentage = glass.getFillPercentage();
        if (fillPercentage > 0) {
            const waterHeight = (fillPercentage / 100) * glass.height;
            const waterY = glass.y + glass.height - waterHeight;
            
            const waterGradient = this.ctx.createLinearGradient(glass.x, waterY, glass.x, glass.y + glass.height);
            waterGradient.addColorStop(0, 'rgba(100, 180, 255, 0.7)');
            waterGradient.addColorStop(1, 'rgba(66, 165, 245, 0.9)');
            
            this.ctx.fillStyle = waterGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(glass.x + 5, waterY);
            this.ctx.lineTo(glass.x + 5, glass.y + glass.height - 5);
            this.ctx.quadraticCurveTo(glass.x + glass.width / 2, glass.y + glass.height, glass.x + glass.width - 5, glass.y + glass.height - 5);
            this.ctx.lineTo(glass.x + glass.width - 5, waterY);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(glass.x + 10, waterY + waterHeight * 0.3);
            this.ctx.quadraticCurveTo(glass.x + 20, waterY + waterHeight * 0.5, glass.x + 15, waterY + waterHeight * 0.7);
            this.ctx.stroke();
        }
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(glass.x + glass.width * 0.3, glass.y + glass.height * 0.5, 5, glass.height * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawObstacles(obstacles) {
        for (const obstacle of obstacles) {
            const gradient = this.ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
            gradient.addColorStop(0, '#8D6E63');
            gradient.addColorStop(1, '#5D4037');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#4E342E';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawLines(lineManager) {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = Config.line.maxWidth;
        this.ctx.strokeStyle = Config.line.color;
        
        for (const line of lineManager.lines) {
            if (line.points.length < 2) continue;
            
            this.ctx.beginPath();
            this.ctx.moveTo(line.points[0].x, line.points[0].y);
            
            for (let i = 1; i < line.points.length; i++) {
                this.ctx.lineTo(line.points[i].x, line.points[i].y);
            }
            
            this.ctx.stroke();
        }
        
        if (lineManager.currentLine && lineManager.currentLine.points.length > 1) {
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.moveTo(lineManager.currentLine.points[0].x, lineManager.currentLine.points[0].y);
            
            for (let i = 1; i < lineManager.currentLine.points.length; i++) {
                this.ctx.lineTo(lineManager.currentLine.points[i].x, lineManager.currentLine.points[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawWater(waterSystem) {
        for (const particle of waterSystem.particles) {
            const gradient = this.ctx.createRadialGradient(
                particle.x - 1, particle.y - 1, 0,
                particle.x, particle.y, particle.radius
            );
            gradient.addColorStop(0, 'rgba(150, 210, 255, 1)');
            gradient.addColorStop(1, 'rgba(66, 165, 245, 0.8)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawUI(lineManager) {
        const remaining = lineManager.getRemainingLength();
        const percentage = (remaining / Config.line.maxLength) * 100;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(20, this.canvas.height - 30, this.canvas.width - 40, 10);
        
        const barColor = percentage > 30 ? '#4CAF50' : percentage > 10 ? '#FF9800' : '#F44336';
        this.ctx.fillStyle = barColor;
        this.ctx.fillRect(20, this.canvas.height - 30, (this.canvas.width - 40) * (percentage / 100), 10);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('墨水剩余', this.canvas.width / 2, this.canvas.height - 35);
    }
}
