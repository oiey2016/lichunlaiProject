export class Card {
    constructor(id, symbol, x, y, z, onBoard) {
        this.id = id;
        this.symbol = symbol;
        this.x = x;
        this.y = y;
        this.z = z;
        this.onBoard = onBoard;
        this.element = null;
    }

    createElement() {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.id = this.id;
        div.textContent = this.symbol;
        this.updatePosition(div);
        this.element = div;
        return div;
    }

    updatePosition(element) {
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;
        element.style.zIndex = this.z;
    }

    setDisabled(disabled) {
        if (this.element) {
            if (disabled) {
                this.element.classList.add('disabled');
            } else {
                this.element.classList.remove('disabled');
            }
        }
    }

    removeFromDOM() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}
