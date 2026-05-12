export class InputHandler {
    constructor() {
        this.keys = {};
        this.keyJustPressed = {};
        
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keyJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    isKeyPressed(code) {
        return this.keys[code];
    }
    
    isKeyJustPressed(code) {
        const pressed = this.keyJustPressed[code];
        this.keyJustPressed[code] = false;
        return pressed;
    }
    
    getLaneChange() {
        if (this.isKeyJustPressed('ArrowLeft') || this.isKeyJustPressed('KeyA')) {
            return -1;
        }
        if (this.isKeyJustPressed('ArrowRight') || this.isKeyJustPressed('KeyD')) {
            return 1;
        }
        return 0;
    }
    
    wantsJump() {
        return this.isKeyJustPressed('ArrowUp') || 
               this.isKeyJustPressed('KeyW') || 
               this.isKeyJustPressed('Space');
    }
    
    wantsSlide() {
        return this.isKeyJustPressed('ArrowDown') || 
               this.isKeyJustPressed('KeyS');
    }
    
    reset() {
        this.keyJustPressed = {};
    }
}