/**
 * UIManager.js
 * Manages UI transitions and user interactions.
 */

export class UIManager {
    constructor() {
        this.screens = {
            gateway: document.getElementById('screen-gateway'),
            selection: document.getElementById('screen-selection'),
            immersion: document.getElementById('screen-immersion')
        };

        this.controls = document.getElementById('immersion-controls');
        this.idleTimer = null;
    }

    /**
     * Switch to a specific screen
     * @param {string} screenName 
     */
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(el => {
            el.classList.remove('active');
            setTimeout(() => {
                if (!el.classList.contains('active')) el.style.display = 'none';
            }, 1000);
        });

        // Show target screen
        const target = this.screens[screenName];
        if (target) {
            target.style.display = 'flex';
            // Force reflow
            void target.offsetWidth;
            target.classList.add('active');
        }
    }

    /**
     * Initialize idle detection for immersion mode
     */
    initIdleDetection() {
        document.addEventListener('mousemove', () => {
            this.showControls();
            this.resetIdleTimer();
        });

        // Initial hide
        this.resetIdleTimer();
    }

    showControls() {
        this.controls.classList.remove('hidden');
        document.body.style.cursor = 'default';
    }

    hideControls() {
        this.controls.classList.add('hidden');
        document.body.style.cursor = 'none';
    }

    resetIdleTimer() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.hideControls();
        }, 3000); // 3 seconds idle
    }

    /**
     * Generate UI controls for shader uniforms
     * @param {Object} shaderData 
     * @param {Function} onUpdateCallback 
     */
    generateShaderControls(shaderData, onUpdateCallback) {
        const container = document.getElementById('shader-controls');
        if (!container) return;

        container.innerHTML = ''; // Clear existing controls

        if (!shaderData.uniforms) return;

        for (const [key, config] of Object.entries(shaderData.uniforms)) {
            if (config.type === 'f') {
                const group = document.createElement('div');
                group.className = 'slider-group';

                const labelRow = document.createElement('div');
                labelRow.className = 'slider-label';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = config.name || key;

                const valueSpan = document.createElement('span');
                valueSpan.textContent = config.value.toFixed(2);

                labelRow.appendChild(nameSpan);
                labelRow.appendChild(valueSpan);

                const input = document.createElement('input');
                input.type = 'range';
                input.min = config.min;
                input.max = config.max;
                input.step = (config.max - config.min) / 100;
                input.value = config.value;

                input.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    valueSpan.textContent = val.toFixed(2);
                    if (onUpdateCallback) {
                        onUpdateCallback(key, val);
                    }
                });

                group.appendChild(labelRow);
                group.appendChild(input);
                container.appendChild(group);
            }
        }
    }
}
