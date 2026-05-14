class Food {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.radius = 8 + Math.random() * 6;
        this.mass = Math.floor(this.radius);
        this.color = this.getRandomColor();
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    getRandomColor() {
        const colors = [
            '#4CAF50', '#8BC34A', '#CDDC39',
            '#00BCD4', '#03A9F4', '#009688'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.pulsePhase += 0.05;
    }

    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.pos);
        const screenRadius = camera.worldToScreenScalar(this.radius);
        
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
        const finalRadius = screenRadius * pulse;

        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(screenPos.x - finalRadius * 0.3, screenPos.y - finalRadius * 0.3, finalRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }

    renderMinimap(ctx, scale) {
        ctx.beginPath();
        ctx.arc(this.pos.x * scale, this.pos.y * scale, 1, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
