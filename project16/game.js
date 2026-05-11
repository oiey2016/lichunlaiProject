const gameState = {
    money: 500,
    intel: 100,
    reputation: 0,
    production: {
        informant: { level: 1, rate: 1, cost: 100 },
        radio: { level: 1, rate: 3, cost: 500 },
        infiltrate: { level: 1, rate: 10, cost: 2000 }
    },
    foundSpots: new Set(),
    discoveredEasterEggs: new Set()
};


const easterEggs = {
    desk: {
        title: "🎯 发现隐藏线索！",
        text: "你在办公桌抽屉里发现了一张密写的纸条：'76号里有内鬼，小心行事。' 获得 +50 情报！"
    },
    lamp: {
        title: "💡 灯中有玄机！",
        text: "你发现台灯底座可以旋转，里面藏着一块微型胶卷！获得 +100 经费！"
    },
    phone: {
        title: "📞 神秘来电！",
        text: "老式电话突然响起，你接起电话，对面传来低沉的声音：'麻雀，组织相信你。' 获得 +10 声望！"
    },
    document: {
        title: "📄 绝密档案！",
        text: "这份文件是汪伪政府的特务名单！你迅速记下了几个关键名字。获得 +200 情报！"
    },
    photo: {
        title: "🖼️ 老照片的秘密！",
        text: "照片背面写着一行小字：'如果我回不来，请照顾好我的家人。' 你肃然起敬。获得 +5 声望！"
    },
    bookshelf: {
        title: "📚 密码本！",
        text: "你发现书架上有一本书的页数与其他不同，翻开来，里面是一本密码本！获得 +300 情报！"
    },
    window: {
        title: "🪟 窗外的信号！",
        text: "对面楼的窗户有灯光闪烁，是摩斯密码：.'- .... . / -- .. ... ... .. --- -. / .. ... / ... .- ..- -.-. .'（任务安全）。获得 +50 经费！"
    }
};

const missions = {
    1: { reward: { money: 500, intel: 200, reputation: 0 }, name: "传递密信" },
    2: { reward: { money: 1500, intel: 800, reputation: 0 }, name: "伪装潜入" },
    3: { reward: { money: 5000, intel: 3000, reputation: 50 }, name: "紧急营救" }
};

function initGame() {
    loadGameState();
    updateResourceDisplay();
    setupTabNavigation();
    setupProductionUpgrades();
    setupEasterEggs();
    setupMinigame();
    setupMissions();
    setupStorySystem();
    setupAgentTraining();
    startProductionLoop();
}

function loadGameState() {
    const saved = localStorage.getItem('spyGameState');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(gameState, parsed);
        gameState.foundSpots = new Set(parsed.foundSpots || []);
        gameState.discoveredEasterEggs = new Set(parsed.discoveredEasterEggs || []);
    }
}

function saveGameState() {
    const toSave = {
        ...gameState,
        foundSpots: Array.from(gameState.foundSpots),
        discoveredEasterEggs: Array.from(gameState.discoveredEasterEggs)
    };
    localStorage.setItem('spyGameState', JSON.stringify(toSave));
}

function updateResourceDisplay() {
    document.getElementById('money').textContent = Math.floor(gameState.money);
    document.getElementById('intel').textContent = Math.floor(gameState.intel);
    document.getElementById('reputation').textContent = Math.floor(gameState.reputation);
}

function setupTabNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function setupProductionUpgrades() {
    const upgradeBtns = document.querySelectorAll('.upgrade-btn');
    
    upgradeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const production = gameState.production[type];
            
            if (gameState.money >= production.cost) {
                gameState.money -= production.cost;
                production.level++;
                production.rate = Math.floor(production.rate * 1.5);
                production.cost = Math.floor(production.cost * 2);
                
                const prodItem = btn.closest('.prod-item');
                prodItem.querySelector('.prod-rate').textContent = `+${production.rate} 情报/秒`;
                btn.textContent = `升级 (${production.cost}经费)`;
                
                updateResourceDisplay();
                saveGameState();
                showNotification(`升级成功！${type === 'informant' ? '线人报告' : type === 'radio' ? '电台监听' : '卧底渗透'} 等级 ${production.level}`);
            } else {
                showNotification("经费不足！", true);
            }
        });
    });
}

function startProductionLoop() {
    setInterval(() => {
        let totalRate = 0;
        Object.values(gameState.production).forEach(p => {
            totalRate += p.rate;
        });
        gameState.intel += totalRate / 10;
        gameState.money += totalRate / 20;
        updateResourceDisplay();
        saveGameState();
    }, 100);
}

function setupEasterEggs() {
    Object.keys(easterEggs).forEach(eggId => {
        const element = document.getElementById(`easter-egg-${eggId}`);
        if (element) {
            element.addEventListener('click', () => {
                if (!gameState.discoveredEasterEggs.has(eggId)) {
                    gameState.discoveredEasterEggs.add(eggId);
                    showEasterEggPopup(eggId);
                    applyEasterEggReward(eggId);
                    saveGameState();
                } else {
                    showEasterEggPopup(eggId, true);
                }
            });
        }
    });

    document.querySelector('.close-popup').addEventListener('click', () => {
        document.getElementById('easter-egg-popup').classList.add('hidden');
    });

    document.getElementById('easter-egg-popup').addEventListener('click', (e) => {
        if (e.target.id === 'easter-egg-popup') {
            document.getElementById('easter-egg-popup').classList.add('hidden');
        }
    });
}

function showEasterEggPopup(eggId, alreadyDiscovered = false) {
    const popup = document.getElementById('easter-egg-popup');
    const title = document.getElementById('egg-title');
    const text = document.getElementById('egg-text');
    
    const egg = easterEggs[eggId];
    title.textContent = alreadyDiscovered ? `${egg.title} (已发现)` : egg.title;
    text.textContent = egg.text;
    
    popup.classList.remove('hidden');
}

function applyEasterEggReward(eggId) {
    switch(eggId) {
        case 'desk':
            gameState.intel += 50;
            break;
        case 'lamp':
            gameState.money += 100;
            break;
        case 'phone':
            gameState.reputation += 10;
            break;
        case 'document':
            gameState.intel += 200;
            break;
        case 'photo':
            gameState.reputation += 5;
            break;
        case 'bookshelf':
            gameState.intel += 300;
            break;
        case 'window':
            gameState.money += 50;
            break;
    }
    updateResourceDisplay();
}

function setupMinigame() {
    const spots = document.querySelectorAll('.diff-spot');
    const foundCountEl = document.getElementById('found-count');
    
    spots.forEach(spot => {
        spot.addEventListener('click', () => {
            const spotNum = spot.dataset.spot;
            
            if (!gameState.foundSpots.has(spotNum)) {
                gameState.foundSpots.add(spotNum);
                spot.classList.add('found');
                
                spots.forEach(s => {
                    if (s.dataset.spot === spotNum) {
                        s.classList.add('found');
                    }
                });
                
                foundCountEl.textContent = gameState.foundSpots.size;
                
                if (gameState.foundSpots.size === 5) {
                    gameState.intel += 500;
                    gameState.reputation += 20;
                    updateResourceDisplay();
                    showNotification("🎉 找不同完成！获得 +500 情报 +20 声望！");
                }
                
                saveGameState();
            }
        });
    });

    document.getElementById('reset-game').addEventListener('click', () => {
        gameState.foundSpots.clear();
        spots.forEach(spot => spot.classList.remove('found'));
        foundCountEl.textContent = 0;
        saveGameState();
        showNotification("游戏已重置！");
    });
}

function setupMissions() {
    const missionBtns = document.querySelectorAll('.mission-btn');
    
    missionBtns.forEach((btn, index) => {
        const missionId = index + 1;
        btn.addEventListener('click', () => {
            const mission = missions[missionId];
            const originalText = btn.textContent;
            btn.textContent = "执行中...";
            btn.disabled = true;
            
            setTimeout(() => {
                gameState.money += mission.reward.money;
                gameState.intel += mission.reward.intel;
                gameState.reputation += mission.reward.reputation;
                
                updateResourceDisplay();
                saveGameState();
                
                btn.textContent = originalText;
                btn.disabled = false;
                
                showNotification(`任务「${mission.name}」完成！获得 +${mission.reward.money} 经费 +${mission.reward.intel} 情报${mission.reward.reputation > 0 ? ` +${mission.reward.reputation} 声望` : ''}`);
            }, 2000);
        });
    });
}

function setupStorySystem() {
    const addBtn = document.getElementById('add-story');
    const textarea = document.getElementById('new-story');
    const storyLog = document.getElementById('story-log');
    
    addBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (text) {
            const now = new Date();
            const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
            
            const entry = document.createElement('div');
            entry.className = 'story-entry';
            entry.innerHTML = `
                <span class="story-date">${dateStr}</span>
                <p class="story-text">${escapeHtml(text)}</p>
            `;
            
            storyLog.insertBefore(entry, storyLog.firstChild);
            textarea.value = '';
            
            gameState.reputation += 1;
            updateResourceDisplay();
            saveGameState();
            
            showNotification("记录已保存！获得 +1 声望");
        }
    });
}

function setupAgentTraining() {
    const trainBtns = document.querySelectorAll('.train-btn');
    
    trainBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameState.money >= 300) {
                gameState.money -= 300;
                gameState.reputation += 5;
                
                const agentCard = btn.closest('.agent-card');
                const statBars = agentCard.querySelectorAll('.stat-fill');
                
                statBars.forEach(bar => {
                    const currentWidth = parseFloat(bar.style.width);
                    if (currentWidth < 100) {
                        bar.style.width = `${Math.min(100, currentWidth + 3)}%`;
                    }
                });
                
                updateResourceDisplay();
                saveGameState();
                showNotification("特工训练完成！获得 +5 声望");
            } else {
                showNotification("经费不足！训练需要 300 经费", true);
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? '#e94560' : '#d4a84b'};
        color: ${isError ? 'white' : '#1a1a2e'};
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', initGame);