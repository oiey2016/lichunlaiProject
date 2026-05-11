import { Card } from './Card.js';

export class GameBoard {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.cardTypes = ['🐑', '🐔', '🐷', '🐮', '🐰', '🐱', '🐶', '🐸', '🦊', '🐻', '🐼', '🐨'];
        this.selectedSlots = [];
        this.maxSlots = 7;
        this.history = [];
        this.level = 1;
    }

    init(level = 1) {
        this.level = level;
        this.clear();
        this.generateCards(level);
        this.render();
        this.updateBlockedStatus();
    }

    clear() {
        this.container.innerHTML = '';
        this.cards = [];
        this.selectedSlots = [];
        this.history = [];
    }

    generateCards(level) {
        const typeCount = Math.min(3 + level, this.cardTypes.length);
        const pairsPerType = 3 * (2 + level);
        const totalCards = typeCount * pairsPerType;

        const types = this.cardTypes.slice(0, typeCount);
        let cardPool = [];
        
        types.forEach(type => {
            for (let i = 0; i < pairsPerType; i++) {
                cardPool.push(type);
            }
        });

        this.shuffleArray(cardPool);

        const layout = this.generateLayout(totalCards, level);
        
        let idCounter = 0;
        layout.forEach((pos, index) => {
            if (index < cardPool.length) {
                const card = new Card(
                    cardPool[index],
                    idCounter++,
                    pos.x,
                    pos.y,
                    pos.layer
                );
                card.onSelectCallback = (card) => this.onCardSelect(card);
                this.cards.push(card);
            }
        });
    }

    generateLayout(totalCards, level) {
        const positions = [];
        const cardWidth = 60;
        const cardHeight = 75;
        const offsetX = 25;
        const offsetY = 25;
        const cols = 6;
        const rows = 5;
        const layers = Math.ceil(totalCards / (cols * rows));

        let cardIndex = 0;
        for (let layer = 0; layer < layers && cardIndex < totalCards; layer++) {
            const layerOffset = layer * 8;
            const layerCols = Math.max(cols - layer, 3);
            const layerRows = Math.max(rows - layer, 3);
            const startX = offsetX + layer * 30;
            const startY = offsetY + layer * 30;

            for (let row = 0; row < layerRows && cardIndex < totalCards; row++) {
                for (let col = 0; col < layerCols && cardIndex < totalCards; col++) {
                    const x = startX + col * (cardWidth * 0.8);
                    const y = startY + row * (cardHeight * 0.8);
                    
                    const jitterX = (Math.random() - 0.5) * 10;
                    const jitterY = (Math.random() - 0.5) * 10;
                    
                    positions.push({
                        x: x + jitterX,
                        y: y + jitterY,
                        layer: layer
                    });
                    cardIndex++;
                }
            }
        }

        return positions;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    render() {
        this.cards.forEach(card => {
            const el = card.createElement();
            this.container.appendChild(el);
        });
    }

    updateBlockedStatus() {
        this.cards.forEach(card => {
            if (card.isSelected) {
                card.setBlocked(false);
                return;
            }

            const isBlocked = this.cards.some(otherCard => {
                if (otherCard === card || otherCard.isSelected) return false;
                if (otherCard.layer <= card.layer) return false;

                const overlap = this.checkOverlap(card, otherCard);
                return overlap;
            });

            card.setBlocked(isBlocked);
        });
    }

    checkOverlap(card1, card2) {
        const overlapThreshold = 0.3;
        const cardWidth = 60;
        const cardHeight = 75;

        const overlapArea = this.calculateOverlapArea(
            card1.x, card1.y, cardWidth, cardHeight,
            card2.x, card2.y, cardWidth, cardHeight
        );

        const cardArea = cardWidth * cardHeight;
        return (overlapArea / cardArea) > overlapThreshold;
    }

    calculateOverlapArea(x1, y1, w1, h1, x2, y2, w2, h2) {
        const xOverlap = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
        const yOverlap = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));
        return xOverlap * yOverlap;
    }

    onCardSelect(card) {
        if (this.selectedSlots.length >= this.maxSlots) {
            return;
        }

        this.saveHistory();

        card.setSelected(true);
        this.selectedSlots.push(card);
        this.updateBlockedStatus();
        this.checkMatches();
        
        if (this.onStateChangeCallback) {
            this.onStateChangeCallback();
        }
    }

    checkMatches() {
        const typeCounts = {};
        this.selectedSlots.forEach(card => {
            typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
        });

        for (const [type, count] of Object.entries(typeCounts)) {
            if (count >= 3) {
                this.removeMatchedCards(type);
                break;
            }
        }
    }

    removeMatchedCards(type) {
        const matchedCards = this.selectedSlots.filter(card => card.type === type).slice(0, 3);
        
        matchedCards.forEach(card => {
            card.remove();
            const index = this.selectedSlots.indexOf(card);
            if (index > -1) {
                this.selectedSlots.splice(index, 1);
            }
            
            const cardIndex = this.cards.indexOf(card);
            if (cardIndex > -1) {
                this.cards.splice(cardIndex, 1);
            }
        });

        this.updateBlockedStatus();
        setTimeout(() => {
            if (this.onStateChangeCallback) {
                this.onStateChangeCallback();
            }
            this.checkGameStatus();
        }, 500);
    }

    checkGameStatus() {
        if (this.cards.length === 0) {
            if (this.onGameWinCallback) {
                this.onGameWinCallback();
            }
        } else if (this.selectedSlots.length >= this.maxSlots) {
            if (this.onGameLoseCallback) {
                this.onGameLoseCallback();
            }
        }
    }

    saveHistory() {
        const state = {
            cards: this.cards.map(card => ({
                id: card.id,
                type: card.type,
                x: card.x,
                y: card.y,
                layer: card.layer,
                isSelected: card.isSelected
            })),
            selectedSlots: this.selectedSlots.map(card => card.id)
        };
        this.history.push(state);
        if (this.history.length > 10) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length === 0) return false;

        const prevState = this.history.pop();
        
        this.selectedSlots.forEach(card => {
            card.setSelected(false);
        });
        this.selectedSlots = [];

        prevState.selectedSlots.forEach(cardId => {
            const card = this.cards.find(c => c.id === cardId);
            if (card) {
                card.setSelected(true);
                this.selectedSlots.push(card);
            }
        });

        this.updateBlockedStatus();
        if (this.onStateChangeCallback) {
            this.onStateChangeCallback();
        }
        
        return true;
    }

    shuffle() {
        this.saveHistory();

        const positions = this.cards.map(card => ({
            x: card.x,
            y: card.y,
            layer: card.layer
        }));

        this.shuffleArray(positions);

        this.cards.forEach((card, index) => {
            card.x = positions[index].x;
            card.y = positions[index].y;
            card.layer = positions[index].layer;
            
            if (card.element) {
                card.element.style.left = `${card.x}px`;
                card.element.style.top = `${card.y}px`;
                card.element.style.zIndex = card.layer;
            }
        });

        this.updateBlockedStatus();
        if (this.onStateChangeCallback) {
            this.onStateChangeCallback();
        }
    }

    getSelectedSlots() {
        return this.selectedSlots;
    }

    getRemainingCards() {
        return this.cards.length;
    }

    canUndo() {
        return this.history.length > 0;
    }
}