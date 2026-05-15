const catsData = [
    { id: 1, name: '小白', icon: '🐱', personality: '温顺', rarity: 'common', favoriteFood: '小鱼干', favoriteToy: '逗猫棒', visitChance: 0.3, fishReward: 5 },
    { id: 2, name: '橘子', icon: '😺', personality: '贪吃', rarity: 'common', favoriteFood: '高级猫粮', favoriteToy: '毛线球', visitChance: 0.3, fishReward: 5 },
    { id: 3, name: '黑影', icon: '😸', personality: '神秘', rarity: 'uncommon', favoriteFood: '罐头', favoriteToy: '激光笔', visitChance: 0.2, fishReward: 10 },
    { id: 4, name: '花花', icon: '😹', personality: '活泼', rarity: 'common', favoriteFood: '小鱼干', favoriteToy: '羽毛玩具', visitChance: 0.3, fishReward: 5 },
    { id: 5, name: '胖虎', icon: '😻', personality: '慵懒', rarity: 'uncommon', favoriteFood: '高级猫粮', favoriteToy: '猫爬架', visitChance: 0.2, fishReward: 10 },
    { id: 6, name: '雪团', icon: '😼', personality: '高冷', rarity: 'rare', favoriteFood: '罐头', favoriteToy: '逗猫棒', visitChance: 0.12, fishReward: 20 },
    { id: 7, name: '小橘', icon: '😽', personality: '粘人', rarity: 'common', favoriteFood: '小鱼干', favoriteToy: '毛线球', visitChance: 0.3, fishReward: 5 },
    { id: 8, name: '墨墨', icon: '🙀', personality: '胆小', rarity: 'uncommon', favoriteFood: '罐头', favoriteToy: '纸箱子', visitChance: 0.2, fishReward: 10 },
    { id: 9, name: '金金', icon: '😿', personality: '傲娇', rarity: 'rare', favoriteFood: '刺身', favoriteToy: '猫薄荷', visitChance: 0.12, fishReward: 20 },
    { id: 10, name: '银银', icon: '😾', personality: '霸道', rarity: 'rare', favoriteFood: '刺身', favoriteToy: '逗猫棒', visitChance: 0.1, fishReward: 25 },
    { id: 11, name: '彩云', icon: '👋', personality: '友善', rarity: 'uncommon', favoriteFood: '高级猫粮', favoriteToy: '羽毛玩具', visitChance: 0.2, fishReward: 10 },
    { id: 12, name: '月亮', icon: '🌟', personality: '安静', rarity: 'rare', favoriteFood: '罐头', favoriteToy: '激光笔', visitChance: 0.1, fishReward: 25 },
    { id: 13, name: '太阳', icon: '☀️', personality: '热情', rarity: 'rare', favoriteFood: '刺身', favoriteToy: '猫爬架', visitChance: 0.08, fishReward: 30 },
    { id: 14, name: '星星', icon: '⭐', personality: '好奇', rarity: 'uncommon', favoriteFood: '小鱼干', favoriteToy: '纸箱子', visitChance: 0.2, fishReward: 10 },
    { id: 15, name: '彩虹', icon: '🌈', personality: '开朗', rarity: 'uncommon', favoriteFood: '高级猫粮', favoriteToy: '猫薄荷', visitChance: 0.18, fishReward: 12 },
    { id: 16, name: '伯爵', icon: '🎩', personality: '优雅', rarity: 'legendary', favoriteFood: '刺身', favoriteToy: '激光笔', visitChance: 0.05, fishReward: 50 },
    { id: 17, name: '公主', icon: '👑', personality: '高贵', rarity: 'legendary', favoriteFood: '刺身', favoriteToy: '羽毛玩具', visitChance: 0.05, fishReward: 50 },
    { id: 18, name: '侠客', icon: '⚔️', personality: '仗义', rarity: 'legendary', favoriteFood: '罐头', favoriteToy: '猫爬架', visitChance: 0.04, fishReward: 60 },
    { id: 19, name: '仙子', icon: '🧚', personality: '梦幻', rarity: 'legendary', favoriteFood: '刺身', favoriteToy: '猫薄荷', visitChance: 0.03, fishReward: 80 },
    { id: 20, name: '猫王', icon: '👑', personality: '威严', rarity: 'legendary', favoriteFood: '刺身', favoriteToy: '所有玩具', visitChance: 0.02, fishReward: 100 }
];

const foodsData = [
    { id: 'f1', name: '小鱼干', icon: '🐟', price: 10, description: '普通猫咪都喜欢', duration: 60000 },
    { id: 'f2', name: '高级猫粮', icon: '🥫', price: 25, description: '吸引更多猫咪', duration: 90000 },
    { id: 'f3', name: '罐头', icon: '🍖', price: 50, description: '稀有猫咪最爱', duration: 120000 },
    { id: 'f4', name: '刺身', icon: '🍣', price: 100, description: '传说猫咪专享', duration: 180000 }
];

const toysData = [
    { id: 't1', name: '逗猫棒', icon: '🎣', price: 30, description: '百玩不厌的经典' },
    { id: 't2', name: '毛线球', icon: '🧶', price: 20, description: '简单的快乐' },
    { id: 't3', name: '激光笔', icon: '🔦', price: 40, description: '追逐的乐趣' },
    { id: 't4', name: '羽毛玩具', icon: '🪶', price: 35, description: '模拟捕猎' },
    { id: 't5', name: '猫爬架', icon: '🏠', price: 80, description: '猫咪的小天地' },
    { id: 't6', name: '纸箱子', icon: '📦', price: 15, description: '最简单的快乐' },
    { id: 't7', name: '猫薄荷', icon: '🌿', price: 50, description: '猫咪的快乐草' }
];

let gameState = {
    fish: 100,
    inventory: { toys: [], food: [] },
    placedToys: [],
    currentFood: null,
    foodTimer: null,
    discoveredCats: [],
    catVisits: {},
    currentCats: []
};

function resetGame() {
    localStorage.removeItem('catYardGame');
    gameState = {
        fish: 100,
        inventory: { toys: [], food: [] },
        placedToys: [],
        currentFood: null,
        foodTimer: null,
        discoveredCats: [],
        catVisits: {},
        currentCats: []
    };
    
    document.getElementById('items-container').innerHTML = '';
    document.getElementById('cats-container').innerHTML = '';
    
    const foodSlot = document.getElementById('food-slot');
    foodSlot.innerHTML = '<div class="empty-slot">空</div>';
    foodSlot.style.borderStyle = 'dashed';
    
    updateStats();
    renderInventory();
    renderAlbum();
    
    document.getElementById('reset-modal').classList.remove('active');
    showNotification('🎮 游戏已重置，重新开始吧！');
}

function init() {
    loadGame();
    renderInventory();
    renderShop();
    renderAlbum();
    setupEventListeners();
    startGameLoop();
    showNotification('欢迎来到猫咪后院！');
}

function saveGame() {
    localStorage.setItem('catYardGame', JSON.stringify({
        fish: gameState.fish,
        inventory: gameState.inventory,
        discoveredCats: gameState.discoveredCats,
        catVisits: gameState.catVisits
    }));
}

function loadGame() {
    const saved = localStorage.getItem('catYardGame');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.fish = data.fish || 100;
        gameState.inventory = data.inventory || { toys: [], food: [] };
        gameState.discoveredCats = data.discoveredCats || [];
        gameState.catVisits = data.catVisits || {};
    }
    updateStats();
}

function updateStats() {
    document.getElementById('fish-count').textContent = gameState.fish;
    document.getElementById('cat-count').textContent = gameState.discoveredCats.length;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

function showFishGain(amount, x, y) {
    const fishGain = document.createElement('div');
    fishGain.className = 'fish-gain';
    fishGain.textContent = `+${amount} 🐟`;
    fishGain.style.left = x + 'px';
    fishGain.style.top = y + 'px';
    document.getElementById('yard').appendChild(fishGain);
    setTimeout(() => fishGain.remove(), 1500);
}

function renderInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';

    const allItems = [...gameState.inventory.toys, ...gameState.inventory.food];
    const itemCounts = {};
    allItems.forEach(item => {
        itemCounts[item.id] = itemCounts[item.id] ? itemCounts[item.id] + 1 : 1;
    });

    Object.keys(itemCounts).forEach(itemId => {
        const item = [...toysData, ...foodsData].find(i => i.id === itemId);
        if (item) {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                ${item.icon}
                <span class="count">${itemCounts[itemId]}</span>
            `;
            itemEl.dataset.itemId = itemId;
            itemEl.dataset.itemType = foodsData.find(f => f.id === itemId) ? 'food' : 'toy';
            
            if (itemEl.dataset.itemType === 'toy') {
                itemEl.draggable = true;
                itemEl.addEventListener('dragstart', handleDragStart);
            } else {
                itemEl.addEventListener('click', () => placeFood(item));
            }
            
            inventoryList.appendChild(itemEl);
        }
    });
}

function renderShop() {
    const shopFood = document.getElementById('shop-food');
    const shopToys = document.getElementById('shop-toys');
    
    shopFood.innerHTML = foodsData.map(food => `
        <div class="shop-item">
            <div class="item-icon">${food.icon}</div>
            <div class="item-info">
                <div class="item-name">${food.name}</div>
                <div class="item-desc">${food.description}</div>
            </div>
            <div class="item-price" onclick="buyFood('${food.id}')">${food.price} 🐟</div>
        </div>
    `).join('');

    shopToys.innerHTML = toysData.map(toy => `
        <div class="shop-item">
            <div class="item-icon">${toy.icon}</div>
            <div class="item-info">
                <div class="item-name">${toy.name}</div>
                <div class="item-desc">${toy.description}</div>
            </div>
            <div class="item-price" onclick="buyToy('${toy.id}')">${toy.price} 🐟</div>
        </div>
    `).join('');
}

function renderAlbum() {
    const albumGrid = document.getElementById('album-grid');
    albumGrid.innerHTML = catsData.map(cat => {
        const isDiscovered = gameState.discoveredCats.includes(cat.id);
        return `
            <div class="album-cat ${isDiscovered ? '' : 'locked'}" 
                 onclick="${isDiscovered ? `showCatDetail(${cat.id})` : ''}">
                <div class="cat-icon">${cat.icon}</div>
                <div class="cat-name">${isDiscovered ? cat.name : '???'}</div>
            </div>
        `;
    }).join('');
}

function buyFood(foodId) {
    const food = foodsData.find(f => f.id === foodId);
    if (gameState.fish >= food.price) {
        gameState.fish -= food.price;
        gameState.inventory.food.push({ ...food });
        updateStats();
        renderInventory();
        saveGame();
        showNotification(`购买了 ${food.name}！`);
    } else {
        showNotification('小鱼干不够哦！');
    }
}

function buyToy(toyId) {
    const toy = toysData.find(t => t.id === toyId);
    if (gameState.fish >= toy.price) {
        gameState.fish -= toy.price;
        gameState.inventory.toys.push({ ...toy });
        updateStats();
        renderInventory();
        saveGame();
        showNotification(`购买了 ${toy.name}！`);
    } else {
        showNotification('小鱼干不够哦！');
    }
}

function placeFood(food) {
    if (gameState.currentFood) {
        showNotification('食盆里已经有食物了！');
        return;
    }
    
    const foodIndex = gameState.inventory.food.findIndex(f => f.id === food.id);
    if (foodIndex > -1) {
        gameState.inventory.food.splice(foodIndex, 1);
        gameState.currentFood = food;
        
        const foodSlot = document.getElementById('food-slot');
        foodSlot.innerHTML = food.icon;
        foodSlot.style.borderStyle = 'solid';
        
        renderInventory();
        saveGame();
        showNotification(`放置了 ${food.name}！`);
        
        setTimeout(() => {
            gameState.currentFood = null;
            foodSlot.innerHTML = '<div class="empty-slot">空</div>';
            foodSlot.style.borderStyle = 'dashed';
            showNotification('食物吃完了！');
        }, food.duration);
    }
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.setData('text/plain', e.target.dataset.itemId);
}

function placeToy(e) {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    const toy = toysData.find(t => t.id === itemId);
    
    if (!toy) return;
    
    const toyIndex = gameState.inventory.toys.findIndex(t => t.id === itemId);
    if (toyIndex === -1) return;
    
    const yard = document.getElementById('yard');
    const rect = yard.getBoundingClientRect();
    const x = e.clientX - rect.left - 30;
    const y = e.clientY - rect.top - 30;
    
    if (y < rect.height * 0.4) {
        showNotification('请放在草地上！');
        return;
    }
    
    gameState.inventory.toys.splice(toyIndex, 1);
    const placedToy = {
        ...toy,
        x: x,
        y: y,
        elementId: 'toy-' + Date.now()
    };
    gameState.placedToys.push(placedToy);
    
    const toyEl = document.createElement('div');
    toyEl.className = 'placed-item';
    toyEl.id = placedToy.elementId;
    toyEl.textContent = toy.icon;
    toyEl.style.left = x + 'px';
    toyEl.style.top = y + 'px';
    toyEl.addEventListener('click', () => removeToy(placedToy.elementId));
    
    document.getElementById('items-container').appendChild(toyEl);
    
    renderInventory();
    saveGame();
    showNotification(`放置了 ${toy.name}！`);
}

function removeToy(elementId) {
    const toyIndex = gameState.placedToys.findIndex(t => t.elementId === elementId);
    if (toyIndex > -1) {
        const toy = gameState.placedToys[toyIndex];
        gameState.placedToys.splice(toyIndex, 1);
        gameState.inventory.toys.push({ id: toy.id, name: toy.name, icon: toy.icon, price: toy.price, description: toy.description });
        
        document.getElementById(elementId).remove();
        renderInventory();
        saveGame();
        showNotification(`收回了 ${toy.name}！`);
    }
}

function tryCatVisit() {
    if (!gameState.currentFood || gameState.currentCats.length >= 3) return;
    if (gameState.placedToys.length === 0) return;

    catsData.forEach(cat => {
        if (gameState.currentCats.find(c => c.id === cat.id)) return;
        
        let chance = cat.visitChance;
        
        if (gameState.currentFood.name === cat.favoriteFood) {
            chance *= 2;
        }
        
        const hasFavoriteToy = gameState.placedToys.some(
            toy => toy.name === cat.favoriteToy || cat.favoriteToy === '所有玩具'
        );
        if (hasFavoriteToy) {
            chance *= 1.5;
        }
        
        if (Math.random() < chance) {
            spawnCat(cat);
        }
    });
}

function spawnCat(cat) {
    const yard = document.getElementById('yard');
    const rect = yard.getBoundingClientRect();
    
    const x = Math.random() * (rect.width - 100) + 50;
    const y = Math.random() * (rect.height * 0.5) + rect.height * 0.4;
    
    const catInstance = {
        ...cat,
        x: x,
        y: y,
        elementId: 'cat-' + Date.now(),
        stayTime: 10000 + Math.random() * 20000
    };
    
    gameState.currentCats.push(catInstance);
    
    const catEl = document.createElement('div');
    catEl.className = 'cat';
    catEl.id = catInstance.elementId;
    catEl.textContent = cat.icon;
    catEl.style.left = x + 'px';
    catEl.style.top = y + 'px';
    catEl.addEventListener('click', () => interactWithCat(catInstance));
    
    document.getElementById('cats-container').appendChild(catEl);
    
    if (!gameState.discoveredCats.includes(cat.id)) {
        gameState.discoveredCats.push(cat.id);
        showNotification(`🎉 发现新猫咪：${cat.name}！`);
        renderAlbum();
    }
    
    gameState.catVisits[cat.id] = (gameState.catVisits[cat.id] || 0) + 1;
    updateStats();
    saveGame();
    
    setTimeout(() => {
        removeCat(catInstance.elementId);
    }, catInstance.stayTime);
}

function interactWithCat(catInstance) {
    const cat = catsData.find(c => c.id === catInstance.id);
    const reward = cat.fishReward;
    
    gameState.fish += reward;
    updateStats();
    saveGame();
    
    const catEl = document.getElementById(catInstance.elementId);
    const rect = catEl.getBoundingClientRect();
    const yardRect = document.getElementById('yard').getBoundingClientRect();
    showFishGain(reward, rect.left - yardRect.left, rect.top - yardRect.top);
    
    showNotification(`${cat.name} 送给你 ${reward} 小鱼干！`);
}

function removeCat(elementId) {
    const catIndex = gameState.currentCats.findIndex(c => c.elementId === elementId);
    if (catIndex > -1) {
        gameState.currentCats.splice(catIndex, 1);
        const catEl = document.getElementById(elementId);
        if (catEl) catEl.remove();
    }
}

function showCatDetail(catId) {
    const cat = catsData.find(c => c.id === catId);
    if (!cat) return;
    
    const rarityClass = `rarity-${cat.rarity}`;
    const rarityText = {
        common: '普通',
        uncommon: '稀有',
        rare: '珍贵',
        legendary: '传说'
    }[cat.rarity];
    
    document.getElementById('cat-modal-name').textContent = cat.name;
    document.getElementById('cat-modal-image').textContent = cat.icon;
    document.getElementById('cat-modal-personality').textContent = cat.personality;
    document.getElementById('cat-modal-food').textContent = cat.favoriteFood;
    document.getElementById('cat-modal-toy').textContent = cat.favoriteToy;
    document.getElementById('cat-modal-visits').textContent = gameState.catVisits[cat.id] || 0;
    
    const rarityEl = document.getElementById('cat-modal-rarity');
    rarityEl.textContent = rarityText;
    rarityEl.className = rarityClass;
    
    document.getElementById('cat-modal').classList.add('active');
}

function setupEventListeners() {
    const yard = document.getElementById('yard');
    yard.addEventListener('dragover', (e) => e.preventDefault());
    yard.addEventListener('drop', placeToy);
    
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    document.getElementById('album-btn').addEventListener('click', () => {
        document.getElementById('album-modal').classList.add('active');
    });
    
    document.getElementById('shop-btn').addEventListener('click', () => {
        document.getElementById('shop-modal').classList.add('active');
    });
    
    document.getElementById('rules-btn').addEventListener('click', () => {
        document.getElementById('rules-modal').classList.add('active');
    });
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        document.getElementById('reset-modal').classList.add('active');
    });
    
    document.getElementById('cancel-reset').addEventListener('click', () => {
        document.getElementById('reset-modal').classList.remove('active');
    });
    
    document.getElementById('confirm-reset').addEventListener('click', resetGame);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('shop-' + btn.dataset.tab).classList.add('active');
        });
    });
    
    gameState.placedToys.forEach(toy => {
        const toyEl = document.createElement('div');
        toyEl.className = 'placed-item';
        toyEl.id = toy.elementId;
        toyEl.textContent = toy.icon;
        toyEl.style.left = toy.x + 'px';
        toyEl.style.top = toy.y + 'px';
        toyEl.addEventListener('click', () => removeToy(toy.elementId));
        document.getElementById('items-container').appendChild(toyEl);
    });
}

function startGameLoop() {
    setInterval(() => {
        tryCatVisit();
    }, 3000);
    
    setInterval(() => {
        saveGame();
    }, 30000);
}

init();
