export function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
