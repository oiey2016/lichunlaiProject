const GAME_CONFIG = {
    GRID_SIZE: 20,
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 600,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 5,
    MIN_SPEED: 50,
    FOOD_POINTS: 10,
    COLORS: {
        BACKGROUND: '#1a1a2e',
        GRID: '#16213e',
        SNAKE_HEAD: '#00ff88',
        SNAKE_BODY: '#00cc6a',
        FOOD: '#ff4757',
        BORDER: '#0f3460'
    }
};

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

const GAME_STATE = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};
