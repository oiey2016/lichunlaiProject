class Player extends Cell {
    constructor(x, y) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1',
            '#96CEB4', '#FFEAA7', '#DDA0DD',
            '#FF8C42', '#6C5CE7', '#A8E6CF'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        super(x, y, 10, '你', color);
        this.kills = 0;
    }

    setTarget(screenX, screenY, camera) {
        this.target = camera.screenToWorld(new Vector(screenX, screenY));
    }

    addKill() {
        this.kills++;
    }
}
