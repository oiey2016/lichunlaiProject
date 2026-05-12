let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    const originalBallJump = game.ball ? game.ball.jump.bind(game.ball) : null;
    if (game.ball) {
        game.ball.jump = function() {
            audioSystem.playJump();
            originalBallJump.call(this);
        };
    }
    
    document.getElementById('start-btn').addEventListener('click', () => {
        audioSystem.init();
        audioSystem.startBackgroundMusic();
        game.start();
        
        const ballJump = game.ball.jump.bind(game.ball);
        game.ball.jump = function() {
            audioSystem.playJump();
            ballJump.call(this);
        };
        
        const originalCheckCollisions = game.checkCollisions.bind(game);
        game.checkCollisions = function() {
            const ball = this.ball;
            let scorePlayed = false;
            
            for (const obs of this.obstacles) {
                if (obs.passed) continue;
                
                const dx = Math.abs(ball.x - (obs.x - this.cameraX));
                const dy = Math.abs(ball.y - obs.y);
                
                if (dx < ball.radius + obs.width / 2 && dy < ball.radius + obs.height / 2) {
                    if (ball.isJumping && ball.vy > 0 && ball.y < obs.y) {
                        obs.passed = true;
                        this.combo++;
                        this.maxCombo = Math.max(this.maxCombo, this.combo);
                        this.score += 100 * this.combo;
                        
                        audioSystem.playScore();
                        
                        for (let i = 0; i < 15; i++) {
                            this.particles.push(new Particle(obs.x - this.cameraX, obs.y, '#64d8ff'));
                        }
                    } else {
                        this.combo = 0;
                        audioSystem.playGameOver();
                        audioSystem.stopBackgroundMusic();
                        this.gameOver();
                        return;
                    }
                }
            }
        };
        
        const originalGameOver = game.gameOver.bind(game);
        game.gameOver = function() {
            audioSystem.playGameOver();
            audioSystem.stopBackgroundMusic();
            originalGameOver.call(this);
        };
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        audioSystem.startBackgroundMusic();
        game.start();
        
        const ballJump = game.ball.jump.bind(game.ball);
        game.ball.jump = function() {
            audioSystem.playJump();
            ballJump.call(this);
        };
    });
    
    document.getElementById('resume-btn').addEventListener('click', () => {
        audioSystem.startBackgroundMusic();
        game.resume();
    });
    
    document.getElementById('quit-btn').addEventListener('click', () => {
        audioSystem.stopBackgroundMusic();
        game.hideAllScreens();
        document.getElementById('start-screen').classList.add('active');
        game.gameState = 'start';
    });
});
