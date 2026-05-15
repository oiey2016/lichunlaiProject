class InputManager {
    constructor() {
        this.keys = {};
        this.keyPressed = {};
        this.init();
    }

    init() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keyPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keyPressed[e.code] = false;
        });
    }

    isKeyDown(keyCode) {
        return this.keys[keyCode] === true;
    }

    isKeyPressed(keyCode) {
        const pressed = this.keyPressed[keyCode] === true;
        if (pressed) {
            this.keyPressed[keyCode] = false;
        }
        return pressed;
    }

    clear() {
        this.keyPressed = {};
    }
}