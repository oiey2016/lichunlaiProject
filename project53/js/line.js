class LineManager {
    constructor() {
        this.lines = [];
        this.currentLine = null;
        this.isDrawing = false;
        this.totalLength = 0;
    }
    
    startDrawing(x, y) {
        if (this.totalLength >= Config.line.maxLength) return;
        
        this.isDrawing = true;
        this.currentLine = {
            points: [{ x, y }],
            length: 0
        };
    }
    
    continueDrawing(x, y) {
        if (!this.isDrawing || !this.currentLine) return;
        
        const lastPoint = this.currentLine.points[this.currentLine.points.length - 1];
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        
        if (segmentLength > 5) {
            const remainingLength = Config.line.maxLength - this.totalLength;
            if (this.currentLine.length + segmentLength <= remainingLength) {
                this.currentLine.points.push({ x, y });
                this.currentLine.length += segmentLength;
            }
        }
    }
    
    endDrawing() {
        if (this.currentLine && this.currentLine.points.length > 1) {
            this.lines.push(this.currentLine);
            this.totalLength += this.currentLine.length;
        }
        this.isDrawing = false;
        this.currentLine = null;
    }
    
    getAllSegments() {
        const segments = [];
        
        for (const line of this.lines) {
            for (let i = 0; i < line.points.length - 1; i++) {
                segments.push({
                    start: line.points[i],
                    end: line.points[i + 1]
                });
            }
        }
        
        if (this.currentLine && this.currentLine.points.length > 1) {
            for (let i = 0; i < this.currentLine.points.length - 1; i++) {
                segments.push({
                    start: this.currentLine.points[i],
                    end: this.currentLine.points[i + 1]
                });
            }
        }
        
        return segments;
    }
    
    clear() {
        this.lines = [];
        this.currentLine = null;
        this.isDrawing = false;
        this.totalLength = 0;
    }
    
    getRemainingLength() {
        return Config.line.maxLength - this.totalLength;
    }
}
