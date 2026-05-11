// UI 交互逻辑
let game = null;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    initEventListeners();
    updateUIElements();
});

function initEventListeners() {
    const chopBtn = document.getElementById('chop-btn');
    const tree = document.getElementById('tree');
    chopBtn.addEventListener('click', () => {
        game.chopTree();
    });
    tree.addEventListener('click', () => {
        game.chopTree();
    });

    const breakthroughBtn = document.getElementById('breakthrough-btn');
    breakthroughBtn.addEventListener('click', () => {
        game.breakthrough();
    });

    const summonBtn = document.getElementById('summon-pet-btn');
    summonBtn.addEventListener('click', () => {
        game.summonPet();
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });
}

function updateUIElements() {
    updatePlayerInfo();
    updateResources();
    updateCultivation();
    updateTree();
    updateSkills();
    updateEquipment();
    updateInventory();
    updatePets();
    updateStats();
}

function updatePlayerInfo() {
    const realm = REALMS[GameState.player.realm] || REALMS[0];
    const realmDisplay = document.getElementById('realm-display');
    realmDisplay.textContent = `${realm.name} ${GameState.player.realmLayer + 1}层`;
}

function updateResources() {
    document.getElementById('spiritual-stones').textContent = formatNumber(GameState.player.spiritualStones);
    document.getElementById('peaches').textContent = formatNumber(GameState.player.peaches);
}

function updateCultivation() {
    const progress = (GameState.player.cultivation / GameState.player.cultivationNeed) * 100;
    document.getElementById('cultivation-progress').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('cultivation-current').textContent = formatNumber(Math.floor(GameState.player.cultivation));
    document.getElementById('cultivation-need').textContent = formatNumber(GameState.player.cultivationNeed);
    
    const rate = game.getCultivationPerSecond();
    document.getElementById('cultivation-rate').textContent = `+${rate}/秒`;

    const breakthroughBtn = document.getElementById('breakthrough-btn');
    breakthroughBtn.disabled = GameState.player.cultivation < GameState.player.cultivationNeed;
}

function updateTree() {
    document.getElementById('tree-level').textContent = `Lv.${GameState.tree.level}`;
}

function updateSkills() {
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';

    GameState.skills.forEach(skill => {
        const cost = skill.cost * skill.level;
        const canAfford = GameState.player.peaches >= cost;

        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
            <div class="skill-icon">${skill.icon}</div>
            <div class="skill-info">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">Lv.${skill.level}</div>
                <div class="skill-effect">${skill.effect}</div>
            </div>
            <button class="skill-upgrade-btn" ${!canAfford ? 'disabled' : ''}>
                升级 (${cost}🍑)
            </button>
        `;

        const upgradeBtn = skillItem.querySelector('.skill-upgrade-btn');
        upgradeBtn.addEventListener('click', () => {
            game.upgradeSkill(skill.id);
        });

        skillsList.appendChild(skillItem);
    });
}

function updateEquipment() {
    const slots = ['weapon', 'armor', 'accessory'];
    slots.forEach(slot => {
        const slotElement = document.querySelector(`.equipment-slot[data-slot="${slot}"]`);
        const item = GameState.equipment[slot];
        
        if (item) {
            slotElement.classList.add('equipped');
            slotElement.innerHTML = `
                <div class="slot-icon">${item.icon}</div>
                <div class="slot-label">${item.name}</div>
                <div class="item-level">Lv.${item.level}</div>
            `;
            slotElement.addEventListener('click', () => {
                game.unequipItem(slot);
            });
        } else {
            slotElement.classList.remove('equipped');
            const icons = { weapon: '🗡️', armor: '🛡️', accessory: '💍' };
            const labels = { weapon: '武器', armor: '护甲', accessory: '饰品' };
            slotElement.innerHTML = `
                <div class="slot-icon">${icons[slot]}</div>
                <div class="slot-label">${labels[slot]}</div>
            `;
            slotElement.removeEventListener('click', () => {});
        }
    });
}

function updateInventory() {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = '';

    GameState.inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `inventory-item rarity-${item.rarity}`;
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-level">Lv.${item.level}</div>
        `;

        itemElement.addEventListener('click', () => {
            game.equipItem(item.id);
        });

        inventoryGrid.appendChild(itemElement);
    });

    const emptySlots = 12 - GameState.inventory.length;
    for (let i = 0; i < emptySlots; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'inventory-item';
        emptySlot.style.opacity = '0.3';
        emptySlot.innerHTML = `
            <div class="item-icon">📦</div>
            <div class="item-name">空</div>
        `;
        inventoryGrid.appendChild(emptySlot);
    }
}

function updatePets() {
    const petsList = document.getElementById('pets-list');
    petsList.innerHTML = '';

    if (GameState.pets.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = 'var(--text-secondary)';
        emptyMessage.style.padding = '20px';
        emptyMessage.textContent = '暂无灵兽，点击上方按钮召唤吧！';
        petsList.appendChild(emptyMessage);
        return;
    }

    GameState.pets.forEach(pet => {
        const petItem = document.createElement('div');
        petItem.className = 'pet-item';
        petItem.innerHTML = `
            <div class="pet-icon">${pet.icon}</div>
            <div class="pet-info">
                <div class="pet-name">${pet.name}</div>
                <div class="pet-effect">${pet.desc}</div>
            </div>
        `;
        petsList.appendChild(petItem);
    });
}

function updateStats() {
    document.getElementById('attack-stat').textContent = GameState.player.attack;
    document.getElementById('defense-stat').textContent = GameState.player.defense;
    document.getElementById('hp-stat').textContent = GameState.player.hp;
    document.getElementById('power-stat').textContent = GameState.player.power;
}

function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}
