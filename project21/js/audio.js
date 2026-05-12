class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterGain = null;
        this.bgMusicPlaying = false;
        this.bgMusicOscillators = [];
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playJump() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    playScore() {
        if (!this.initialized) return;
        
        const notes = [523.25, 659.25, 783.99];
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.frequency.value = freq;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                osc.start();
                osc.stop(this.audioContext.currentTime + 0.2);
            }, i * 80);
        });
    }
    
    playGameOver() {
        if (!this.initialized) return;
        
        const notes = [392, 349.23, 293.66, 261.63];
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.frequency.value = freq;
                osc.type = 'sawtooth';
                
                gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                osc.start();
                osc.stop(this.audioContext.currentTime + 0.3);
            }, i * 150);
        });
    }
    
    startBackgroundMusic() {
        if (!this.initialized || this.bgMusicPlaying) return;
        
        this.bgMusicPlaying = true;
        this.playBgMusicLoop();
    }
    
    playBgMusicLoop() {
        if (!this.bgMusicPlaying) return;
        
        const melody = [
            { note: 261.63, duration: 0.4 },
            { note: 329.63, duration: 0.4 },
            { note: 392.00, duration: 0.4 },
            { note: 523.25, duration: 0.8 },
            { note: 392.00, duration: 0.4 },
            { note: 523.25, duration: 1.2 },
        ];
        
        let delay = 0;
        melody.forEach(({ note, duration }) => {
            setTimeout(() => {
                if (!this.bgMusicPlaying) return;
                
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.frequency.value = note;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                osc.start();
                osc.stop(this.audioContext.currentTime + duration);
            }, delay * 1000);
            
            delay += duration;
        });
        
        setTimeout(() => {
            if (this.bgMusicPlaying) {
                this.playBgMusicLoop();
            }
        }, delay * 1000 + 500);
    }
    
    stopBackgroundMusic() {
        this.bgMusicPlaying = false;
    }
}

const audioSystem = new AudioSystem();
