function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
    return distance(x1, y1, x2, y2) < r1 + r2;
}

function rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

const Colors = {
    player: '#6c5ce7',
    playerGlow: 'rgba(108, 92, 231, 0.5)',
    enemy: '#ff6b6b',
    enemyGlow: 'rgba(255, 107, 107, 0.5)',
    bullet: '#ffd93d',
    bulletGlow: 'rgba(255, 217, 61, 0.6)',
    sword: '#00cec9',
    swordGlow: 'rgba(0, 206, 201, 0.6)',
    health: '#ff6b6b',
    score: '#ffd93d'
};

const GameConfig = {
    canvasWidth: 1000,
    canvasHeight: 700,
    playerSpeed: 5,
    playerHealth: 100,
    bulletSpeed: 12,
    bulletDamage: 20,
    swordDamage: 40,
    swordRange: 80,
    swordCooldown: 500,
    shootCooldown: 200,
    enemySpeed: 2,
    enemyHealth: 60,
    enemyDamage: 10,
    enemySpawnRate: 2000,
    waveEnemyIncrease: 2
};
