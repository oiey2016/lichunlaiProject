const Config = {
    canvas: {
        width: 600,
        height: 800
    },
    
    physics: {
        gravity: 0.3,
        friction: 0.98,
        bounce: 0.3,
        waterDensity: 1
    },
    
    water: {
        particleRadius: 4,
        particlesPerDrop: 8,
        maxParticles: 1500,
        color: 'rgba(100, 180, 255, 0.8)'
    },
    
    line: {
        minWidth: 8,
        maxWidth: 12,
        color: '#5D4037',
        maxLength: 1500
    },
    
    glass: {
        fillPercentage: 80,
        color: 'rgba(200, 230, 255, 0.4)',
        borderColor: '#4FC3F7',
        borderWidth: 4
    },
    
    game: {
        winDelay: 1000,
        waterSpawnDelay: 500
    }
};
