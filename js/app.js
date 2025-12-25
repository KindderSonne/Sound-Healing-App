/**
 * app.js
 * Main application controller.
 */

import { BinauralSynth } from './audio/BinauralSynth.js';
import { VisualRenderer } from './visual/VisualRenderer.js';
import { BreathGuide } from './ui/BreathGuide.js';
import { UIManager } from './ui/UIManager.js';

class App {
    constructor() {
        this.audio = new BinauralSynth();
        this.visual = new VisualRenderer('visual-container');
        this.breath = new BreathGuide('breath-guide');
        this.ui = new UIManager();

        this.isBreathingEnabled = false;
        this.currentMode = null; // 'guided' or 'focus'
    }

    init() {
        this.visual.init();

        // Setup shader change callback
        this.visual.onShaderChanged = (shaderName, shaderData) => {
            this.ui.generateShaderControls(shaderData, (key, value) => {
                this.visual.updateUniform(key, value);
            });
        };

        // Initialize controls for default shader
        this.visual.setShader('neonRings');

        this.visual.start(); // Start visual loop immediately for background

        this.setupEventListeners();
        this.ui.showScreen('gateway');
    }

    setupEventListeners() {
        // Gateway Screen
        document.getElementById('btn-guided').addEventListener('click', () => {
            this.currentMode = 'guided';
            this.ui.showScreen('selection');
            document.getElementById('selection-guided').style.display = 'block';
            document.getElementById('selection-focus').style.display = 'none';
        });

        document.getElementById('btn-focus').addEventListener('click', () => {
            this.currentMode = 'focus';
            this.ui.showScreen('selection');
            document.getElementById('selection-guided').style.display = 'none';
            document.getElementById('selection-focus').style.display = 'flex';
        });

        document.getElementById('breath-toggle').addEventListener('change', (e) => {
            this.isBreathingEnabled = e.target.checked;
        });

        // Selection Screen Back Button
        document.getElementById('btn-back-selection').addEventListener('click', () => {
            this.ui.showScreen('gateway');
        });

        // Selection Screen (Focus Mode)
        document.getElementById('btn-enter-void').addEventListener('click', () => {
            this.startImmersion();
        });

        // Immersion Controls
        document.getElementById('btn-exit').addEventListener('click', () => {
            this.stopImmersion();
        });

        document.getElementById('btn-fullscreen').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Real-time Controls
        document.getElementById('focus-hz').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('hz-display').textContent = val + ' Hz';
            if (this.audio.isPlaying) {
                this.audio.update(200, val); // Base 200Hz fixed for now
            }
        });

        // Shader Selection
        document.querySelectorAll('.shader-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.shader-preview').forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                const shader = e.currentTarget.dataset.shader;

                const iframe = document.getElementById('external-shader-frame');
                const visualContainer = document.getElementById('visual-container');
                const controlsContainer = document.getElementById('shader-controls');

                if (shader === 'rainForest') {
                    // Handle External Shader
                    this.visual.stop();
                    visualContainer.style.display = 'none';
                    iframe.style.display = 'block';
                    iframe.src = 'shaders/rain_forest_v3.html';

                    // Clear internal shader controls
                    controlsContainer.innerHTML = '<div style="color: #888; font-size: 0.8rem; text-align: center;">Interactive Mouse Control Enabled</div>';
                } else {
                    // Handle Internal Shader
                    iframe.style.display = 'none';
                    iframe.src = ''; // Unload iframe to save resources
                    visualContainer.style.display = 'block';

                    this.visual.setShader(shader);
                    this.visual.start();
                }
            });
        });
    }

    startImmersion() {
        this.ui.showScreen('immersion');
        this.ui.initIdleDetection();

        // Start Audio
        if (this.currentMode === 'focus') {
            const beatFreq = parseFloat(document.getElementById('focus-hz').value);
            this.audio.play(200, beatFreq);
        }

        // Start Breath
        if (this.isBreathingEnabled) {
            this.breath.setActive(true);
        }
    }

    stopImmersion() {
        this.audio.stop();
        this.breath.setActive(false);
        this.ui.showScreen('selection');

        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
