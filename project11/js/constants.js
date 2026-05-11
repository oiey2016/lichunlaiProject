export const CARD_SYMBOLS = [
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
    '🍌', '🍉', '🥭', '🍍', '🥥', '🍈', '🍐', '🥑'
];

export const SLOT_COUNT = 7;
export const MATCH_COUNT = 3;

export const GAME_CONFIG = {
    levels: [
        { cardTypes: 6, cardsPerType: 6, layers: 3 },
        { cardTypes: 8, cardsPerType: 6, layers: 4 },
        { cardTypes: 10, cardsPerType: 6, layers: 5 },
        { cardTypes: 12, cardsPerType: 6, layers: 6 }
    ]
};

export const CARD_SIZE = {
    width: 55,
    height: 70
};

export const ANIMATION_TIMING = {
    slotPop: 300,
    matchPop: 500,
    modalSlide: 300
};
