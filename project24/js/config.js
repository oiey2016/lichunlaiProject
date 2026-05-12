export const CONFIG = {
    CANVAS_WIDTH: 900,
    CANVAS_HEIGHT: 600,
    
    LANE_COUNT: 3,
    LANE_WIDTH: 120,
    
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 80,
        SLIDE_HEIGHT: 40,
        JUMP_FORCE: -18,
        GRAVITY: 0.8,
        LANE_CHANGE_SPEED: 15
    },
    
    GAME: {
        INITIAL_SPEED: 8,
        MAX_SPEED: 20,
        SPEED_INCREMENT: 0.002,
        SCORE_PER_FRAME: 1,
        SPAWN_INTERVAL: 90
    },
    
    OBSTACLE: {
        WIDTH: 60,
        HEIGHT: 70,
        LOW_HEIGHT: 35
    },
    
    COLORS: {
        BACKGROUND: '#1a1a2e',
        GROUND: '#4a3728',
        LANE: '#5d4e37',
        LANE_LINE: '#8b7355',
        PLAYER: '#ff6b6b',
        PLAYER_DETAIL: '#ee5a5a',
        OBSTACLE: '#4ecdc4',
        OBSTACLE_LOW: '#ffe66d',
        COIN: '#ffd700'
    }
};