// 游戏状态管理
const GameState = {
    player: {
        name: '小妖',
        realm: 0,
        realmLayer: 0,
        cultivation: 0,
        cultivationNeed: 100,
        spiritualStones: 100,
        peaches: 50,
        attack: 10,
        defense: 5,
        hp: 100,
        power: 100
    },
    tree: {
        level: 1,
        cultivationPerChop: 10
    },
    skills: [
        { id: 1, name: '火球术', level: 1, icon: '🔥', effect: '攻击+5', cost: 10 },
        { id: 2, name: '护盾术', level: 1, icon: '🛡️', effect: '防御+3', cost: 15 },
        { id: 3, name: '回春术', level: 1, icon: '🌿', effect: '血量+20', cost: 20 },
        { id: 4, name: '疾行术', level: 1, icon: '💨', effect: '修为+5/秒', cost: 25 }
    ],
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },
    inventory: [],
    pets: [],
    settings: {
        lastLoginTime: Date.now(),
        totalPlayTime: 0
    }
};

// 境界定义
const REALMS = [
    { name: '炼气期', layers: 9, multiplier: 1 },
    { name: '筑基期', layers: 9, multiplier: 2 },
    { name: '金丹期', layers: 9, multiplier: 4 },
    { name: '元婴期', layers: 9, multiplier: 8 },
    { name: '化神期', layers: 9, multiplier: 16 },
    { name: '炼虚期', layers: 9, multiplier: 32 },
    { name: '合体期', layers: 9, multiplier: 64 },
    { name: '大乘期', layers: 9, multiplier: 128 },
    { name: '渡劫期', layers: 9, multiplier: 256 }
];

// 装备模板
const EQUIPMENT_TEMPLATES = {
    weapon: [
        { name: '木剑', icon: '🗡️', rarity: 'common', attack: 5, defense: 0, hp: 0 },
        { name: '铁剑', icon: '⚔️', rarity: 'uncommon', attack: 12, defense: 0, hp: 0 },
        { name: '青云剑', icon: '🔪', rarity: 'rare', attack: 25, defense: 0, hp: 0 },
        { name: '紫电剑', icon: '⚡', rarity: 'epic', attack: 50, defense: 0, hp: 0 },
        { name: '诛仙古剑', icon: '✨', rarity: 'legendary', attack: 100, defense: 0, hp: 0 }
    ],
    armor: [
        { name: '布衣', icon: '👕', rarity: 'common', attack: 0, defense: 3, hp: 10 },
        { name: '皮甲', icon: '🛡️', rarity: 'uncommon', attack: 0, defense: 8, hp: 25 },
        { name: '锁子甲', icon: '🔩', rarity: 'rare', attack: 0, defense: 18, hp: 50 },
        { name: '玄铁甲', icon: '⚫', rarity: 'epic', attack: 0, defense: 35, hp: 100 },
        { name: '天蚕宝甲', icon: '🌟', rarity: 'legendary', attack: 0, defense: 70, hp: 200 }
    ],
    accessory: [
        { name: '铜戒指', icon: '💍', rarity: 'common', attack: 2, defense: 1, hp: 5 },
        { name: '玉吊坠', icon: '📿', rarity: 'uncommon', attack: 5, defense: 3, hp: 15 },
        { name: '珍珠项链', icon: '🔮', rarity: 'rare', attack: 10, defense: 6, hp: 30 },
        { name: '紫金铃', icon: '🔔', rarity: 'epic', attack: 20, defense: 12, hp: 60 },
        { name: '东皇钟', icon: '🏺', rarity: 'legendary', attack: 40, defense: 25, hp: 120 }
    ]
};

// 灵兽模板
const PET_TEMPLATES = [
    { name: '小狐狸', icon: '🦊', attack: 5, defense: 2, hp: 20, desc: '增加10%攻击加成' },
    { name: '仙鹤', icon: '🦅', attack: 3, defense: 5, hp: 30, desc: '增加15%防御加成' },
    { name: '灵龟', icon: '🐢', attack: 2, defense: 8, hp: 50, desc: '增加20%血量加成' },
    { name: '青龙', icon: '🐉', attack: 15, defense: 5, hp: 80, desc: '全属性+10%' },
    { name: '凤凰', icon: '🔥', attack: 20, defense: 3, hp: 40, desc: '增加修为产出+20%' }
];

// 稀有度权重
const RARITY_WEIGHTS = {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1
};

const RARITY_NAMES = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说'
};

// 游戏核心逻辑
class Game {
    constructor() {
        this.init();
    }

    init() {
        this.loadGame();
        this.startGameLoop();
        this.checkOfflineRewards();
        console.log('游戏初始化完成！');
    }

    loadGame() {
        const saved = localStorage.getItem('xundao_game');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(GameState, data);
            } catch (e) {
                console.error('加载存档失败:', e);
            }
        }
    }

    saveGame() {
        localStorage.setItem('xundao_game', JSON.stringify(GameState));
    }

    startGameLoop() {
        setInterval(() => {
            this.tick();
        }, 1000);

        setInterval(() => {
            this.saveGame();
        }, 5000);
    }

    tick() {
        const cultivationPerSecond = this.getCultivationPerSecond();
        GameState.player.cultivation += cultivationPerSecond;
        
        if (GameState.player.cultivation >= GameState.player.cultivationNeed) {
            GameState.player.cultivation = GameState.player.cultivationNeed;
        }

        GameState.settings.totalPlayTime++;
        this.updateUI();
    }

    getCultivationPerSecond() {
        let base = 10;
        const realmMultiplier = REALMS[GameState.player.realm]?.multiplier || 1;
        base *= realmMultiplier;

        const cultivationSkill = GameState.skills.find(s => s.name === '疾行术');
        if (cultivationSkill) {
            base += cultivationSkill.level * 5;
        }

        const phoenix = GameState.pets.find(p => p.name === '凤凰');
        if (phoenix) {
            base *= 1.2;
        }

        return Math.floor(base);
    }

    chopTree() {
        const treeSection = document.getElementById('tree');
        treeSection.classList.add('shaking');
        setTimeout(() => {
            treeSection.classList.remove('shaking');
        }, 300);

        const realmMultiplier = REALMS[GameState.player.realm]?.multiplier || 1;
        const cultivationGained = GameState.tree.cultivationPerChop * realmMultiplier;
        GameState.player.cultivation += cultivationGained;

        if (GameState.player.cultivation >= GameState.player.cultivationNeed) {
            GameState.player.cultivation = GameState.player.cultivationNeed;
        }

        const dropStones = Math.floor(Math.random() * 10 * realmMultiplier) + 1;
        GameState.player.spiritualStones += dropStones;

        if (Math.random() < 0.1) {
            const dropPeaches = Math.floor(Math.random() * 5) + 1;
            GameState.player.peaches += dropPeaches;
            this.showNotification(`🍑 获得仙桃 x${dropPeaches}`, 'success');
        }

        if (Math.random() < 0.3 + GameState.tree.level * 0.05) {
            this.dropEquipment();
        }

        if (Math.random() < 0.1) {
            this.dropPeach();
        }

        this.treeLevelUp();

        this.showNotification(`✨ 修为 +${cultivationGained}`, 'success');
        this.updateUI();
    }

    dropEquipment() {
        const slots = ['weapon', 'armor', 'accessory'];
        const slot = slots[Math.floor(Math.random() * slots.length)];
        
        const templates = EQUIPMENT_TEMPLATES[slot];
        const rarity = this.getRandomRarity();
        const template = templates.find(t => t.rarity === rarity) || templates[0];
        
        const equipment = {
            id: Date.now(),
            ...template,
            slot: slot,
            level: GameState.tree.level
        };

        const levelBonus = (GameState.tree.level - 1) * 0.1;
        equipment.attack = Math.floor(equipment.attack * (1 + levelBonus));
        equipment.defense = Math.floor(equipment.defense * (1 + levelBonus));
        equipment.hp = Math.floor(equipment.hp * (1 + levelBonus));

        if (GameState.inventory.length >= 12) {
            this.showNotification('背包已满！', 'warning');
            return;
        }

        GameState.inventory.push(equipment);
        this.showNotification(`🎁 获得 ${RARITY_NAMES[rarity]} ${equipment.name}！`, 'success');
        this.createDropAnimation(equipment.icon);
    }

    getRandomRarity() {
        const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
            random -= weight;
            if (random <= 0) {
                return rarity;
            }
        }
        return 'common';
    }

    dropPeach() {
        const amount = Math.floor(Math.random() * 3) + 1;
        GameState.player.peaches += amount;
        this.showNotification(`🍑 获得仙桃 x${amount}`, 'success');
    }

    treeLevelUp() {
        const need = GameState.tree.level * 100;
        if (GameState.player.cultivation >= need) {
            GameState.tree.level++;
            GameState.tree.cultivationPerChop += 5;
            this.showNotification(`🌳 仙树升级到 Lv.${GameState.tree.level}！`, 'success');
        }
    }

    breakthrough() {
        if (GameState.player.cultivation < GameState.player.cultivationNeed) {
            return false;
        }

        GameState.player.cultivation = 0;
        GameState.player.realmLayer++;

        if (GameState.player.realmLayer >= REALMS[GameState.player.realm].layers) {
            GameState.player.realmLayer = 0;
            GameState.player.realm++;
            if (GameState.player.realm >= REALMS.length) {
                GameState.player.realm = REALMS.length - 1;
            }
            this.showNotification('🎉 恭喜突破大境界！', 'success');
        }

        const realm = REALMS[GameState.player.realm];
        GameState.player.cultivationNeed = Math.floor(100 * Math.pow(1.5, GameState.player.realm * 9 + GameState.player.realmLayer));

        const baseAttack = 10 + GameState.player.realm * 20;
        const baseDefense = 5 + GameState.player.realm * 10;
        const baseHp = 100 + GameState.player.realm * 50;

        GameState.player.attack = baseAttack;
        GameState.player.defense = baseDefense;
        GameState.player.hp = baseHp;

        this.recalculateStats();

        this.showNotification(`⚡ 突破到 ${realm.name} ${GameState.player.realmLayer + 1}层！`, 'success');
        return true;
    }

    upgradeSkill(skillId) {
        const skill = GameState.skills.find(s => s.id === skillId);
        if (!skill) return false;

        const cost = skill.cost * skill.level;
        if (GameState.player.peaches < cost) {
            this.showNotification('仙桃不足！', 'error');
            return false;
        }

        GameState.player.peaches -= cost;
        skill.level++;

        this.recalculateStats();
        this.showNotification(`✨ ${skill.name} 升级到 Lv.${skill.level}！`, 'success');
        return true;
    }

    equipItem(itemId) {
        const index = GameState.inventory.findIndex(i => i.id === itemId);
        if (index === -1) return false;

        const item = GameState.inventory[index];
        if (GameState.equipment[item.slot]) {
            GameState.inventory.push(GameState.equipment[item.slot]);
        }

        GameState.equipment[item.slot] = item;
        GameState.inventory.splice(index, 1);

        this.recalculateStats();
        this.showNotification(`🛡️ 装备 ${item.name}！`, 'success');
        return true;
    }

    unequipItem(slot) {
        if (!GameState.equipment[slot]) return false;

        if (GameState.inventory.length >= 12) {
            this.showNotification('背包已满！', 'warning');
            return false;
        }

        GameState.inventory.push(GameState.equipment[slot]);
        GameState.equipment[slot] = null;

        this.recalculateStats();
        return true;
    }

    summonPet() {
        if (GameState.player.spiritualStones < 100) {
            this.showNotification('灵石不足！', 'error');
            return false;
        }

        if (GameState.pets.length >= 5) {
            this.showNotification('灵兽已满！', 'warning');
            return false;
        }

        GameState.player.spiritualStones -= 100;

        const template = PET_TEMPLATES[Math.floor(Math.random() * PET_TEMPLATES.length)];
        const pet = {
            id: Date.now(),
            ...template
        };

        GameState.pets.push(pet);
        this.recalculateStats();
        this.showNotification(`✨ 召唤出 ${pet.name}！`, 'success');
        return true;
    }

    recalculateStats() {
        let attack = 10 + GameState.player.realm * 20;
        let defense = 5 + GameState.player.realm * 10;
        let hp = 100 + GameState.player.realm * 50;

        const fireSkill = GameState.skills.find(s => s.name === '火球术');
        const shieldSkill = GameState.skills.find(s => s.name === '护盾术');
        const healSkill = GameState.skills.find(s => s.name === '回春术');

        if (fireSkill) attack += fireSkill.level * 5;
        if (shieldSkill) defense += shieldSkill.level * 3;
        if (healSkill) hp += healSkill.level * 20;

        Object.values(GameState.equipment).forEach(item => {
            if (item) {
                attack += item.attack;
                defense += item.defense;
                hp += item.hp;
            }
        });

        const fox = GameState.pets.find(p => p.name === '小狐狸');
        const crane = GameState.pets.find(p => p.name === '仙鹤');
        const turtle = GameState.pets.find(p => p.name === '灵龟');
        const dragon = GameState.pets.find(p => p.name === '青龙');

        if (fox) attack = Math.floor(attack * 1.1);
        if (crane) defense = Math.floor(defense * 1.15);
        if (turtle) hp = Math.floor(hp * 1.2);
        if (dragon) {
            attack = Math.floor(attack * 1.1);
            defense = Math.floor(defense * 1.1);
            hp = Math.floor(hp * 1.1);
        }

        GameState.player.attack = attack;
        GameState.player.defense = defense;
        GameState.player.hp = hp;
        GameState.player.power = attack + defense + Math.floor(hp / 2);
    }

    checkOfflineRewards() {
        const now = Date.now();
        const lastLogin = GameState.settings.lastLoginTime || now;
        const offlineSeconds = Math.floor((now - lastLogin) / 1000);

        if (offlineSeconds > 60) {
            const cultivationPerSecond = this.getCultivationPerSecond();
            const maxOfflineSeconds = Math.min(offlineSeconds, 8 * 60 * 60);
            
            const offlineCultivation = Math.floor(cultivationPerSecond * maxOfflineSeconds * 0.5);
            const offlineStones = Math.floor(maxOfflineSeconds / 60);

            GameState.player.cultivation += offlineCultivation;
            GameState.player.spiritualStones += offlineStones;

            const hours = Math.floor(offlineSeconds / 3600);
            const minutes = Math.floor((offlineSeconds % 3600) / 60);

            this.showOfflineModal(hours, minutes, offlineCultivation, offlineStones);
        }

        GameState.settings.lastLoginTime = now;
    }

    showOfflineModal(hours, minutes, cultivation, stones) {
        const modal = document.getElementById('offline-modal');
        document.getElementById('offline-time').textContent = `你离开了 ${hours} 小时 ${minutes} 分钟`;
        document.getElementById('offline-xp').textContent = cultivation;
        document.getElementById('offline-stones').textContent = stones;
        modal.style.display = 'flex';

        document.getElementById('collect-offline-btn').addEventListener('click', () => {
            modal.style.display = 'none';
            this.updateUI();
        });
    }

    showNotification(message, type = 'warning') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    createDropAnimation(icon) {
        const treeSection = document.getElementById('tree-section');
        const drop = document.createElement('div');
        drop.className = 'drop-item';
        drop.textContent = icon;
        drop.style.left = `${Math.random() * 100}px`;
        drop.style.top = '100px';
        treeSection.appendChild(drop);

        setTimeout(() => {
            drop.remove();
        }, 1000);
    }

    updateUI() {
        if (typeof updateUIElements === 'function') {
            updateUIElements();
        }
    }
}


