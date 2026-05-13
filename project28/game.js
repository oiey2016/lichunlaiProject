class FarmGame {
    constructor() {
        this.gameState = {
            gold: 1000,
            diamond: 10,
            level: 1,
            exp: 0,
            expToNext: 100,
            cropCount: 0,
            plots: [],
            buildings: [],
            inventory: {}
        };
        
        this.crops = [
            { id: 'wheat', name: '小麦', icon: '🌾', price: 20, growTime: 10, harvest: 50, exp: 10 },
            { id: 'carrot', name: '胡萝卜', icon: '🥕', price: 35, growTime: 15, harvest: 80, exp: 15 },
            { id: 'corn', name: '玉米', icon: '🌽', price: 50, growTime: 20, harvest: 120, exp: 20 },
            { id: 'tomato', name: '番茄', icon: '🍅', price: 75, growTime: 25, harvest: 180, exp: 30 },
            { id: 'strawberry', name: '草莓', icon: '🍓', price: 100, growTime: 30, harvest: 250, exp: 40 },
            { id: 'watermelon', name: '西瓜', icon: '🍉', price: 150, growTime: 40, harvest: 400, exp: 60 }
        ];
        
        this.buildings = [
            { id: 'house', name: '小木屋', icon: '🏠', price: 500, income: 10, incomeInterval: 60 },
            { id: 'barn', name: '仓库', icon: '🏚️', price: 800, income: 20, incomeInterval: 60 },
            { id: 'well', name: '水井', icon: '🪣', price: 300, income: 5, incomeInterval: 30 },
            { id: 'garden', name: '花园', icon: '🌸', price: 600, income: 15, incomeInterval: 45 },
            { id: 'windmill', name: '风车', icon: '🌀', price: 1200, income: 35, incomeInterval: 60 },
            { id: 'market', name: '集市', icon: '🏪', price: 2000, income: 50, incomeInterval: 60 }
        ];
        
        this.neighbors = [
            { name: '老王', avatar: '👴', level: 12 },
            { name: '小李', avatar: '👩', level: 8 },
            { name: '阿花', avatar: '👧', level: 15 },
            { name: '大壮', avatar: '👨', level: 5 }
        ];
        
        this.achievements = [
            { name: '初出茅庐', desc: '收获第一颗作物', done: false },
            { name: '小有积蓄', desc: '拥有1000金币', done: false },
            { name: '建筑大师', desc: '建造3座建筑', done: false },
            { name: '种植达人', desc: '收获100颗作物', done: false }
        ];
        
        this.selectedPlot = null;
        this.init();
    }
    
    init() {
        this.initPlots();
        this.renderFarm();
        this.renderShop();
        this.renderBuildings();
        this.renderCommunity();
        this.bindEvents();
        this.startGameLoop();
        this.updateUI();
    }
    
    initPlots() {
        const totalPlots = 12;
        for (let i = 0; i < totalPlots; i++) {
            this.gameState.plots.push({
                id: i,
                planted: false,
                crop: null,
                plantedAt: null,
                ready: false
            });
        }
    }
    
    renderFarm() {
        const farmGrid = document.getElementById('farm-grid');
        farmGrid.innerHTML = '';
        
        this.gameState.plots.forEach(plot => {
            const plotEl = document.createElement('div');
            plotEl.className = 'farm-plot';
            plotEl.dataset.plotId = plot.id;
            
            if (plot.planted) {
                plotEl.classList.add('planted');
                const crop = this.crops.find(c => c.id === plot.crop);
                const elapsed = (Date.now() - plot.plantedAt) / 1000;
                const progress = Math.min(elapsed / crop.growTime, 1);
                
                if (progress >= 1) {
                    plotEl.classList.add('ready');
                    plotEl.innerHTML = crop.icon;
                } else {
                    const growthStages = ['🌱', '🌿', '🪴'];
                    const stageIndex = Math.floor(progress * growthStages.length);
                    plotEl.innerHTML = growthStages[Math.min(stageIndex, growthStages.length - 1)];
                    
                    const progressBar = document.createElement('div');
                    progressBar.className = 'progress-bar';
                    progressBar.style.width = `${progress * 100}%`;
                    plotEl.appendChild(progressBar);
                }
            } else {
                plotEl.innerHTML = '➕';
            }
            
            farmGrid.appendChild(plotEl);
        });
    }
    
    renderShop() {
        const shopList = document.getElementById('shop-list');
        shopList.innerHTML = '';
        
        this.crops.forEach(crop => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="shop-icon">${crop.icon}</div>
                <div class="shop-name">${crop.name}</div>
                <div class="shop-price">💰 ${crop.price}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    收获: ${crop.harvest}金币 | 经验: ${crop.exp}
                </div>
            `;
            shopList.appendChild(item);
        });
    }
    
    renderBuildings() {
        const buildList = document.getElementById('build-list');
        buildList.innerHTML = '';
        
        this.buildings.forEach(building => {
            const owned = this.gameState.buildings.filter(b => b.id === building.id).length;
            const item = document.createElement('div');
            item.className = 'build-item';
            item.dataset.buildingId = building.id;
            item.innerHTML = `
                <div class="build-icon">${building.icon}</div>
                <div class="build-name">${building.name}</div>
                <div class="build-price">💰 ${building.price}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    收入: ${building.income}金币/${building.incomeInterval}秒
                </div>
                <div style="font-size: 12px; color: #4caf50; margin-top: 3px;">
                    已拥有: ${owned}
                </div>
            `;
            buildList.appendChild(item);
        });
    }
    
    renderCommunity() {
        const neighborList = document.getElementById('neighbor-list');
        neighborList.innerHTML = '';
        
        this.neighbors.forEach(neighbor => {
            const item = document.createElement('div');
            item.className = 'neighbor-item';
            item.innerHTML = `
                <div class="neighbor-avatar">${neighbor.avatar}</div>
                <div>
                    <div style="font-weight: bold;">${neighbor.name}</div>
                    <div style="font-size: 12px; color: #666;">等级 ${neighbor.level}</div>
                </div>
            `;
            neighborList.appendChild(item);
        });
        
        const achievementList = document.getElementById('achievement-list');
        achievementList.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = 'achievement-item';
            item.style.opacity = achievement.done ? '1' : '0.6';
            item.innerHTML = `
                <div style="font-weight: bold;">${achievement.done ? '✅' : '🔒'} ${achievement.name}</div>
                <div style="font-size: 12px;">${achievement.desc}</div>
            `;
            achievementList.appendChild(item);
        });
    }
    
    bindEvents() {
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const tab = e.target.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${tab}-tab`).classList.add('active');
            });
        });
        
        document.getElementById('farm-grid').addEventListener('click', (e) => {
            const plotEl = e.target.closest('.farm-plot');
            if (!plotEl) return;
            
            const plotId = parseInt(plotEl.dataset.plotId);
            const plot = this.gameState.plots[plotId];
            
            if (plot.ready) {
                this.harvestCrop(plotId);
            } else if (!plot.planted) {
                this.selectedPlot = plotId;
                this.showPlantModal();
            }
        });
        
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('plant-modal').classList.remove('active');
        });
        
        document.getElementById('rules-btn').addEventListener('click', () => {
            document.getElementById('rules-modal').classList.add('active');
        });
        
        document.getElementById('close-rules-modal').addEventListener('click', () => {
            document.getElementById('rules-modal').classList.remove('active');
        });
        
        document.getElementById('build-list').addEventListener('click', (e) => {
            const buildItem = e.target.closest('.build-item');
            if (!buildItem) return;
            
            const buildingId = buildItem.dataset.buildingId;
            this.buyBuilding(buildingId);
        });
    }
    
    showPlantModal() {
        const modal = document.getElementById('plant-modal');
        const seedOptions = document.getElementById('seed-options');
        seedOptions.innerHTML = '';
        
        this.crops.forEach(crop => {
            const option = document.createElement('div');
            option.className = 'seed-option';
            option.innerHTML = `
                <span class="seed-icon">${crop.icon}</span>
                <div>${crop.name}</div>
                <div style="font-size: 12px; color: #666;">💰 ${crop.price}</div>
            `;
            option.addEventListener('click', () => {
                this.plantCrop(this.selectedPlot, crop.id);
                modal.classList.remove('active');
            });
            seedOptions.appendChild(option);
        });
        
        modal.classList.add('active');
    }
    
    plantCrop(plotId, cropId) {
        const crop = this.crops.find(c => c.id === cropId);
        
        if (this.gameState.gold < crop.price) {
            this.showToast('金币不足！');
            return;
        }
        
        this.gameState.gold -= crop.price;
        this.gameState.plots[plotId].planted = true;
        this.gameState.plots[plotId].crop = cropId;
        this.gameState.plots[plotId].plantedAt = Date.now();
        
        this.updateUI();
        this.renderFarm();
        this.showToast(`成功种植 ${crop.name}！`);
    }
    
    harvestCrop(plotId) {
        const plot = this.gameState.plots[plotId];
        const crop = this.crops.find(c => c.id === plot.crop);
        
        this.gameState.gold += crop.harvest;
        this.gameState.exp += crop.exp;
        this.gameState.cropCount++;
        
        plot.planted = false;
        plot.crop = null;
        plot.plantedAt = null;
        plot.ready = false;
        
        this.checkLevelUp();
        this.checkAchievements();
        this.updateUI();
        this.renderFarm();
        this.showToast(`收获 ${crop.name}，获得 ${crop.harvest} 金币！`);
    }
    
    buyBuilding(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        
        if (this.gameState.gold < building.price) {
            this.showToast('金币不足！');
            return;
        }
        
        this.gameState.gold -= building.price;
        this.gameState.buildings.push({
            id: buildingId,
            builtAt: Date.now(),
            lastIncome: Date.now()
        });
        
        this.checkAchievements();
        this.updateUI();
        this.renderBuildings();
        this.showToast(`成功建造 ${building.name}！`);
    }
    
    checkLevelUp() {
        while (this.gameState.exp >= this.gameState.expToNext) {
            this.gameState.exp -= this.gameState.expToNext;
            this.gameState.level++;
            this.gameState.expToNext = Math.floor(this.gameState.expToNext * 1.5);
            this.gameState.diamond += 5;
            this.showToast(`🎉 升级啦！当前等级: ${this.gameState.level}`);
        }
    }
    
    checkAchievements() {
        if (!this.achievements[0].done && this.gameState.cropCount >= 1) {
            this.achievements[0].done = true;
            this.showToast('🏆 解锁成就: 初出茅庐！');
        }
        if (!this.achievements[1].done && this.gameState.gold >= 1000) {
            this.achievements[1].done = true;
            this.showToast('🏆 解锁成就: 小有积蓄！');
        }
        if (!this.achievements[2].done && this.gameState.buildings.length >= 3) {
            this.achievements[2].done = true;
            this.showToast('🏆 解锁成就: 建筑大师！');
        }
        if (!this.achievements[3].done && this.gameState.cropCount >= 100) {
            this.achievements[3].done = true;
            this.showToast('🏆 解锁成就: 种植达人！');
        }
        this.renderCommunity();
    }
    
    startGameLoop() {
        setInterval(() => {
            this.gameState.plots.forEach(plot => {
                if (plot.planted && !plot.ready) {
                    const crop = this.crops.find(c => c.id === plot.crop);
                    const elapsed = (Date.now() - plot.plantedAt) / 1000;
                    if (elapsed >= crop.growTime) {
                        plot.ready = true;
                    }
                }
            });
            this.renderFarm();
        }, 1000);
        
        setInterval(() => {
            this.gameState.buildings.forEach(buildingState => {
                const building = this.buildings.find(b => b.id === buildingState.id);
                const elapsed = (Date.now() - buildingState.lastIncome) / 1000;
                if (elapsed >= building.incomeInterval) {
                    this.gameState.gold += building.income;
                    buildingState.lastIncome = Date.now();
                    this.updateUI();
                }
            });
        }, 1000);
    }
    
    updateUI() {
        document.getElementById('gold').textContent = this.gameState.gold;
        document.getElementById('diamond').textContent = this.gameState.diamond;
        document.getElementById('player-level').textContent = this.gameState.level;
        document.getElementById('crop-count').textContent = this.gameState.cropCount;
        
        const expPercent = (this.gameState.exp / this.gameState.expToNext) * 100;
        document.getElementById('exp-fill').style.width = `${expPercent}%`;
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FarmGame();
});