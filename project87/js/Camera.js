class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.pos = new Vector(0, 0);
        this.targetPos = new Vector(0, 0);
        this.scale = 1;
        this.targetScale = 1;
    }

    follow(target) {
        this.targetPos = target.pos.clone();
        this.targetScale = Math.max(0.3, 1 - target.mass / 1000);
    }

    update() {
        const lerpFactor = 0.1;
        this.pos = this.pos.add(this.targetPos.sub(this.pos).mul(lerpFactor));
        this.scale += (this.targetScale - this.scale) * lerpFactor;
    }

    worldToScreen(worldPos) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const relative = worldPos.sub(this.pos).mul(this.scale);
        return new Vector(centerX + relative.x, centerY + relative.y);
    }

    screenToWorld(screenPos) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const relative = new Vector(screenPos.x - centerX, screenPos.y - centerY);
        return this.pos.add(relative.div(this.scale));
    }

    worldToScreenScalar(scalar) {
        return scalar * this.scale;
    }
}
