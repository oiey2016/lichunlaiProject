import { Deck } from './card.js';

export class Game {
    constructor() {
        this.reset();
    }

    reset() {
        this.deck = new Deck();
        this.deck.shuffle();

        this.stock = [];
        this.waste = [];

        this.foundation = [[], [], [], []];

        this.tableau = [[], [], [], [], [], [], []];

        this.score = 0;
        this.moves = 0;
        this.history = [];
    }

    deal() {
        for (let col = 0; col < 7; col++) {
            for (let row = col; row < 7; row++) {
                const card = this.deck.draw();
                if (row === col) {
                    card.reveal();
                }
                this.tableau[row].push(card);
            }
        }

        while (!this.deck.isEmpty()) {
            this.stock.push(this.deck.draw());
        }
    }

    canMoveToTableau(cards, targetColumnIndex) {
        if (cards.length === 0) return false;

        const firstCard = cards[0];
        const targetColumn = this.tableau[targetColumnIndex];

        if (targetColumn.length === 0) {
            return firstCard.value === 13;
        }

        const lastCard = targetColumn[targetColumn.length - 1];
        return (lastCard.value - 1 === firstCard.value) &&
               (lastCard.color !== firstCard.color) &&
               !lastCard.isHidden;
    }

    canMoveToFoundation(card, foundationIndex) {
        const foundationPile = this.foundation[foundationIndex];

        if (foundationPile.length === 0) {
            return card.value === 1;
        }

        const lastCard = foundationPile[foundationPile.length - 1];
        return (lastCard.value + 1 === card.value) &&
               (lastCard.suit === card.suit);
    }

    drawFromStock() {
        if (this.stock.length === 0 && this.waste.length === 0) {
            return null;
        }

        let movedCards = [];

        if (this.stock.length === 0) {
            while (this.waste.length > 0) {
                this.stock.push(this.waste.pop());
            }
            movedCards = this.stock.slice();
        } else {
            const card = this.stock.pop();
            card.reveal();
            this.waste.push(card);
            movedCards = [card];
        }

        this.saveHistory();
        return movedCards;
    }

    moveCardsFromWasteToTableau(targetColumnIndex) {
        if (this.waste.length === 0) return false;

        const card = this.waste[this.waste.length - 1];
        if (!this.canMoveToTableau([card], targetColumnIndex)) return false;

        this.saveHistory();
        this.waste.pop();
        this.tableau[targetColumnIndex].push(card);
        this.score += 5;
        this.moves++;
        return true;
    }

    moveCardsFromWasteToFoundation(foundationIndex) {
        if (this.waste.length === 0) return false;

        const card = this.waste[this.waste.length - 1];
        if (!this.canMoveToFoundation(card, foundationIndex)) return false;

        this.saveHistory();
        this.waste.pop();
        this.foundation[foundationIndex].push(card);
        this.score += 10;
        this.moves++;
        return true;
    }

    moveCardsFromTableauToTableau(sourceColumnIndex, startIndex, targetColumnIndex) {
        const sourceColumn = this.tableau[sourceColumnIndex];
        if (startIndex >= sourceColumn.length) return false;

        const cardsToMove = sourceColumn.slice(startIndex);
        if (!this.canMoveToTableau(cardsToMove, targetColumnIndex)) return false;

        this.saveHistory();

        for (let i = startIndex; i < sourceColumn.length; i++) {
            this.tableau[targetColumnIndex].push(sourceColumn[i]);
        }
        sourceColumn.splice(startIndex);

        if (sourceColumn.length > 0) {
            const lastCard = sourceColumn[sourceColumn.length - 1];
            if (lastCard.isHidden) {
                lastCard.reveal();
                this.score += 5;
            }
        }

        this.moves++;
        return true;
    }

    moveCardsFromTableauToFoundation(sourceColumnIndex, foundationIndex) {
        const sourceColumn = this.tableau[sourceColumnIndex];
        if (sourceColumn.length === 0) return false;

        const card = sourceColumn[sourceColumn.length - 1];
        if (card.isHidden) return false;
        if (!this.canMoveToFoundation(card, foundationIndex)) return false;

        this.saveHistory();
        sourceColumn.pop();
        this.foundation[foundationIndex].push(card);
        this.score += 10;
        this.moves++;

        if (sourceColumn.length > 0) {
            const lastCard = sourceColumn[sourceColumn.length - 1];
            if (lastCard.isHidden) {
                lastCard.reveal();
                this.score += 5;
            }
        }

        return true;
    }

    autoMoveToFoundation() {
        for (let col = 0; col < 7; col++) {
            const column = this.tableau[col];
            if (column.length === 0) continue;

            const card = column[column.length - 1];
            if (card.isHidden) continue;

            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(card, f)) {
                    return this.moveCardsFromTableauToFoundation(col, f);
                }
            }
        }

        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];
            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(card, f)) {
                    return this.moveCardsFromWasteToFoundation(f);
                }
            }
        }

        return false;
    }

    isWon() {
        for (let i = 0; i < 4; i++) {
            if (this.foundation[i].length !== 13) {
                return false;
            }
        }
        return true;
    }

    saveHistory() {
        const state = {
            stock: this.stock.map(card => card.clone()),
            waste: this.waste.map(card => card.clone()),
            foundation: this.foundation.map(pile => pile.map(card => card.clone())),
            tableau: this.tableau.map(col => col.map(card => card.clone())),
            score: this.score,
            moves: this.moves
        };
        this.history.push(state);
    }

    undo() {
        if (this.history.length === 0) return false;

        const previousState = this.history.pop();

        this.stock = previousState.stock;
        this.waste = previousState.waste;
        this.foundation = previousState.foundation;
        this.tableau = previousState.tableau;
        this.score = previousState.score;
        this.moves = previousState.moves;

        return true;
    }

    getGameState() {
        return {
            stock: this.stock,
            waste: this.waste,
            foundation: this.foundation,
            tableau: this.tableau,
            score: this.score,
            moves: this.moves
        };
    }
}
