class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mul(s) {
        return new Vector(this.x * s, this.y * s);
    }

    div(s) {
        return new Vector(this.x / s, this.y / s);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m === 0) return new Vector(0, 0);
        return this.div(m);
    }

    limit(max) {
        if (this.mag() > max) {
            return this.normalize().mul(max);
        }
        return this;
    }

    dist(v) {
        return this.sub(v).mag();
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    static random() {
        const angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
}
