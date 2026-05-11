export class Card {
    constructor(type, id, x, y, layer) {
        this.type = type;
        this.id = id;
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.isBlocked = false;
        this.isSelected = false;
        this.element = null;
    }

    createElement() {
        const el = document.createElement('div');
        el.className = 'card';
        el.textContent = this.type;
        el.dataset.id = this.id;
        el.style.left = `${this.x}px`;
        el.style.top = `${this.y}px`;
        el.style.zIndex = this.layer;
        
        el.addEventListener('click', () => {
            if (!this.isBlocked && !this.isSelected) {
                this.onSelect();
            }
        });
        
        this.element = el;
        return el;
    }

    setBlocked(blocked) {
        this.isBlocked = blocked;
        if (this.element) {
            if (blocked) {
                this.element.classList.add('disabled');
            } else {
                this.element.classList.remove('disabled');
            }
        }
    }

    setSelected(selected) {
        this.isSelected = selected;
        if (this.element) {
            if (selected) {
                this.element.classList.add('selected');
            } else {
                this.element.classList.remove('selected');
            }
        }
    }

    remove() {
        if (this.element) {
            this.element.classList.add('matched');
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }, 500);
        }
    }

    onSelect() {
        if (this.onSelectCallback) {
            this.onSelectCallback(this);
        }
    }
}