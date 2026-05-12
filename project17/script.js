const gameData = {
    character: {
        name: "普通人",
        title: "平凡的打工族",
        avatar: "🧑",
        stats: {
            wealth: 10,
            wisdom: 20,
            charm: 15,
            health: 50
        }
    },
    energy: 100,
    maxEnergy: 100,
    gachaCost: 20,
    day: 1,
    inventory: [],
    history: [],
    titles: [
        { threshold: 50, title: "初出茅庐", avatar: "🧑" },
        { threshold: 100, title: "奋斗青年", avatar: "💪" },
        { threshold: 200, title: "小有所成", avatar: "🌟" },
        { threshold: 350, title: "精英人士", avatar: "💼" },
        { threshold: 500, title: "人生赢家", avatar: "👑" },
        { threshold: 700, title: "传奇人物", avatar: "🏆" },
        { threshold: 1000, title: "都市传说", avatar: "✨" }
    ]
};

const gachaPool = [
    {
        id: 1,
        name: "幸运四叶草",
        icon: "🍀",
        desc: "传说中的幸运之物，能带来意想不到的好运",
        rarity: "common",
        effect: { wealth: 5, charm: 3 },
        effectText: "财富 +5，魅力 +3"
    },
    {
        id: 2,
        name: "古老的书籍",
        icon: "📚",
        desc: "蕴含前人智慧的珍贵典籍",
        rarity: "common",
        effect: { wisdom: 10 },
        effectText: "智慧 +10"
    },
    {
        id: 3,
        name: "健康水果篮",
        icon: "🍎",
        desc: "新鲜美味的有机水果，守护你的健康",
        rarity: "common",
        effect: { health: 8 },
        effectText: "健康 +8"
    },
    {
        id: 4,
        name: "名牌香水",
        icon: "🌸",
        desc: "迷人的香气让你魅力四射",
        rarity: "common",
        effect: { charm: 8 },
        effectText: "魅力 +8"
    },
    {
        id: 5,
        name: "意外的红包",
        icon: "🧧",
        desc: "来自远方亲戚的神秘红包",
        rarity: "common",
        effect: { wealth: 15 },
        effectText: "财富 +15"
    },
    {
        id: 6,
        name: "神秘的指南针",
        icon: "🧭",
        desc: "指向正确方向的神奇指南针",
        rarity: "rare",
        effect: { wisdom: 12, wealth: 8 },
        effectText: "智慧 +12，财富 +8"
    },
    {
        id: 7,
        name: "时光沙漏",
        icon: "⏳",
        desc: "能让时间变慢一点点的神奇道具",
        rarity: "rare",
        effect: { health: 12, wisdom: 8 },
        effectText: "健康 +12，智慧 +8"
    },
    {
        id: 8,
        name: "爱情魔法石",
        icon: "💎",
        desc: "散发着浪漫光芒的魔法宝石",
        rarity: "rare",
        effect: { charm: 15, health: 5 },
        effectText: "魅力 +15，健康 +5"
    },
    {
        id: 9,
        name: "财神爷画像",
        icon: "💰",
        desc: "据说能招来财运的神圣画像",
        rarity: "rare",
        effect: { wealth: 25 },
        effectText: "财富 +25"
    },
    {
        id: 10,
        name: "命运之轮",
        icon: "🎡",
        desc: "改变命运的神秘转轮",
        rarity: "epic",
        effect: { wealth: 30, wisdom: 20, charm: 15, health: 10 },
        effectText: "全属性大幅提升！"
    },
    {
        id: 11,
        name: "神龙的祝福",
        icon: "🐉",
        desc: "来自远古神龙的神圣祝福",
        rarity: "epic",
        effect: { wealth: 40, wisdom: 25, charm: 20, health: 15 },
        effectText: "神龙降临！全属性暴涨！"
    },
    {
        id: 12,
        name: "重生之烛",
        icon: "🕯️",
        desc: "燃烧后能让你重获新生的神秘蜡烛",
        rarity: "legendary",
        effect: { wealth: 60, wisdom: 50, charm: 40, health: 50 },
        effectText: "🌟 传说级道具！人生将彻底改变！"
    },
    {
        id: 13,
        name: "失落的彩票",
        icon: "🎫",
        desc: "一张被遗忘的中奖彩票",
        rarity: "rare",
        effect: { wealth: 35 },
        effectText: "财富 +35！意外之财！"
    },
    {
        id: 14,
        name: "智慧苹果",
        icon: "🍏",
        desc: "吃了就能变聪明的神奇苹果",
        rarity: "rare",
        effect: { wisdom: 20 },
        effectText: "智慧 +20！变得更聪明了！"
    },
    {
        id: 15,
        name: "健身年卡",
        icon: "🏋️",
        desc: "让你拥有强健体魄的健身卡",
        rarity: "common",
        effect: { health: 15 },
        effectText: "健康 +15！身体更强壮了！"
    }
];

const lifeEvents = [
    "在街上捡到了钱包，还给失主后得到了感谢费！",
    "参加公司抽奖，意外中了三等奖！",
    "朋友邀请你参加读书会，收获颇丰！",
    "偶然遇到了一位贵人，给了你宝贵的建议！",
    "今天心情特别好，做什么都很顺利！",
    "在书店发现了一本改变你思维的好书！",
    "帮助了一位陌生人，内心充满了正能量！",
    "今天的工作得到了领导的表扬！",
    "收到了一份意外的小礼物！",
    "坚持运动一个月，感觉身体充满活力！",
    "学习了一项新技能，感觉自己更厉害了！",
    "和老朋友叙旧，重拾美好的回忆！",
    "做了一个美梦，一整天都心情愉悦！",
    "吃到了想念已久的美食，非常满足！",
    "今天的穿搭受到了很多人的赞美！"
];

const elements = {
    energyFill: document.getElementById('energyFill'),
    energyText: document.getElementById('energyText'),
    avatarEmoji: document.getElementById('avatarEmoji'),
    characterName: document.getElementById('characterName'),
    characterTitle: document.getElementById('characterTitle'),
    wealthBar: document.getElementById('wealthBar'),
    wisdomBar: document.getElementById('wisdomBar'),
    charmBar: document.getElementById('charmBar'),
    healthBar: document.getElementById('healthBar'),
    wealthValue: document.getElementById('wealthValue'),
    wisdomValue: document.getElementById('wisdomValue'),
    charmValue: document.getElementById('charmValue'),
    healthValue: document.getElementById('healthValue'),
    mysteryBox: document.getElementById('mysteryBox'),
    gachaBtn: document.getElementById('gachaBtn'),
    gachaHint: document.getElementById('gachaHint'),
    inventoryGrid: document.getElementById('inventoryGrid'),
    itemCount: document.getElementById('itemCount'),
    historyList: document.getElementById('historyList'),
    resultModal: document.getElementById('resultModal'),
    resultIcon: document.getElementById('resultIcon'),
    resultName: document.getElementById('resultName'),
    resultDesc: document.getElementById('resultDesc'),
    resultEffect: document.getElementById('resultEffect'),
    closeModal: document.getElementById('closeModal'),
    rulesBtn: document.getElementById('rulesBtn'),
    rulesModal: document.getElementById('rulesModal'),
    closeRules: document.getElementById('closeRules'),
    startGameBtn: document.getElementById('startGameBtn')
};

function updateUI() {
    const energyPercent = (gameData.energy / gameData.maxEnergy) * 100;
    elements.energyFill.style.width = `${energyPercent}%`;
    elements.energyText.textContent = `${Math.floor(gameData.energy)}/${gameData.maxEnergy}`;

    elements.avatarEmoji.textContent = gameData.character.avatar;
    elements.characterName.textContent = gameData.character.name;
    elements.characterTitle.textContent = gameData.character.title;

    const stats = gameData.character.stats;
    const maxStat = 200;

    elements.wealthBar.style.width = `${Math.min((stats.wealth / maxStat) * 100, 100)}%`;
    elements.wisdomBar.style.width = `${Math.min((stats.wisdom / maxStat) * 100, 100)}%`;
    elements.charmBar.style.width = `${Math.min((stats.charm / maxStat) * 100, 100)}%`;
    elements.healthBar.style.width = `${Math.min((stats.health / maxStat) * 100, 100)}%`;

    elements.wealthValue.textContent = Math.floor(stats.wealth);
    elements.wisdomValue.textContent = Math.floor(stats.wisdom);
    elements.charmValue.textContent = Math.floor(stats.charm);
    elements.healthValue.textContent = Math.floor(stats.health);

    elements.itemCount.textContent = `${gameData.inventory.length}件`;

    updateTitle();
}

function updateTitle() {
    const totalStats = Object.values(gameData.character.stats).reduce((a, b) => a + b, 0);
    
    for (let i = gameData.titles.length - 1; i >= 0; i--) {
        if (totalStats >= gameData.titles[i].threshold) {
            gameData.character.title = gameData.titles[i].title;
            gameData.character.avatar = gameData.titles[i].avatar;
            break;
        }
    }
}

function updateInventory() {
    if (gameData.inventory.length === 0) {
        elements.inventoryGrid.innerHTML = '<div class="empty-slot"><span>还没有道具哦~</span></div>';
        return;
    }

    elements.inventoryGrid.innerHTML = gameData.inventory.map(item => `
        <div class="inventory-item">
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
        </div>
    `).join('');
}

function addHistory(content, type = 'normal') {
    gameData.day++;
    
    const historyItem = document.createElement('div');
    historyItem.className = `history-item ${type}`;
    historyItem.innerHTML = `
        <span class="history-date">第${gameData.day}天</span>
        <p class="history-content">${content}</p>
    `;
    
    elements.historyList.insertBefore(historyItem, elements.historyList.firstChild);
}

function doGacha() {
    if (gameData.energy < gameData.gachaCost) {
        elements.gachaHint.textContent = "运气值不足啦，休息一下再来吧~";
        return;
    }

    gameData.energy -= gameData.gachaCost;
    updateUI();

    elements.mysteryBox.classList.add('opening');
    elements.gachaBtn.disabled = true;

    setTimeout(() => {
        elements.mysteryBox.classList.remove('opening');
        elements.mysteryBox.classList.add('opened');

        setTimeout(() => {
            const item = getRandomItem();
            showResult(item);
            applyItemEffect(item);
            gameData.inventory.push(item);
            updateInventory();
            
            const event = lifeEvents[Math.floor(Math.random() * lifeEvents.length)];
            addHistory(`🎁 开启宝箱获得了【${item.name}】！${event}`, 'positive');

            elements.mysteryBox.classList.remove('opened');
            elements.gachaBtn.disabled = false;
        }, 500);
    }, 500);
}

function getRandomItem() {
    const rand = Math.random();
    let pool;
    
    if (rand < 0.02) {
        pool = gachaPool.filter(item => item.rarity === 'legendary');
    } else if (rand < 0.15) {
        pool = gachaPool.filter(item => item.rarity === 'epic');
    } else if (rand < 0.45) {
        pool = gachaPool.filter(item => item.rarity === 'rare');
    } else {
        pool = gachaPool.filter(item => item.rarity === 'common');
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

function showResult(item) {
    elements.resultIcon.textContent = item.icon;
    elements.resultName.textContent = item.name;
    elements.resultDesc.textContent = item.desc;
    elements.resultEffect.innerHTML = `<div class="effect-text">${item.effectText}</div>`;
    elements.resultModal.classList.add('show');
}

function applyItemEffect(item) {
    const effect = item.effect;
    if (effect.wealth) gameData.character.stats.wealth += effect.wealth;
    if (effect.wisdom) gameData.character.stats.wisdom += effect.wisdom;
    if (effect.charm) gameData.character.stats.charm += effect.charm;
    if (effect.health) gameData.character.stats.health += effect.health;
    updateUI();
}

function startEnergyRegen() {
    setInterval(() => {
        if (gameData.energy < gameData.maxEnergy) {
            gameData.energy = Math.min(gameData.energy + 1, gameData.maxEnergy);
            updateUI();
        }
    }, 3000);
}

function initEvents() {
    elements.gachaBtn.addEventListener('click', doGacha);
    elements.mysteryBox.addEventListener('click', doGacha);
    
    elements.closeModal.addEventListener('click', () => {
        elements.resultModal.classList.remove('show');
    });

    elements.resultModal.addEventListener('click', (e) => {
        if (e.target === elements.resultModal) {
            elements.resultModal.classList.remove('show');
        }
    });

    elements.rulesBtn.addEventListener('click', () => {
        elements.rulesModal.classList.add('show');
    });

    elements.closeRules.addEventListener('click', () => {
        elements.rulesModal.classList.remove('show');
    });

    elements.startGameBtn.addEventListener('click', () => {
        elements.rulesModal.classList.remove('show');
    });

    elements.rulesModal.addEventListener('click', (e) => {
        if (e.target === elements.rulesModal) {
            elements.rulesModal.classList.remove('show');
        }
    });
}

function init() {
    updateUI();
    updateInventory();
    initEvents();
    startEnergyRegen();
    addHistory("你的人生故事从这里开始...", 'start');
}

document.addEventListener('DOMContentLoaded', init);