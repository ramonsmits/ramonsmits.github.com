class PlasmaEffect {
    static RENDER_WIDTH = 320;
    static RENDER_HEIGHT = 200;
    static SIN_LUT_SIZE = 1024;
    static PALETTE_SIZE = 256;

    constructor(container) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas(container);

        this.sinLUT = this.createSinLUT();
        this.paletteParams = this.generatePaletteParams();
        this.palette = this.createPalette();
        this.params = this.generateAnimationParams();

        this.imageData = new ImageData(PlasmaEffect.RENDER_WIDTH, PlasmaEffect.RENDER_HEIGHT);
        this.buffer = this.imageData.data;
        this.time = 0;

        this.start();
    }

    setupCanvas(container) {
        this.canvas.width = PlasmaEffect.RENDER_WIDTH;
        this.canvas.height = PlasmaEffect.RENDER_HEIGHT;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        container.appendChild(this.canvas);
    }

    createSinLUT() {
        const lut = new Float32Array(PlasmaEffect.SIN_LUT_SIZE);
        for (let i = 0; i < PlasmaEffect.SIN_LUT_SIZE; i++) {
            lut[i] = Math.sin((i / PlasmaEffect.SIN_LUT_SIZE) * Math.PI * 2);
        }
        return lut;
    }

    fastSin(x) {
        const index = ((x % (Math.PI * 2)) / (Math.PI * 2) * PlasmaEffect.SIN_LUT_SIZE) >>> 0;
        return this.sinLUT[index % PlasmaEffect.SIN_LUT_SIZE];
    }

    generatePaletteParams() {
        // Dark grayscale palette
        const BASE_FREQ = Math.PI * 2;
        const freq = BASE_FREQ * (0.8 + Math.random() * 0.4);
        const phase = Math.random() * Math.PI * 2;
        const range = 25 + Math.random() * 20;  // Reduced range for subtler variation
        const base = 30 + Math.random() * 20;   // Dark base (30-50)
        return {
            rFreq: freq,
            gFreq: freq,
            bFreq: freq,
            rPhase: phase,
            gPhase: phase,
            bPhase: phase,
            rRange: range,
            gRange: range,
            bRange: range,
            rBase: base,
            gBase: base,
            bBase: base
        };
    }

    createPalette() {
        const palette = new Array(PlasmaEffect.PALETTE_SIZE);
        for (let i = 0; i < PlasmaEffect.PALETTE_SIZE; i++) {
            const t = i / PlasmaEffect.PALETTE_SIZE;
            const r = (this.fastSin(t * this.paletteParams.rFreq + this.paletteParams.rPhase)
                * this.paletteParams.rRange + this.paletteParams.rBase) | 0;
            const g = (this.fastSin(t * this.paletteParams.gFreq + this.paletteParams.gPhase)
                * this.paletteParams.gRange + this.paletteParams.gBase) | 0;
            const b = (this.fastSin(t * this.paletteParams.bFreq + this.paletteParams.bPhase)
                * this.paletteParams.bRange + this.paletteParams.bBase) | 0;
            palette[i] = [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
        }
        return palette;
    }

    generateAnimationParams() {
        return {
            scale1: 2 + Math.random() * 3,
            scale2: 2 + Math.random() * 3,
            speed: 0.015 + Math.random() * 0.01,
            colorSpeed: 0.2 + Math.random() * 0.2,
        };
    }

    drawPlasma() {
        this.time += this.params.speed;
        let idx = 0;

        for (let y = 0; y < PlasmaEffect.RENDER_HEIGHT; y++) {
            const yNorm = y / PlasmaEffect.RENDER_HEIGHT * 2 - 1;

            for (let x = 0; x < PlasmaEffect.RENDER_WIDTH; x++) {
                const xNorm = x / PlasmaEffect.RENDER_WIDTH * 2 - 1;

                const v1 = this.fastSin(xNorm * this.params.scale1 + this.time);
                const v2 = this.fastSin(yNorm * this.params.scale2 + this.time * 0.5);
                const v3 = this.fastSin(Math.sqrt(xNorm * xNorm + yNorm * yNorm) * 3 + this.time);

                const plasma = ((v1 + v2 + v3) / 3 + 1) * 127;
                const colorIndex = ((plasma + this.time * this.params.colorSpeed * 50) & 255);
                const color = this.palette[colorIndex];

                this.buffer[idx++] = color[0];
                this.buffer[idx++] = color[1];
                this.buffer[idx++] = color[2];
                this.buffer[idx++] = 255;
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);
        requestAnimationFrame(() => this.drawPlasma());
    }

    start() {
        requestAnimationFrame(() => this.drawPlasma());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('plasma-bg');
    if (container) {
        new PlasmaEffect(container);
    }
});
