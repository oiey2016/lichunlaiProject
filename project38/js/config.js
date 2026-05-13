export const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    GROUND_HEIGHT: 80,
    GRAVITY: 0.6,
    JUMP_FORCE: -14,
    
    SNAIL: {
        WIDTH: 50,
        HEIGHT: 40,
        X: 100
    },
    
    OBSTACLE: {
        MIN_WIDTH: 30,
        MAX_WIDTH: 60,
        MIN_HEIGHT: 40,
        MAX_HEIGHT: 80,
        MIN_GAP: 250,
        MAX_GAP: 400
    },
    
    LEVEL: {
        BASE_SPEED: 4,
        SPEED_INCREMENT: 0.5,
        OBSTACLES_PER_LEVEL: 8,
        MAX_LEVEL: 10
    },
    
    COLORS: {
        SKY_TOP: '#87CEEB',
        SKY_BOTTOM: '#E0F7FA',
        GROUND_TOP: '#90EE90',
        GROUND_BOTTOM: '#228B22',
        SNAIL_BODY: '#DEB887',
        SNAIL_SHELL: '#8B4513',
        SNAIL_EYE: '#000',
        OBSTACLE: '#8B0000',
        OBSTACLE_TOP: '#CD5C5C',
        FINISH_LINE: '#FFD700'
    }
};