class Cell {
    constructor(x, y, mass, name, color) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.mass = mass;
        this.radius = this.massToRadius(mass);
        this.name = name;
        this.color = color;
        this.target = new Vector(x, y);
    }

    massToRadius(mass) {
        return Math.sqrt(mass) * 4;
    }

    setMass(mass) {
        this.mass = mass;
        this.radius = this.massToRadius(mass);
    }

    addMass(amount) {
        this.setMass(this.mass + amount);
    }

    getSpeed() {
        return Math.max(2, 20 - this.mass / 20);
    }

    update() {
        const desired = this.target.sub(this.pos);
        const distance = desired.mag();
        
        if (distance > 0) {
            const speed = this.getSpeed();
            const moveDistance = Math.min(speed, distance);
            const moveDir = desired.normalize().mul(moveDistance);
            this.pos = this.pos.add(moveDir);
        }
    }

    canEat(other) {
        if (this.mass <= other.mass * 1.1) return false;
        const dist = this.pos.dist(other.pos);
        return dist < this.radius * 0.8;
    }

    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.pos);
        const screenRadius = camera.worldToScreenScalar(this.radius);

        const gradient = ctx.createRadialGradient(
            screenPos.x - screenRadius * 0.3,
            screenPos.y - screenRadius * 0.3,
            0,
            screenPos.x,
            screenPos.y,
            screenRadius
        );
        gradient.addColorStop(0, this.lightenColor(this.color, 30));
        gradient.addColorStop(1, this.color);

        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (this.name && screenRadius > 20) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.max(12, screenRadius / 3)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(this.name, screenPos.x, screenPos.y);
            ctx.shadowBlur = 0;
        }
    }

    renderMinimap(ctx, scale) {
        ctx.beginPath();
        ctx.arc(this.pos.x * scale, this.pos.y * scale, Math.max(2, this.radius * scale * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    }
}
