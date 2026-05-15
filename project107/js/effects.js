class EffectManager {
    constructor() {
        this.effects = [];
        this.floatingTexts = [];
    }

    createHitEffect(x, y, isSpecial = false) {
        for (let i = 0; i < (isSpecial ? 15 : 8); i++) {
            this.effects.push({
                type: 'hit',
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                size: Math.random() * 15 + 5,
                life: 20,
                maxLife: 20,
                color: isSpecial ? '#ffd700' : '#ff6b6b'
            });
        }
    }

    createSpecialEffect(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = Math.random() * 10 + 5;
            this.effects.push({
                type: 'special',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 20 + 10,
                life: 40,
                maxLife: 40,
                color: i % 2 === 0 ? '#00ff88' : '#ffd700'
            });
        }
        
        this.effects.push({
            type: 'wave',
            x: x,
            y: y,
            radius: 10,
            maxRadius: 200,
            life: 30,
            maxLife: 30
        });
    }

    createFloatingText(x, y, text, color = '#fff') {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            life: 60,
            maxLife: 60,
            vy: -2
        });
    }

    update() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life--;

            if (effect.type === 'hit' || effect.type === 'special') {
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vy += 0.5;
                effect.size *= 0.95;
            } else if (effect.type === 'wave') {
                effect.radius += (effect.maxRadius - effect.radius) * 0.15;
            }

            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.life--;
            text.y += text.vy;
            text.vy *= 0.98;

            if (text.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.effects.forEach(effect => {
            const alpha = effect.life / effect.maxLife;
            
            if (effect.type === 'hit' || effect.type === 'special') {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = effect.color;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (effect.type === 'wave') {
                ctx.save();
                ctx.globalAlpha = alpha * 0.5;
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        });

        this.floatingTexts.forEach(text => {
            const alpha = text.life / text.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = text.color;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text.text, text.x, text.y);
            ctx.restore();
        });
    }
}