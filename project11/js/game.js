import { CARD_SYMBOLS, SLOT_COUNT, MATCH_COUNT, GAME_CONFIG, CARD_SIZE, ANIMATION_TIMING } from './constants.js';
import { shuffleArray, randomInt, delay, deepClone } from './utils.js';
import { Card } from './card.js';

export class Game {
    constructor(boardElement, slotsElement) {
        this.boardElement = boardElement;
        this.slotsElement = slotsElement;
        this.cards = [];
        this.slots = [];
        this.history = [];
        this.level = 1;
        this.moves = 0;
        this.isPlaying = false;
        
        this.initSlots();
    }

    initSlots() {
        this.slotsElement.innerHTML = '';
        for (let i = 0; i < SLOT_COUNT; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.index = i;
            this.slotsElement.appendChild(slot);
        }
        this.slots = new Array(SLOT_COUNT).fill(null);
    }

    startGame(level = 1) {
        this.level = level;
        this.moves = 0;
        this.history = [];
        this.isPlaying = true;
        this.clearBoard();
        this.initSlots();
        this.generateCards();
        this.updateStats();
        this.updateCardStates();
    }

    clearBoard() {
        this.cards.forEach(card => card.removeFromDOM());
        this.cards = [];
    }

    generateCards() {
        const config = GAME_CONFIG.levels[this.level - 1] || GAME_CONFIG.levels[0];
        const symbols = shuffleArray(CARD_SYMBOLS).slice(0, config.cardTypes);
        
        const cardPool = [];
        symbols.forEach(symbol => {
            for (let i = 0; i < config.cardsPerType; i++) {
                cardPool.push(symbol);
            }
        });
        
        const shuffledCards = shuffleArray(cardPool);
        const boardWidth = this.boardElement.clientWidth;
        const boardHeight = this.boardElement.clientHeight;
        const cardWidth = CARD_SIZE.width;
        const cardHeight = CARD_SIZE.height;
        
        let cardId = 0;
        let cardIndex = 0;
        
        for (let layer = 0; layer < config.layers; layer++) {
            const offset = layer * 15;
            const cardsPerLayer = Math.ceil(shuffledCards.length / config.layers);
            
            for (let i = 0; i < cardsPerLayer && cardIndex < shuffledCards.length; i++) {
                const x = randomInt(offset, boardWidth - cardWidth - offset);
                const y = randomInt(offset, boardHeight - cardHeight - offset);
                const z = (layer + 1) * 100 + i;
                
                const card = new Card(
                    cardId++,
                    shuffledCards[cardIndex++],
                    x,
                    y,
                    z,
                    true
                );
                
                const element = card.createElement();
                element.addEventListener('click', () => this.onCardClick(card));
                this.boardElement.appendChild(element);
                this.cards.push(card);
            }
        }
    }

    onCardClick(card) {
        if (!this.isPlaying) return;
        
        if (!card.onBoard) return;
        
        if (!this.isCardClickable(card)) return;
        
        const emptySlotIndex = this.findEmptySlot();
        if (emptySlotIndex === -1) {
            this.checkGameOver();
            return;
        }
        
        this.saveHistory();
        
        this.moveCardToSlot(card, emptySlotIndex);
        this.moves++;
        this.updateStats();
        
        this.checkMatches();
        this.updateCardStates();
        
        setTimeout(() => this.checkGameOver(), 300);
    }

    isCardClickable(card) {
        for (const otherCard of this.cards) {
            if (otherCard.id === card.id || !otherCard.onBoard) continue;
            
            if (otherCard.z > card.z && this.isOverlapping(card, otherCard)) {
                return false;
            }
        }
        return true;
    }

    isOverlapping(card1, card2) {
        const overlapX = Math.abs(card1.x - card2.x) < (CARD_SIZE.width * 0.6);
        const overlapY = Math.abs(card1.y - card2.y) < (CARD_SIZE.height * 0.6);
        return overlapX && overlapY;
    }

    findEmptySlot() {
        return this.slots.findIndex(slot => slot === null);
    }

    moveCardToSlot(card, slotIndex) {
        card.onBoard = false;
        
        const slotElement = this.slotsElement.children[slotIndex];
        slotElement.textContent = card.symbol;
        slotElement.classList.add('filled');
        
        this.slots[slotIndex] = {
            card: card,
            symbol: card.symbol
        };
        
        card.removeFromDOM();
    }

    async checkMatches() {
        const symbolCounts = {};
        const symbolSlots = {};
        
        this.slots.forEach((slotData, index) => {
            if (slotData) {
                const symbol = slotData.symbol;
                symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
                if (!symbolSlots[symbol]) symbolSlots[symbol] = [];
                symbolSlots[symbol].push(index);
            }
        });
        
        for (const [symbol, count] of Object.entries(symbolCounts)) {
            if (count >= MATCH_COUNT) {
                const slotsToRemove = symbolSlots[symbol].slice(0, MATCH_COUNT);
                
                slotsToRemove.forEach(index => {
                    const slotElement = this.slotsElement.children[index];
                    slotElement.classList.add('match');
                });
                
                await delay(ANIMATION_TIMING.matchPop);
                
                slotsToRemove.forEach(index => {
                    const slotElement = this.slotsElement.children[index];
                    slotElement.textContent = '';
                    slotElement.classList.remove('filled', 'match');
                    this.slots[index] = null;
                });
                
                this.checkWin();
            }
        }
    }

    updateCardStates() {
        this.cards.forEach(card => {
            if (card.onBoard) {
                const isClickable = this.isCardClickable(card);
                card.setDisabled(!isClickable);
            }
        });
    }

    checkWin() {
        const remainingCards = this.cards.filter(card => card.onBoard);
        const remainingSlots = this.slots.filter(slot => slot !== null);
        
        if (remainingCards.length === 0 && remainingSlots.length === 0) {
            this.isPlaying = false;
            setTimeout(() => this.showWinModal(), 500);
        }
    }

    checkGameOver() {
        const emptySlots = this.slots.filter(slot => slot === null);
        if (emptySlots.length === 0) {
            this.isPlaying = false;
            setTimeout(() => this.showLoseModal(), 300);
        }
    }

    showWinModal() {
        const modal = document.getElementById('gameModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        const btn = document.getElementById('modalBtn');
        
        title.textContent = '🎉 恭喜过关！';
        message.textContent = `你用了 ${this.moves} 步完成第 ${this.level} 关！`;
        btn.textContent = '下一关';
        
        modal.classList.add('show');
    }

    showLoseModal() {
        const modal = document.getElementById('gameModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        const btn = document.getElementById('modalBtn');
        
        title.textContent = '😢 游戏结束';
        message.textContent = '槽位已满，无法继续！再试一次吧！';
        btn.textContent = '重新开始';
        
        modal.classList.add('show');
    }

    saveHistory() {
        const state = {
            cards: deepClone(this.cards.map(c => ({
                id: c.id,
                symbol: c.symbol,
                x: c.x,
                y: c.y,
                z: c.z,
                onBoard: c.onBoard
            }))),
            slots: deepClone(this.slots),
            moves: this.moves
        };
        this.history.push(state);
    }

    undo() {
        if (this.history.length === 0) return;
        
        const previousState = this.history.pop();
        
        this.clearBoard();
        this.slots = new Array(SLOT_COUNT).fill(null);
        this.initSlots();
        
        this.cards = previousState.cards.map(cardData => {
            const card = new Card(
                cardData.id,
                cardData.symbol,
                cardData.x,
                cardData.y,
                cardData.z,
                cardData.onBoard
            );
            
            if (cardData.onBoard) {
                const element = card.createElement();
                element.addEventListener('click', () => this.onCardClick(card));
                this.boardElement.appendChild(element);
            }
            
            return card;
        });
        
        this.slots = previousState.slots;
        this.moves = previousState.moves;
        
        this.slots.forEach((slotData, index) => {
            if (slotData) {
                const slotElement = this.slotsElement.children[index];
                slotElement.textContent = slotData.symbol;
                slotElement.classList.add('filled');
            }
        });
        
        this.updateStats();
        this.updateCardStates();
    }

    shuffle() {
        if (!this.isPlaying) return;
        
        this.saveHistory();
        
        const onBoardCards = this.cards.filter(card => card.onBoard);
        const symbols = onBoardCards.map(card => card.symbol);
        const shuffledSymbols = shuffleArray(symbols);
        
        onBoardCards.forEach((card, index) => {
            card.symbol = shuffledSymbols[index];
            if (card.element) {
                card.element.textContent = card.symbol;
            }
        });
    }

    updateStats() {
        const levelElement = document.getElementById('level');
        const movesElement = document.getElementById('moves');
        
        if (levelElement) levelElement.textContent = this.level;
        if (movesElement) movesElement.textContent = this.moves;
    }
}
