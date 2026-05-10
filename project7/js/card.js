export class Card {
    constructor(suit, value, id) {
        this.suit = suit;
        this.value = value;
        this.id = id;
        this.isHidden = true;
        this.element = null;
    }

    get color() {
        return (this.suit === 'hearts' || this.suit === 'diamonds') ? 'red' : 'black';
    }

    get suitSymbol() {
        const symbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return symbols[this.suit];
    }

    get displayValue() {
        if (this.value === 1) return 'A';
        if (this.value === 11) return 'J';
        if (this.value === 12) return 'Q';
        if (this.value === 13) return 'K';
        return this.value.toString();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.classList.add('card');
        this.element.dataset.cardId = this.id;
        this.updateDisplay();
        return this.element;
    }

    updateDisplay() {
        if (!this.element) return;

        if (this.isHidden) {
            this.element.classList.remove('visible', 'card-red', 'card-black');
            this.element.classList.add('hidden');
            this.element.innerHTML = '';
        } else {
            this.element.classList.remove('hidden');
            this.element.classList.add('visible', `card-${this.color}`);
            this.element.innerHTML = `
                <div class="card-top">
                    <span class="card-value">${this.displayValue}</span>
                    <span class="card-suit">${this.suitSymbol}</span>
                </div>
                <div class="card-bottom">
                    <span class="card-value">${this.displayValue}</span>
                    <span class="card-suit">${this.suitSymbol}</span>
                </div>
            `;
        }
    }

    reveal() {
        this.isHidden = false;
        this.updateDisplay();
    }

    hide() {
        this.isHidden = true;
        this.updateDisplay();
    }

    clone() {
        const newCard = new Card(this.suit, this.value, this.id);
        newCard.isHidden = this.isHidden;
        return newCard;
    }
}

export class Deck {
    constructor() {
        this.cards = [];
        this.createDeck();
    }

    createDeck() {
        this.cards = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        let cardId = 0;

        for (const suit of suits) {
            for (let value = 1; value <= 13; value++) {
                this.cards.push(new Card(suit, value, cardId++));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop();
    }

    drawMultiple(count) {
        const drawn = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            drawn.push(this.draw());
        }
        return drawn;
    }

    addCard(card) {
        this.cards.push(card);
    }

    addCards(cards) {
        this.cards.push(...cards);
    }

    size() {
        return this.cards.length;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    clear() {
        this.cards = [];
    }
}
