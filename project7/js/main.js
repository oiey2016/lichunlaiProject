import { Game } from './game.js';

class GameUI {
    constructor() {
        this.game = new Game();
        this.selectedCards = null;
        this.elements = {};

        this.initElements();
        this.bindEvents();
        this.startNewGame();
    }

    initElements() {
        this.elements.newGameBtn = document.getElementById('new-game-btn');
        this.elements.undoBtn = document.getElementById('undo-btn');
        this.elements.rulesBtn = document.getElementById('rules-btn');
        this.elements.score = document.getElementById('score');
        this.elements.moves = document.getElementById('moves');
        this.elements.stock = document.getElementById('stock');
        this.elements.waste = document.getElementById('waste');
        this.elements.foundations = [];
        this.elements.tableauColumns = [];
        this.elements.victoryModal = document.getElementById('victory-modal');
        this.elements.finalScore = document.getElementById('final-score');
        this.elements.finalMoves = document.getElementById('final-moves');
        this.elements.playAgainBtn = document.getElementById('play-again-btn');
        this.elements.rulesModal = document.getElementById('rules-modal');
        this.elements.closeRulesBtn = document.getElementById('close-rules-btn');
        this.elements.understandBtn = document.getElementById('understand-btn');

        for (let i = 0; i < 4; i++) {
            this.elements.foundations.push(document.getElementById(`foundation-${i}`));
        }

        for (let i = 0; i < 7; i++) {
            this.elements.tableauColumns.push(document.getElementById(`tableau-${i}`));
        }
    }

    bindEvents() {
        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.elements.undoBtn.addEventListener('click', () => this.undoMove());
        this.elements.rulesBtn.addEventListener('click', () => this.showRulesModal());
        this.elements.closeRulesBtn.addEventListener('click', () => this.hideRulesModal());
        this.elements.understandBtn.addEventListener('click', () => this.hideRulesModal());
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.hideVictoryModal();
            this.startNewGame();
        });

        this.elements.stock.addEventListener('click', () => this.handleStockClick());

        for (let i = 0; i < 4; i++) {
            this.elements.foundations[i].addEventListener('click', (e) => {
                this.handleFoundationClick(i, e);
            });
        }

        for (let i = 0; i < 7; i++) {
            this.elements.tableauColumns[i].addEventListener('click', (e) => {
                this.handleTableauClick(i, e);
            });
        }

        this.elements.rulesModal.addEventListener('click', (e) => {
            if (e.target === this.elements.rulesModal) {
                this.hideRulesModal();
            }
        });
    }

    startNewGame() {
        this.game.reset();
        this.game.deal();
        this.clearSelection();
        this.render();
    }

    undoMove() {
        if (this.game.undo()) {
            this.clearSelection();
            this.render();
        }
    }

    handleStockClick() {
        this.clearSelection();
        this.game.drawFromStock();
        this.updateStats();
        this.render();
    }

    handleTableauClick(columnIndex, event) {
        const column = this.game.tableau[columnIndex];
        if (column.length === 0) {
            if (this.selectedCards) {
                this.tryMoveSelectedToTableau(columnIndex);
            }
            return;
        }

        const clickedCard = this.getClickedCard(event);
        if (!clickedCard) return;

        const cardIndex = column.findIndex(card => card.id === clickedCard.dataset.cardId);
        if (cardIndex === -1) return;

        const card = column[cardIndex];
        if (card.isHidden) return;

        if (this.selectedCards) {
            this.tryMoveSelectedToTableau(columnIndex);
        } else {
            this.selectCardsFromTableau(columnIndex, cardIndex);
        }
    }

    handleFoundationClick(foundationIndex, event) {
        if (this.selectedCards) {
            if (this.selectedCards.source === 'tableau' && this.selectedCards.cards.length === 1) {
                this.tryMoveSelectedToFoundation(foundationIndex);
            } else if (this.selectedCards.source === 'waste' && this.selectedCards.cards.length === 1) {
                this.tryMoveSelectedToFoundation(foundationIndex);
            }
            return;
        }

        const clickedCard = this.getClickedCard(event);
        if (clickedCard) {
            return;
        }

        if (this.game.waste.length > 0) {
            if (this.game.moveCardsFromWasteToFoundation(foundationIndex)) {
                this.updateStats();
                this.render();
                this.checkWin();
            }
        }
    }

    getClickedCard(event) {
        return event.target.closest('.card');
    }

    selectCardsFromTableau(columnIndex, startIndex) {
        const column = this.game.tableau[columnIndex];
        const cards = column.slice(startIndex);
        this.selectedCards = {
            source: 'tableau',
            columnIndex,
            startIndex,
            cards
        };
        this.highlightSelectedCards();
    }

    selectCardsFromWaste() {
        if (this.game.waste.length === 0) return;

        const card = this.game.waste[this.game.waste.length - 1];
        this.selectedCards = {
            source: 'waste',
            cards: [card]
        };
        this.highlightSelectedCards();
    }

    tryMoveSelectedToTableau(targetColumnIndex) {
        if (!this.selectedCards) return;

        let moved = false;

        if (this.selectedCards.source === 'tableau') {
            moved = this.game.moveCardsFromTableauToTableau(
                this.selectedCards.columnIndex,
                this.selectedCards.startIndex,
                targetColumnIndex
            );
        } else if (this.selectedCards.source === 'waste') {
            moved = this.game.moveCardsFromWasteToTableau(targetColumnIndex);
        }

        if (moved) {
            this.clearSelection();
            this.updateStats();
            this.render();
            this.checkWin();
        } else {
            this.clearSelection();
        }
    }

    tryMoveSelectedToFoundation(foundationIndex) {
        if (!this.selectedCards || this.selectedCards.cards.length !== 1) return;

        let moved = false;

        if (this.selectedCards.source === 'tableau') {
            moved = this.game.moveCardsFromTableauToFoundation(
                this.selectedCards.columnIndex,
                foundationIndex
            );
        } else if (this.selectedCards.source === 'waste') {
            moved = this.game.moveCardsFromWasteToFoundation(foundationIndex);
        }

        if (moved) {
            this.clearSelection();
            this.updateStats();
            this.render();
            this.checkWin();
        } else {
            this.clearSelection();
        }
    }

    highlightSelectedCards() {
        this.clearCardHighlights();

        if (!this.selectedCards) return;

        for (const card of this.selectedCards.cards) {
            if (card.element) {
                card.element.classList.add('selected');
            }
        }
    }

    clearCardHighlights() {
        document.querySelectorAll('.card.selected').forEach(card => {
            card.classList.remove('selected');
        });
    }

    clearSelection() {
        this.clearCardHighlights();
        this.selectedCards = null;
    }

    checkWin() {
        if (this.game.isWon()) {
            this.showVictoryModal();
        }
    }

    showVictoryModal() {
        this.elements.finalScore.textContent = this.game.score;
        this.elements.finalMoves.textContent = this.game.moves;
        this.elements.victoryModal.classList.remove('hidden');
    }

    hideVictoryModal() {
        this.elements.victoryModal.classList.add('hidden');
    }

    showRulesModal() {
        this.elements.rulesModal.classList.remove('hidden');
    }

    hideRulesModal() {
        this.elements.rulesModal.classList.add('hidden');
    }

    updateStats() {
        this.elements.score.textContent = `得分: ${this.game.score}`;
        this.elements.moves.textContent = `步数: ${this.game.moves}`;
    }

    render() {
        this.updateStats();
        this.clearBoard();
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
    }

    clearBoard() {
        this.clearPile(this.elements.stock);
        this.clearPile(this.elements.waste);

        for (const foundation of this.elements.foundations) {
            this.clearPile(foundation);
        }

        for (const column of this.elements.tableauColumns) {
            column.innerHTML = '';
        }
    }

    clearPile(element) {
        const pile = element.querySelector('.pile');
        element.innerHTML = '';
        if (pile) {
            element.appendChild(pile);
        }
    }

    renderStock() {
        const pile = this.elements.stock.querySelector('.pile');
        this.clearPile(this.elements.stock);

        if (this.game.stock.length > 0) {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'hidden');
            cardElement.style.top = '0';
            cardElement.style.left = '0';
            cardElement.style.zIndex = '1';
            this.elements.stock.appendChild(cardElement);
        } else {
            if (pile) {
                this.elements.stock.appendChild(pile);
            }
        }
    }

    renderWaste() {
        this.clearPile(this.elements.waste);

        if (this.game.waste.length > 0) {
            const card = this.game.waste[this.game.waste.length - 1];
            const cardElement = card.createElement();
            cardElement.style.top = '0';
            cardElement.style.left = '0';
            cardElement.style.zIndex = '1';
            this.elements.waste.appendChild(cardElement);

            cardElement.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.selectedCards && this.selectedCards.source === 'waste') {
                    this.clearSelection();
                } else {
                    this.selectCardsFromWaste();
                }
            });
        }
    }

    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            this.renderFoundation(i);
        }
    }

    renderFoundation(index) {
        const foundation = this.elements.foundations[index];
        const pile = foundation.querySelector('.pile');
        this.clearPile(foundation);

        if (this.game.foundation[index].length > 0) {
            const card = this.game.foundation[index][this.game.foundation[index].length - 1];
            const cardElement = card.createElement();
            cardElement.style.top = '0';
            cardElement.style.left = '0';
            cardElement.style.zIndex = '1';
            foundation.appendChild(cardElement);
        } else {
            if (pile) {
                foundation.appendChild(pile);
            }
        }
    }

    renderTableau() {
        const cardOffset = 25;

        for (let col = 0; col < 7; col++) {
            const column = this.game.tableau[col];
            const columnElement = this.elements.tableauColumns[col];
            columnElement.innerHTML = '';

            if (column.length === 0) {
                const pile = document.createElement('div');
                pile.className = 'pile pile-empty';
                pile.style.top = '0';
                columnElement.appendChild(pile);
            } else {
                for (let row = 0; row < column.length; row++) {
                    const card = column[row];
                    const cardElement = card.createElement();
                    cardElement.style.top = `${row * cardOffset}px`;
                    cardElement.style.left = '0';
                    cardElement.style.zIndex = row;
                    columnElement.appendChild(cardElement);
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameUI();
});
