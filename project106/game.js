class RhythmGame {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.notes = [];
        this.noteSpeed = 3;
        this.gameTime = 0;
        this.lastTime = 0;
        this.audioContext = null;
        this.bgm = null;
        this.songData = this.generateSongData();
        
        this.initElements();
        this.initEventListeners();
        this.showScreen('start-screen');
    }

    initElements() {
        this.screens = {
            start: document.getElementById('start-screen'),
            rules: document.getElementById('rules-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen'),
            pause: document.getElementById('pause-screen')
        };

        this.scoreDisplay = document.getElementById('score');
        this.comboDisplay = document.getElementById('combo');
        this.notesContainer = document.getElementById('notes-container');
        this.judgeText = document.getElementById('judge-text');
        this.attackZone = document.getElementById('attack-zone');
        this.defendZone = document.getElementById('defend-zone');

        this.finalScore = document.getElementById('final-score');
        this.finalMaxCombo = document.getElementById('max-combo');
        this.finalPerfect = document.getElementById('perfect-count');
        this.finalAccuracy = document.getElementById('accuracy');
    }

    initEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('rules-btn').addEventListener('click', () => this.showScreen('rules-screen'));
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('start-screen'));
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
        document.getElementById('home-btn').addEventListener('click', () => this.showScreen('start-screen'));

        this.attackZone.addEventListener('mousedown', () => this.handleInput('attack'));
        this.attackZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput('attack');
        });

        this.defendZone.addEventListener('mousedown', () => this.handleInput('defend'));
        this.defendZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput('defend');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'j' || e.key === 'J') {
                this.handleInput('attack');
            } else if (e.key === 'k' || e.key === 'K') {
                this.handleInput('defend');
            } else if (e.key === 'Escape' && this.isPlaying) {
                if (this.isPaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'j' || e.key === 'J') {
                this.attackZone.classList.remove('active');
            } else if (e.key === 'k' || e.key === 'K') {
                this.defendZone.classList.remove('active');
            }
        });
    }

    generateSongData() {
        const bpm = 120;
        const beatInterval = 60000 / bpm;
        const notes = [];
        let time = 2000;

        const patterns = [
            ['attack', 'attack', 'defend'],
            ['attack', 'defend', 'defend'],
            ['defend', 'attack', 'attack'],
            ['attack', 'defend', 'attack', 'defend'],
            ['defend', 'defend', 'attack', 'attack'],
            ['attack', 'attack', 'attack'],
            ['defend', 'defend', 'defend'],
            ['attack', 'defend', 'attack', 'defend', 'attack', 'defend']
        ];

        for (let i = 0; i < 30; i++) {
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const interval = beatInterval * (0.5 + Math.random() * 0.5);
            
            pattern.forEach((type, index) => {
                notes.push({
                    time: time + index * interval,
                    type: type,
                    lane: Math.random() > 0.5 ? 'left' : 'right'
                });
            });
            
            time += pattern.length * interval + beatInterval;
        }

        return notes;
    }

    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playSound(type) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            if (type === 'attack') {
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.1);
            } else if (type === 'defend') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime);
            }
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.15);
        } catch (e) {}
    }

    startGame() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.notes = [];
        this.gameTime = 0;
        this.lastTime = performance.now();
        this.isPlaying = true;
        this.isPaused = false;

        this.notesContainer.innerHTML = '';
        this.updateUI();
        this.initAudio();
        this.showScreen('game-screen');
        
        this.songData = this.generateSongData();
        this.totalNotes = this.songData.length;
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameLoop(time) {
        if (!this.isPlaying) return;
        if (this.isPaused) {
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.gameTime += deltaTime;

        this.spawnNotes();
        this.updateNotes(deltaTime);
        this.checkMissedNotes();

        if (this.gameTime > this.songData[this.songData.length - 1].time + 3000) {
            this.endGame();
            return;
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    spawnNotes() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const spawnDistance = Math.max(window.innerWidth, window.innerHeight) * 0.6;

        this.songData.forEach((noteData, index) => {
            if (!noteData.spawned && this.gameTime >= noteData.time - this.calculateTravelTime()) {
                noteData.spawned = true;

                const angle = noteData.lane === 'left' ? Math.PI + Math.random() * 0.5 : Math.random() * 0.5;
                const startX = centerX + Math.cos(angle) * spawnDistance;
                const startY = centerY + Math.sin(angle) * spawnDistance;

                const noteElement = document.createElement('div');
                noteElement.className = `note ${noteData.type}`;
                noteElement.innerHTML = noteData.type === 'attack' ? '⚔️' : '🛡️';
                noteElement.style.left = `${startX - 40}px`;
                noteElement.style.top = `${startY - 40}px`;

                this.notesContainer.appendChild(noteElement);

                this.notes.push({
                    element: noteElement,
                    type: noteData.type,
                    time: noteData.time,
                    startX: startX,
                    startY: startY,
                    targetX: centerX,
                    targetY: centerY,
                    hit: false,
                    missed: false
                });
            }
        });
    }

    calculateTravelTime() {
        return 1500;
    }

    updateNotes(deltaTime) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.notes.forEach(note => {
            if (note.hit || note.missed) return;

            const timeUntilHit = note.time - this.gameTime;
            const progress = 1 - (timeUntilHit / this.calculateTravelTime());

            if (progress >= 0 && progress <= 1) {
                const currentX = note.startX + (note.targetX - note.startX) * progress;
                const currentY = note.startY + (note.targetY - note.startY) * progress;

                note.element.style.left = `${currentX - 40}px`;
                note.element.style.top = `${currentY - 40}px`;

                const scale = 0.5 + progress * 0.5;
                note.element.style.transform = `scale(${scale})`;
            }
        });
    }

    checkMissedNotes() {
        this.notes.forEach(note => {
            if (note.hit || note.missed) return;

            const timeDiff = this.gameTime - note.time;
            
            if (timeDiff > 200) {
                note.missed = true;
                this.combo = 0;
                this.showJudge('miss');
                this.updateUI();
                this.removeNote(note);
            }
        });
    }

    handleInput(type) {
        if (!this.isPlaying || this.isPaused) return;

        const zone = type === 'attack' ? this.attackZone : this.defendZone;
        zone.classList.add('active');
        setTimeout(() => zone.classList.remove('active'), 100);

        this.playSound(type);

        let closestNote = null;
        let closestDiff = Infinity;

        this.notes.forEach(note => {
            if (note.hit || note.missed) return;
            if (note.type !== type) return;

            const timeDiff = Math.abs(this.gameTime - note.time);
            
            if (timeDiff < closestDiff && timeDiff <= 250) {
                closestDiff = timeDiff;
                closestNote = note;
            }
        });

        if (closestNote) {
            closestNote.hit = true;
            this.hitNotes++;

            let judge = '';
            let points = 0;

            if (closestDiff <= 50) {
                judge = 'perfect';
                points = 100;
                this.perfectCount++;
            } else if (closestDiff <= 100) {
                judge = 'great';
                points = 75;
            } else if (closestDiff <= 180) {
                judge = 'good';
                points = 50;
            } else {
                judge = 'good';
                points = 25;
            }

            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }

            const comboBonus = Math.floor(this.combo / 10) * 10;
            this.score += points + comboBonus;

            this.showJudge(judge);
            this.updateUI();
            this.removeNote(closestNote);
        }
    }

    showJudge(type) {
        this.judgeText.className = 'judge-text';
        this.judgeText.textContent = type.toUpperCase();
        
        setTimeout(() => {
            this.judgeText.classList.add(type);
        }, 10);
    }

    removeNote(note) {
        note.element.style.transform = 'scale(1.5)';
        note.element.style.opacity = '0';
        note.element.style.transition = 'all 0.2s ease-out';
        
        setTimeout(() => {
            if (note.element.parentNode) {
                note.element.parentNode.removeChild(note.element);
            }
        }, 200);
    }

    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.comboDisplay.textContent = this.combo;
    }

    pauseGame() {
        this.isPaused = true;
        this.showScreen('pause-screen');
        this.screens.pause.classList.add('overlay');
    }

    resumeGame() {
        this.isPaused = false;
        this.lastTime = performance.now();
        this.screens.pause.classList.remove('overlay');
        this.showScreen('game-screen');
    }

    quitGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.showScreen('start-screen');
    }

    restartGame() {
        this.isPlaying = false;
        this.isPaused = false;
        setTimeout(() => {
            this.startGame();
        }, 100);
    }

    endGame() {
        this.isPlaying = false;

        const accuracy = this.totalNotes > 0 
            ? Math.round((this.hitNotes / this.totalNotes) * 100) 
            : 0;

        this.finalScore.textContent = this.score;
        this.finalMaxCombo.textContent = this.maxCombo;
        this.finalPerfect.textContent = this.perfectCount;
        this.finalAccuracy.textContent = `${accuracy}%`;

        setTimeout(() => {
            this.showScreen('result-screen');
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new RhythmGame();
});
