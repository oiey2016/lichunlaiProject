const GAME_WIDTH = 1200;
const GAME_HEIGHT = 700;
const GROUND_Y = 550;
const GRAVITY = 0.8;

const PLAYER_CONFIG = {
    width: 80,
    height: 120,
    speed: 6,
    jumpForce: -18,
    maxHealth: 100,
    punchDamage: 15,
    kickDamage: 25,
    specialDamage: 50,
    attackCooldown: 300,
    specialCooldown: 3000
};

const ENEMY_CONFIG = {
    width: 50,
    height: 80,
    speed: 2,
    maxHealth: 50,
    attackDamage: 10,
    attackRange: 60,
    attackCooldown: 1000,
    scoreValue: 100
};

const ENEMY_TYPES = {
    normal: {
        color: '#ff6b6b',
        health: 50,
        speed: 2,
        damage: 10,
        score: 100
    },
    fast: {
        color: '#ffd93d',
        health: 30,
        speed: 4,
        damage: 8,
        score: 150
    },
    strong: {
        color: '#6c5ce7',
        health: 100,
        speed: 1.5,
        damage: 20,
        score: 200
    }
};

const COLORS = {
    player: '#00ff88',
    playerSkin: '#ffdbac',
    playerHair: '#2d3436',
    ground: '#8B4513',
    sky: '#87ceeb',
    hitEffect: '#ff0000',
    combo: '#ffd700'
};

const LEVELS = [
    {
        name: '操场',
        background: '#87ceeb',
        groundColor: '#228B22',
        enemies: [
            { type: 'normal', count: 3 },
            { type: 'fast', count: 2 }
        ],
        spawnDelay: 2000
    },
    {
        name: '教室',
        background: '#f5f5dc',
        groundColor: '#8B4513',
        enemies: [
            { type: 'normal', count: 4 },
            { type: 'fast', count: 3 },
            { type: 'strong', count: 1 }
        ],
        spawnDelay: 1800
    },
    {
        name: '公园',
        background: '#98d8c8',
        groundColor: '#228B22',
        enemies: [
            { type: 'normal', count: 5 },
            { type: 'fast', count: 4 },
            { type: 'strong', count: 2 }
        ],
        spawnDelay: 1500
    }
];

const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    PUNCH: 'KeyJ',
    KICK: 'KeyK',
    SPECIAL: 'Space'
};