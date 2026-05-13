class EscapeRoomGame {
    constructor() {
        this.inventory = [];
        this.gameStarted = false;
        this.startTime = 0;
        this.timerInterval = null;
        this.hintsRemaining = 3;
        this.hintsUsed = 0;
        this.currentPassword = [0, 0, 0, 0];
        this.puzzlesSolved = {
            paper: false,
            note: false,
            key: false,
            safe: false,
            door: false
        };

        this.items = {
            paper: {
                id: 'paper',
                name: '神秘纸条',
                icon: '📜',
                description: '纸条上写着："当月光洒落，星辰的秘密将揭示。月亮之下，第一缕月光是3，第二颗星是7，第三颗星是4，最后一颗星是9。"'
            },
            note: {
                id: 'note',
                name: '泛黄笔记',
                icon: '📝',
                description: '这是一本泛黄的笔记，上面写着："密码是星辰的排列，月相的顺序... 3-7-4-9"'
            },
            key: {
                id: 'key',
                name: '古老钥匙',
                icon: '🔑',
                description: '一把锈迹斑斑的古老钥匙，似乎可以打开什么...'
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.createInventorySlots();
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
        document.getElementById('dialog-close').addEventListener('click', () => this.closeDialog());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });

        document.querySelectorAll('.interactive-object').forEach(obj => {
            obj.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.item;
                this.interactWithItem(itemId);
            });
        });
    }

    createInventorySlots() {
        const slotsContainer = document.getElementById('inventory-slots');
        slotsContainer.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            slot.addEventListener('click', () => this.selectInventoryItem(i));
            slotsContainer.appendChild(slot);
        }
    }

    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
        
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        this.showDialog('你环顾四周，这是一间昏暗的书房。空气中弥漫着古老书籍的气息。墙上挂着一幅神秘的油画，书架上堆满了尘封已久的书籍。书桌上似乎有什么东西在闪烁着微弱的光芒...');
    }

    restartGame() {
        this.inventory = [];
        this.hintsRemaining = 3;
        this.hintsUsed = 0;
        this.currentPassword = [0, 0, 0, 0];
        this.puzzlesSolved = {
            paper: false,
            note: false,
            key: false,
            safe: false,
            door: false
        };

        document.getElementById('hints-used').textContent = '0';
        document.getElementById('hint-count').textContent = `(${this.hintsRemaining})`;
        
        document.querySelectorAll('.interactive-object').forEach(obj => {
            obj.classList.remove('collected');
        });

        this.createInventorySlots();

        document.getElementById('end-screen').classList.remove('active');
        document.getElementById('start-screen').classList.add('active');

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        document.getElementById('time-display').textContent = '00:00';
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('time-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    interactWithItem(itemId) {
        switch(itemId) {
            case 'desk':
                this.interactDesk();
                break;
            case 'bookshelf':
                this.interactBookshelf();
                break;
            case 'painting':
                this.interactPainting();
                break;
            case 'cabinet':
                this.interactCabinet();
                break;
            case 'carpet':
                this.interactCarpet();
                break;
            case 'door':
                this.interactDoor();
                break;
        }
    }

    interactDesk() {
        if (this.puzzlesSolved.paper) {
            this.showDialog('书桌上已经没有其他东西了。');
            return;
        }
        
        this.puzzlesSolved.paper = true;
        this.addToInventory(this.items.paper);
        document.getElementById('desk').classList.add('collected');
        
        this.showDialog('你在书桌上发现了一张神秘的纸条！上面写着关于星辰和月亮的秘密...这似乎和那幅油画有关。');
    }

    interactBookshelf() {
        if (this.puzzlesSolved.note) {
            this.showDialog('书架上的书你都检查过了，没有其他特别的东西。');
            return;
        }
        
        this.puzzlesSolved.note = true;
        this.addToInventory(this.items.note);
        document.getElementById('bookshelf').classList.add('collected');
        
        this.showDialog('你在书架的角落里发现了一本泛黄的笔记！笔记上写着一串神秘的密码提示：3-7-4-9。这是什么意思呢？');
    }

    interactPainting() {
        this.showDialog('这幅油画描绘了一个月光皎洁的夜晚，三颗星星在月亮的周围闪烁。画中的月亮散发着神秘的光芒...');
    }

    interactCabinet() {
        if (this.puzzlesSolved.safe) {
            if (this.puzzlesSolved.key) {
                this.showDialog('柜子已经被打开了，里面空空如也。');
            } else {
                this.showPasswordModal();
            }
            return;
        }

        this.showPasswordModal();
    }

    interactCarpet() {
        this.showDialog('这是一块华丽的红色地毯，上面绣着金色的花纹。地毯似乎有些不平整，但没有发现什么特别的东西。');
    }

    interactDoor() {
        if (this.puzzlesSolved.door) {
            this.showDialog('门已经打开了！');
            return;
        }

        if (this.hasItem('key')) {
            this.showModal({
                title: '使用钥匙？',
                body: '你要用古老钥匙打开这扇门吗？',
                actions: [
                    { text: '取消', primary: false, callback: () => this.closeModal() },
                    { text: '开门', primary: true, callback: () => this.openDoor() }
                ]
            });
        } else {
            this.showDialog('这扇门被牢牢锁住了。门上有一个钥匙孔，需要找到正确的钥匙才能打开。');
        }
    }

    showPasswordModal() {
        this.currentPassword = [0, 0, 0, 0];
        
        const passwordHtml = `
            <p style="text-align: center; margin-bottom: 15px;">柜子上有一个四位数字密码锁</p>
            <div class="password-input">
                ${this.currentPassword.map((digit, i) => `
                    <div class="password-digit" data-index="${i}">${digit}</div>
                `).join('')}
            </div>
            <p style="text-align: center; font-size: 0.9rem; color: #8b7355;">点击数字可增加数值</p>
        `;

        this.showModal({
            title: '输入密码',
            body: passwordHtml,
            actions: [
                { text: '取消', primary: false, callback: () => this.closeModal() },
                { text: '确认', primary: true, callback: () => this.checkPassword() }
            ]
        });

        document.querySelectorAll('.password-digit').forEach(digit => {
            digit.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.currentPassword[index] = (this.currentPassword[index] + 1) % 10;
                e.target.textContent = this.currentPassword[index];
            });
        });
    }

    checkPassword() {
        const password = this.currentPassword.join('');
        if (password === '3749') {
            this.puzzlesSolved.safe = true;
            this.closeModal();
            
            if (!this.puzzlesSolved.key) {
                this.puzzlesSolved.key = true;
                this.addToInventory(this.items.key);
                document.getElementById('cabinet').classList.add('collected');
            }
            
            this.showDialog('密码正确！柜子打开了，里面有一把古老的钥匙！这应该可以打开那扇门！');
        } else {
            this.showDialog('密码错误，锁没有打开...再想想看，密码会是什么呢？');
            this.closeModal();
        }
    }

    openDoor() {
        this.puzzlesSolved.door = true;
        this.removeFromInventory('key');
        this.closeModal();
        
        clearInterval(this.timerInterval);
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('end-title').textContent = '🎉 逃脱成功！';
        document.getElementById('end-message').textContent = '你成功解开了所有谜题，逃出了幽暗庄园！';
        document.getElementById('final-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('hints-used').textContent = this.hintsUsed;
        
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('end-screen').classList.add('active');
    }

    addToInventory(item) {
        if (this.inventory.length < 6) {
            this.inventory.push(item);
            this.updateInventoryDisplay();
        }
    }

    removeFromInventory(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
        this.updateInventoryDisplay();
    }

    hasItem(itemId) {
        return this.inventory.some(item => item.id === itemId);
    }

    updateInventoryDisplay() {
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            slot.innerHTML = '';
            if (this.inventory[index]) {
                slot.textContent = this.inventory[index].icon;
                slot.title = this.inventory[index].name;
            }
        });
    }

    selectInventoryItem(index) {
        if (this.inventory[index]) {
            const item = this.inventory[index];
            this.showDialog(`【${item.name}】\n\n${item.description}`);
        }
    }

    useHint() {
        if (this.hintsRemaining <= 0) {
            this.showDialog('你已经用完了所有提示！');
            return;
        }

        this.hintsRemaining--;
        this.hintsUsed++;
        document.getElementById('hint-count').textContent = `(${this.hintsRemaining})`;
        document.getElementById('hints-used').textContent = this.hintsUsed;

        let hint = '';
        
        if (!this.puzzlesSolved.paper) {
            hint = '试试检查一下书桌，也许会有发现...';
        } else if (!this.puzzlesSolved.note) {
            hint = '书架上那么多书，也许有一本特别的...';
        } else if (!this.puzzlesSolved.safe) {
            hint = '仔细看看你收集的纸条和笔记，密码应该就在其中...提示：3749';
        } else if (!this.puzzlesSolved.door) {
            hint = '你已经有钥匙了，去试试打开那扇门吧！';
        } else {
            hint = '你已经解开了所有谜题！';
        }

        this.showDialog(`💡 提示：${hint}`);
    }

    showDialog(content) {
        const dialogBox = document.getElementById('dialog-box');
        const dialogContent = document.getElementById('dialog-content');
        dialogContent.innerHTML = content.replace(/\n/g, '<br>');
        dialogBox.classList.add('active');
    }

    closeDialog() {
        document.getElementById('dialog-box').classList.remove('active');
    }

    showModal({ title, body, actions }) {
        const modal = document.getElementById('modal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = body;
        
        const actionsContainer = document.getElementById('modal-actions');
        actionsContainer.innerHTML = '';
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `modal-btn ${action.primary ? 'primary' : ''}`;
            btn.textContent = action.text;
            btn.addEventListener('click', action.callback);
            actionsContainer.appendChild(btn);
        });

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EscapeRoomGame();
});
